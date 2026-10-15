import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { initialize } from '../src/lib/schema';
import { createLearningService } from '../src/lib/domain';
import { makeRoutine as makeCurrentRoutine, routineScore, routineRecord } from '../src/lib/routine';
import { saveRoutine } from '../src/lib/routine-store';
import {
  levelLessons,
  learningJourney,
  integration,
  reinforcement,
  courseRoute,
} from '../src/lib/course-route';
import { saveLesson } from '../src/lib/lesson-store';
import { classRevision } from '../src/lib/lessons';
import { courseEvidence, checkLessonAccess } from '../src/lib/course-store';
import { tables, merge, validate } from '../src/lib/browser/merge';
const makeRoutine = (
  mode: 'vocabulary' | 'grammar' | 'reading',
  level: string,
  block: number,
  pt?: boolean,
) => makeCurrentRoutine(mode, level, block, pt, { edition: 1 });
for (const pt of [false, true])
  test(`All CEFR starters have native choices, Spanish feedback and stable sentence blocks (${pt ? 'PT' : 'EN'})`, () => {
    for (const level of ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'])
      for (let block = 0; block < 12; block++)
        for (const mode of ['vocabulary', 'grammar', 'reading'] as const) {
          const set = makeRoutine(mode, level, block, pt);
          assert.ok(set.rounds.length >= 2);
          for (const q of set.rounds) {
            assert.ok(q.spanish && q.why && q.solution);
            assert.ok(q.choices.length >= 3);
            if (mode === 'grammar')
              assert.equal(
                q.choices.join(' ').split(' ').sort().join('|'),
                q.solution.split(' ').sort().join('|'),
              );
            else assert.ok(q.choices.includes(q.solution));
          }
          assert.equal(
            routineScore(
              set,
              set.rounds.map((r) => r.solution),
            ),
            set.rounds.length,
          );
          if (mode === 'reading') assert.ok(set.text && set.text.length < 600);
        }
    assert.match(makeRoutine('grammar', 'A1', 0, pt).rounds[0].solution, pt ? /Eu sou/ : /I am/);
    assert.match(
      makeRoutine('grammar', 'C2', 0, pt).rounds[0].solution,
      pt ? /Nem toda/ : /Not every/,
    );
  });
function setup() {
  const db = new DatabaseSync(':memory:');
  initialize(db);
  const service = createLearningService({
    db: () => db,
    transaction: (f) => f(),
    uuid: randomUUID,
  });
  const state = service.snapshot();
  const plan = db.prepare('SELECT id FROM plans WHERE day=?').get(state.day)!.id as string;
  return { db, service, plan };
}
function input(mode: 'vocabulary' | 'grammar' | 'reading', bad = false, helpUsed = false) {
  const set = makeRoutine(mode, 'A2', 0);
  return {
    id: randomUUID(),
    mode,
    level: 'A2',
    block: 0,
    edition: 1,
    answers: set.rounds.map((r) =>
      bad
        ? mode === 'grammar'
          ? [...r.choices].reverse().join(' ')
          : r.choices.find((c) => c !== r.solution)!
        : r.solution,
    ),
    seconds: 20,
    helpUsed,
  };
}
test('Starters save once, reject locked levels and integrate with reading/vocabulary/classes/writing in one block', () => {
  const { db, service, plan } = setup();
  try {
    assert.throws(
      () => saveRoutine(db, { ...input('vocabulary'), level: 'B1' }, plan),
      /bloqueado/,
    );
    assert.throws(() => saveRoutine(db, { ...input('reading'), block: 1 }, plan), /bloqueado/);
    const v = input('vocabulary');
    saveRoutine(db, v, plan);
    assert.equal(saveRoutine(db, v, plan).repeated, true);
    assert.equal(db.prepare('SELECT count(*) AS n FROM results').get()!.n, 1);
    saveRoutine(db, input('reading'), plan);
    let state = service.snapshot();
    assert.equal(courseRoute(state).level, 'A2');
    const first = levelLessons('A2').slice(0, 4);
    let requirements = integration(state, first);
    assert.equal(requirements.find((r) => r.id === 'reading')!.done, true);
    assert.equal(requirements.find((r) => r.id === 'vocabulary')!.done, true);
    assert.equal(requirements.find((r) => r.id === 'classes')!.done, false);
    for (const lesson of first)
      saveLesson(
        db,
        {
          id: randomUUID(),
          lessonId: lesson.id,
          revision: classRevision,
          answers: lesson.checks.map((q) => q.answer),
          seconds: 20,
        },
        plan,
      );
    state = service.snapshot();
    assert.equal(learningJourney(state).block, 0);
    const activity = state.plan.activities.find((a) => a.kind === 'writing' && !a.completed_at)!;
    const session = service.startSession(activity.id);
    service.finishActivity({
      activityId: activity.id,
      sessionId: session.id as string,
      seconds: 0,
      answers: {},
      text: 'I study after work because I want to travel.',
    });
    state = service.snapshot();
    assert.equal(learningJourney(state).block, 1);
    assert.ok(state.courseCheckpoints?.some((c) => c.id === `block:${first[0].id}`));
    assert.equal(state.results.filter((r) => r.activity_id.startsWith('routine:')).length, 2);
    // Reading, words and sentences alone never promote an entire level.
    assert.equal(courseRoute(state).level, 'A2');
    const backup = validate({
      version: 1,
      workspace: 'en',
      data: Object.fromEntries(tables.map((t) => [t, db.prepare(`SELECT * FROM ${t}`).all()])),
    });
    const merged = merge(
      validate({
        version: 1,
        workspace: 'en',
        data: Object.fromEntries(tables.map((t) => [t, []])),
      }),
      backup,
    );
    assert.equal(
      merged.data.results.filter((r) => String(r.activity_id).startsWith('routine:')).length,
      2,
    );
    assert.ok(merged.data.course_checkpoints.some((r) => r.id === `block:${first[0].id}`));
  } finally {
    db.close();
  }
});
test('Objective scores are recomputed, mistakes retained, and assisted practice cannot clear independent evidence', () => {
  const { db, service, plan } = setup();
  try {
    const bad = input('vocabulary', true);
    const stored = saveRoutine(db, { ...bad, correct: 3 }, plan);
    assert.equal(stored.correct, 0);
    saveRoutine(db, input('vocabulary', true), plan);
    assert.ok(reinforcement(service.snapshot(), 'A2').some((r) => r.id === 'reinforce:vocabulary'));
    saveRoutine(db, input('vocabulary', false, true), plan);
    assert.ok(reinforcement(service.snapshot(), 'A2').some((r) => r.id === 'reinforce:vocabulary'));
    assert.equal(
      integration(service.snapshot(), levelLessons('A2').slice(0, 4)).find(
        (r) => r.id === 'vocabulary',
      )!.done,
      false,
    );
    saveRoutine(db, input('vocabulary'), plan);
    assert.equal(
      reinforcement(service.snapshot(), 'A2').some((r) => r.id === 'reinforce:vocabulary'),
      false,
    );
    assert.equal(service.snapshot().mistakes.length, 6);
    saveRoutine(db, input('grammar', true), plan);
    saveRoutine(db, input('grammar', true), plan);
    assert.throws(() => checkLessonAccess(db, levelLessons('A2')[0].id), /reforzar gramática/);
    saveRoutine(db, input('grammar'), plan);
    assert.doesNotThrow(() => checkLessonAccess(db, levelLessons('A2')[0].id));
    saveRoutine(db, input('reading', true), plan);
    saveRoutine(db, input('reading', true), plan);
    assert.ok(reinforcement(service.snapshot(), 'A2').some((r) => r.id === 'reinforce:reading'));
    saveRoutine(db, input('reading', false, true), plan);
    assert.ok(reinforcement(service.snapshot(), 'A2').some((r) => r.id === 'reinforce:reading'));
    assert.equal(
      integration(service.snapshot(), levelLessons('A2').slice(0, 4)).find(
        (r) => r.id === 'reading',
      )!.done,
      false,
    );
    saveRoutine(db, input('reading'), plan);
    assert.equal(
      reinforcement(service.snapshot(), 'A2').some((r) => r.id === 'reinforce:reading'),
      false,
    );
    assert.ok(service.snapshot().results.filter((r) => routineRecord(r)).length >= 7);
  } finally {
    db.close();
  }
});

test('A paused sentence keeps its selected blocks and checked first answer through a reload', async () => {
  const memory = new Map<string, string>();
  const previous = globalThis.localStorage;
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (k: string) => memory.get(k) || null,
      setItem: (k: string, v: string) => memory.set(k, v),
    },
  });
  try {
    const { readRoutineDraft, writeRoutineDraft, clearRoutineDraft } = await import(
      '../src/lib/browser/routine-draft'
    );
    const set = makeRoutine('grammar', 'A2', 0);
    const draft = {
      id: randomUUID(),
      mode: 'grammar' as const,
      level: 'A2',
      block: 0,
      edition: 1 as const,
      answers: [],
      choice: '',
      picked: [0],
      checked: false,
      helpUsed: false,
      seconds: 16,
    };
    writeRoutineDraft(draft);
    assert.deepEqual(readRoutineDraft(), draft);
    clearRoutineDraft(randomUUID());
    assert.deepEqual(readRoutineDraft(), draft);
    clearRoutineDraft(draft.id);
    assert.equal(readRoutineDraft(), undefined);
    writeRoutineDraft({ ...draft, picked: [0, 0] });
    assert.equal(readRoutineDraft(), undefined);
  } finally {
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: previous });
  }
});

