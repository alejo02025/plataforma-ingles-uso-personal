import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { initialize } from '../src/lib/schema';
import { createLearningService } from '../src/lib/domain';
import { makeRoutine, routineScore, routineRecord } from '../src/lib/routine';
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
