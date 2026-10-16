import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { initialize } from '../src/lib/schema';
import { createLearningService } from '../src/lib/domain';
import {
  makeRoutine,
  routineVerdict,
  routineEvaluation,
  normalizeProduction,
  validRoutineResponse,
} from '../src/lib/routine';
import { saveRoutine } from '../src/lib/routine-store';
import { saveLesson } from '../src/lib/lesson-store';
import { learningJourney, passedLesson, levelLessons, integration } from '../src/lib/course-route';
import { classRevision } from '../src/lib/lessons';
import { spanishCopy, nativeCopy } from '../src/lib/study-copy';
import { englishClasses, portugueseClasses } from '../src/locales/lessons/catalog';
import { englishTenses, portugueseTenses } from '../src/locales/learning/tense-reference';
import { grammarReference } from '../src/locales/learning/grammar-reference';
import { mistakeReview, pendingProductions } from '../src/lib/mistake-review';
import type { Snapshot } from '../src/lib/types';
import { makeStudyDay, studyTaskDone } from '../src/lib/daily-study';
import { voiceDocumentId } from '../src/lib/voice';
import { writingChallenge } from '../src/locales/learning/writing-challenges';

for (const pt of [false, true]) {
  test(`3.0 bounded production: all levels have consistent models, Spanish support and real format diversity (${pt ? 'PT' : 'EN'})`, () => {
    for (const level of ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'])
      for (const variant of [0, 1]) {
        const set = makeRoutine('grammar', level, 0, pt, { edition: 3, variant });
        assert.equal(set.edition, 3);
        assert.equal(set.rounds.length, 6);
        assert.deepEqual([...new Set(set.rounds.map((q) => q.format))].sort(), [
          'choice',
          'correct',
          'gap',
          'tiles',
          'transform',
        ]);
        for (const q of set.rounds) {
          assert.ok(
            q.context &&
              q.contextSpanish &&
              q.why &&
              q.explanationNative &&
              q.spanish &&
              q.solutionSpanish,
          );
          assert.equal(routineVerdict(q, q.solution), 'correct', `${pt} ${q.id}`);
          assert.equal(validRoutineResponse(q, 'grammar', q.solution), true);
          for (const alternative of q.accepted || [])
            assert.equal(routineVerdict(q, alternative), 'correct', `${q.id}: ${alternative}`);
          if (q.format === 'correct') assert.equal(routineVerdict(q, q.source!), 'incorrect');
          if (q.format === 'transform')
            assert.equal(routineVerdict(q, 'Another sentence needing human review.'), 'unverified');
        }
        assert.notEqual(
          set.rounds[0].context,
          set.rounds.at(-1)!.context,
          'Last item must use a different authored situation',
        );
        assert.deepEqual(
          routineEvaluation(
            set,
            set.rounds.map((q) => q.solution),
          ),
          { correct: 6, total: 6, unverified: 0, verdicts: Array(6).fill('correct') },
        );
      }
  });
  test(`All class goals, examples, production prompts and corrected models have actual Spanish support (${pt ? 'PT' : 'EN'})`, () => {
    for (const l of pt ? portugueseClasses : englishClasses)
      for (const text of [l.explanation, l.tip, ...l.checks.map((q) => q.why)])
        if (text) assert.ok(nativeCopy(text, pt), `${l.id}: missing native explanation: ${text}`);
    for (const l of pt ? portugueseClasses : englishClasses)
      for (const text of [
        l.goal,
        ...l.examples,
        l.practice,
        l.model,
        ...l.checks.map((q) => q.correction),
      ])
        assert.ok(spanishCopy(text, pt), `${l.id}: ${text}`);
    for (const text of [
      ...(pt ? portugueseTenses : englishTenses).flatMap((t) => t.examples),
      ...grammarReference.flatMap((r) => (pt ? r.modelPT : r.modelEN)),
    ])
      assert.ok(spanishCopy(text, pt), text);
    assert.equal(
      spanishCopy('An unknown sentence from a private PDF.', pt),
      null,
      'Uploaded prose must never receive a generic translation',
    );
  });
}

test('Production comparison accepts contractions and authored word orders while preserving negation, accents and scope', () => {
  for (const pt of [false, true]) {
    const recall = makeRoutine('vocabulary', 'A2', 0, pt, { edition: 3, variant: 0 }).rounds[3];
    assert.equal(routineVerdict(recall, recall.solution), 'correct');
    assert.equal(
      routineVerdict(recall, 'a plausible alternative needing review'),
      'unverified',
      'An unlisted synonym in an open vocabulary gap must not become a confirmed error',
    );
    assert.equal(
      recall.why.includes('Las otras opciones significan'),
      false,
      'Written recall feedback must not refer to choice options that were never shown',
    );
  }
  const set = makeRoutine('grammar', 'A2', 0, false, { edition: 3, variant: 0 });
  assert.equal(routineVerdict(set.rounds[0], 'Yesterday I went to work.'), 'correct');
  assert.equal(routineVerdict(set.rounds[2], 'I didn’t go to work yesterday!'), 'correct');
  assert.notEqual(normalizeProduction('não'), normalizeProduction('nao'));
  assert.notEqual(normalizeProduction('Not all proposals'), normalizeProduction('No proposals'));
  const pt = makeRoutine('grammar', 'A2', 0, true, { edition: 3, variant: 1 });
  assert.equal(
    routineVerdict(pt.rounds[2], 'Você vai viajar amanhã'),
    'unverified',
    'Written pt-BR yes/no question cannot silently lose its question mark',
  );
});
function database() {
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
test('3.0 saves first answers, help and unknown productions without inventing grades or erasing legacy attempts', () => {
  const { db, service, plan } = database();
  try {
    const legacy = makeRoutine('grammar', 'A2', 0, false, { edition: 2, variant: 0 });
    saveRoutine(
      db,
      {
        id: randomUUID(),
        mode: 'grammar',
        level: 'A2',
        block: 0,
        edition: 2,
        variant: 0,
        answers: legacy.rounds.map((q) => q.solution),
        seconds: 10,
      },
      plan,
    );
    const set = makeRoutine('grammar', 'A2', 0, false, { edition: 3, variant: 0 });
    const answers = set.rounds.map((q) => q.solution);
    answers[2] = 'I did not commute yesterday.';
    answers[1] = 'go';
    const input = {
      id: randomUUID(),
      mode: 'grammar',
      level: 'A2',
      block: 0,
      edition: 3,
      variant: 0,
      answers,
      seconds: 20,
    };
    const saved = saveRoutine(db, { ...input, correct: 99 }, plan);
    assert.equal(saved.correct, 4);
    assert.equal(saved.total, 5);
    assert.equal(saved.unverified, 1);
    assert.equal(saved.feedback[2].correct, null);
    const repeat = saveRoutine(db, { ...input, answers: set.rounds.map((q) => q.solution) }, plan);
    assert.equal(repeat.correct, 4);
    assert.equal(repeat.unverified, 1);
    assert.equal(repeat.repeated, true);
    assert.equal(
      service.snapshot().mistakes.length,
      1,
      'Unknown open answer is not a confirmed mistake',
    );
    assert.equal(pendingProductions(service.snapshot()).length, 1);
    assert.equal(service.snapshot().results.length, 2, 'Historical edition remains');
    const helped = saveRoutine(
      db,
      {
        ...input,
        id: randomUUID(),
        answers: set.rounds.map((q) => q.solution),
        support: [{ questionId: set.rounds[0].id, kind: 'hint', step: 1 }],
      },
      plan,
    );
    assert.equal(helped.helpUsed, true, 'A stored hint cannot be submitted as an unaided attempt');
    assert.throws(
      () =>
        saveRoutine(
          db,
          {
            ...input,
            id: randomUUID(),
            support: [{ questionId: 'foreign-item', kind: 'hint', step: 1 }],
          },
          plan,
        ),
      /otro ejercicio/,
    );
  } finally {
    db.close();
  }
});
test('Class help is recorded separately; only independent attempts unlock new lessons and prior passes remain', () => {
  const { db, service, plan } = database();
  try {
    const lesson = levelLessons('A2')[0];
    const request = {
      id: randomUUID(),
      lessonId: lesson.id,
      revision: classRevision,
      answers: lesson.checks.map((q) => q.answer),
      seconds: 10,
    };
    saveLesson(
      db,
      {
        ...request,
        helpUsed: false,
        support: [{ questionId: `${lesson.id}:0`, kind: 'theory', step: 1 }],
      },
      plan,
    );
    assert.equal(!!passedLesson(service.snapshot(), lesson.id), false);
    saveLesson(db, { ...request, id: randomUUID() }, plan);
    assert.equal(!!passedLesson(service.snapshot(), lesson.id), true);
    const preserved = JSON.stringify(service.snapshot().courseCheckpoints);
    saveLesson(db, { ...request, id: randomUUID(), helpUsed: true }, plan);
    assert.equal(!!passedLesson(service.snapshot(), lesson.id), true);
    assert.equal(JSON.stringify(service.snapshot().courseCheckpoints), preserved);
  } finally {
    db.close();
  }
});
test('Self-rated memory reviews schedule practice but cannot substitute for objective block evidence', () => {
  const { db, service } = database();
  try {
    const state = service.snapshot();
    const block = levelLessons('A2').slice(0, 4);
    const date = new Date().toISOString();
    state.results = block.map((l, i) => ({
      id: `r${i}`,
      activity_id: `class:r${i}`,
      skill: 'grammar',
      correct: 2,
      total: 2,
      answers: JSON.stringify({ lessonId: l.id }),
      completed_at: date,
      day: state.day,
      active_seconds: 1,
      title: l.title,
      document_id: null,
    }));
    state.reviews = ['a', 'b', 'c'].map((word_id) => ({
      word_id,
      known: 1,
      word: word_id,
      reviewed_at: date,
      day: state.day,
    }));
    assert.equal(integration(state, block).find((r) => r.id === 'vocabulary')!.done, false);
  } finally {
    db.close();
  }
});
test('Error review retains first response and distinguishes helped, repeated-item and different-item evidence', () => {
  const { db, service } = database();
  try {
    const data = service.snapshot();
    const base = {
      id: 'first',
      activity_id: 'routine:first',
      skill: 'grammar' as const,
      correct: 0,
      total: 1,
      answers: JSON.stringify({
        mode: 'grammar',
        level: 'A2',
        block: 0,
        edition: 3,
        feedback: [
          { id: 'item-1', category: 'tense', context: 'A journey to work', correct: false },
        ],
        support: [{ questionId: 'item-1', kind: 'hint', step: 1 }],
        helpUsed: true,
      }),
      day: '2026-10-10',
      completed_at: '2026-10-10T12:00:00Z',
      active_seconds: 1,
      title: 'Past in context',
      document_id: null,
    };
    data.results = [base];
    data.mistakes = [
      {
        id: 'm1',
        result_id: 'first',
        correction_id: null,
        category: 'tense',
        original: 'I go yesterday.',
        corrected: 'I went yesterday.',
        explanation: 'Yesterday marca pasado terminado.',
        pattern: 'A2:grammar:item-1',
        created_at: base.completed_at,
      },
    ];
    const add = (id: string, date: string, helpUsed: boolean, item: string, correct = true) =>
      data.results.push({
        ...base,
        id,
        activity_id: `routine:${id}`,
        completed_at: date,
        answers: JSON.stringify({
          feedback: [
            {
              id: item,
              category: 'tense',
              context: item === 'item-1' ? 'A journey to work' : 'A shopping trip',
              correct,
            },
          ],
          helpUsed,
        }),
      });
    add('same', '2026-10-11T12:00:00Z', false, 'item-1');
    add('helped', '2026-10-12T12:00:00Z', true, 'item-2');
    let entry = mistakeReview(data)[0];
    assert.equal(entry.first.original, 'I go yesterday.');
    assert.equal(entry.differentItemsPractised, 0);
    assert.equal(entry.dueAt, '2026-10-11T12:00:00.000Z');
    add('new', '2026-10-13T12:00:00Z', false, 'item-2');
    entry = mistakeReview(data)[0];
    assert.equal(entry.differentItemsPractised, 1);
    assert.equal(entry.dueAt, '2026-10-16T12:00:00.000Z');
    add('miss', '2026-10-14T12:00:00Z', false, 'item-2', false);
    entry = mistakeReview(data)[0];
    assert.equal(entry.dueAt, '2026-10-15T12:00:00.000Z');
    assert.equal(entry.helpUsed, true);
    assert.equal(entry.trials.length, 4);
  } finally {
    db.close();
  }
});

test('Daily listening requires an available native voice and fresh saved evidence; completed samples are not reassigned', () => {
  const { db, service } = database();
  try {
    const data = service.snapshot();
    assert.equal(
      makeStudyDay(data, 20, null, false).tasks.some((t) => t.action.kind === 'oral'),
      false,
    );
    const plan = makeStudyDay(data, 20, null, true),
      task = plan.tasks.find((t) => t.action.kind === 'oral')!;
    assert.ok(task);
    assert.equal(studyTaskDone(task, plan, data), false);
    const id = randomUUID();
    data.tutorMessages.push({
      id,
      document_id: voiceDocumentId,
      role: 'user',
      content: JSON.stringify({
        id,
        kind: 'oral-v1',
        mode: 'listening',
        level: 'A2',
        duration: 0,
        transcript: '',
        transcriptSource: null,
        heard: true,
        note: '',
        answers: [0, 0],
        helpUsed: false,
        mime: '',
      }),
      sources: '[]',
      mode: 'user',
      created_at: new Date().toISOString(),
    });
    assert.equal(studyTaskDone(task, plan, data), true);
    assert.equal(
      makeStudyDay(data, 20, null, true).tasks.some((t) => t.action.kind === 'oral'),
      false,
    );
    assert.equal(
      data.results.length,
      0,
      'Listening is evidence in its own existing record type, not a fabricated result',
    );
  } finally {
    db.close();
  }
});
test('Writing briefs progress from short sentences to argument and synthesis without assigning quality scores', () => {
  for (const pt of [false, true])
    for (const level of ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']) {
      const brief = writingChallenge(level, pt);
      assert.ok(brief.prompt && brief.spanish);
      assert.equal(brief.criteria.length, 3);
      assert.ok(brief.criteria.every((c) => c.native && c.spanish));
    }
  assert.match(writingChallenge('A2', false).prompt, /four sentences/);
  assert.match(writingChallenge('B1', false).prompt, /paragraph/);
  assert.match(writingChallenge('B2', false).prompt, /counterargument/);
  assert.match(writingChallenge('C2', true).prompt, /perspectivas/);
});