for (const pt of [false, true])
  test(`Contextual edition 2 has six valid varied exercises per session (${pt ? 'PT' : 'EN'})`, () => {
    for (const level of ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'])
      for (const mode of ['vocabulary', 'grammar', 'reading'] as const) {
        const first = makeCurrentRoutine(mode, level, 0, pt),
          second = makeCurrentRoutine(mode, level, 0, pt, { edition: 2, variant: 1 });
        assert.equal(first.edition, 2);
        assert.equal(first.rounds.length, 6);
        assert.notDeepEqual(
          first.rounds.map((q) => q.id),
          second.rounds.map((q) => q.id),
        );
        for (const q of first.rounds) {
          assert.ok(q.context || q.text);
          assert.ok(q.explanationNative && q.why && q.spanish);
          if (mode === 'grammar')
            assert.equal(
              q.choices.join(' ').split(' ').sort().join('|'),
              q.solution.split(' ').sort().join('|'),
            );
          else assert.ok(q.choices.includes(q.solution));
        }
        assert.equal(
          routineScore(
            first,
            first.rounds.map((q) => q.solution),
          ),
          6,
        );
        assert.deepEqual(first, makeCurrentRoutine(mode, level, 0, pt, { edition: 2, variant: 0 }));
      }
  });
test('Edition 2 stores variant, enforces objective answers and preserves edition 1 evidence', () => {
  const { db, service, plan } = setup();
  try {
    const legacy = input('vocabulary');
    saveRoutine(db, legacy, plan);
    const set = makeCurrentRoutine('reading', 'A2', 0, undefined, { edition: 2, variant: 2 });
    const x = {
      id: randomUUID(),
      mode: 'reading',
      level: 'A2',
      block: 0,
      edition: 2,
      variant: 2,
      answers: set.rounds.map((q) => q.solution),
      seconds: 30,
    };
    assert.equal(saveRoutine(db, x, plan).correct, 6);
    assert.equal(saveRoutine(db, x, plan).repeated, true);
    assert.throws(() => saveRoutine(db, { ...x, variant: 3 }, plan), /otra actividad/);
    const result = service.snapshot().results.find((r) => r.activity_id === `routine:${x.id}`)!;
    assert.equal(routineRecord(result)?.variant, 2);
    assert.equal(routineRecord(result)?.edition, 2);
    assert.ok(service.snapshot().results.find((r) => r.activity_id === `routine:${legacy.id}`));
    assert.equal(
      integration(service.snapshot(), levelLessons('A2').slice(0, 4)).find(
        (r) => r.id === 'reading',
      )?.done,
      true,
    );
    assert.throws(
      () =>
        saveRoutine(
          db,
          { ...x, id: randomUUID(), answers: ['invented', ...x.answers.slice(1)] },
          plan,
        ),
      /opciones/,
    );
  } finally {
    db.close();
  }
});
test('Changing activity preserves an unrelated draft and resumes legacy content reproducibly', async () => {
  const previous = globalThis.localStorage,
    memory = new Map<string, string>();
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (k: string) => memory.get(k) ?? null,
      setItem: (k: string, v: string) => memory.set(k, v),
    },
  });
  try {
    const { readRoutineDraft, writeRoutineDraft, clearRoutineDraft } = await import(
      '../src/lib/browser/routine-draft'
    );
    const base = {
      id: randomUUID(),
      mode: 'grammar' as const,
      level: 'A2',
      block: 0,
      edition: 1 as const,
      answers: [],
      choice: '',
      picked: [0],
      checked: false,
      helpUsed: false,
      seconds: 2,
    };
    memory.set('routine-draft:v1', JSON.stringify(base));
    assert.equal(readRoutineDraft()?.edition, 1);
    const newer = {
      ...base,
      id: randomUUID(),
      mode: 'reading' as const,
      edition: 2 as const,
      variant: 3,
      picked: [],
    };
    writeRoutineDraft(newer);
    assert.equal(readRoutineDraft({ mode: 'grammar' })?.id, base.id);
    assert.equal(readRoutineDraft({ mode: 'reading' })?.id, newer.id);
    clearRoutineDraft(newer.id);
    assert.equal(readRoutineDraft()?.id, base.id);
    assert.equal(
      makeCurrentRoutine(base.mode, base.level, base.block, undefined, { edition: base.edition })
        .rounds.length,
      3,
    );
  } finally {
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: previous });
  }
});
