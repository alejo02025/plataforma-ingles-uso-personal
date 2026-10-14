import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { initialize } from '../src/lib/schema';
import { createLearningService } from '../src/lib/domain';
import {
  courseRoute,
  levelLessons,
  lessonRequirements,
  integration,
  blockSize,
  reinforcement,
  learningJourney,
  type CourseEvidence,
} from '../src/lib/course-route';
import { saveLesson } from '../src/lib/lesson-store';
import { classRevision } from '../src/lib/lessons';
import { checkLessonAccess, courseEvidence, preserveCourseProgress } from '../src/lib/course-store';
import { merge, tables, validate } from '../src/lib/browser/merge';
import type { Result } from '../src/lib/types';
const result = (skill: Result['skill'], id: string, date: string, extra = {}) =>
  ({
    id,
    activity_id: id,
    skill,
    correct: 1,
    total: 1,
    answers: '{}',
    completed_at: date,
    day: '2026-10-14',
    active_seconds: 25,
    title: id,
    document_id: null,
    ...extra,
  }) as Result;
test('A2 is the English entry point, mistakes do not unlock the next class, and the API rejects locked levels', () => {
  const db = new DatabaseSync(':memory:');
  try {
    initialize(db);
    const service = createLearningService({
      db: () => db,
      transaction: (fn) => fn(),
      uuid: randomUUID,
    });
    const state = service.snapshot(),
      plan = db.prepare('SELECT id FROM plans WHERE day=?').get(state.day)!.id as string;
    assert.equal(courseRoute(state).level, 'A2');
    assert.throws(() => checkLessonAccess(db, levelLessons('A1')[0].id), /empieza en A2/);
    assert.throws(() => checkLessonAccess(db, levelLessons('B1')[0].id), /activo es A2/);
    const first = levelLessons('A2')[0],
      second = levelLessons('A2')[1];
    assert.throws(() => checkLessonAccess(db, second.id), /Primero/);
    saveLesson(
      db,
      {
        id: randomUUID(),
        lessonId: first.id,
        revision: classRevision,
        answers: first.checks.map((q) => (q.answer + 1) % 3),
        seconds: 20,
      },
      plan,
    );
    assert.throws(() => checkLessonAccess(db, second.id), /Primero/);
    saveLesson(
      db,
      {
        id: randomUUID(),
        lessonId: first.id,
        revision: classRevision,
        answers: first.checks.map((q) => (q.answer + 1) % 3),
        seconds: 20,
      },
      plan,
    );
    assert.doesNotThrow(() => checkLessonAccess(db, first.id));
    saveLesson(
      db,
      {
        id: randomUUID(),
        lessonId: first.id,
        revision: classRevision,
        answers: first.checks.map((q) => q.answer),
        seconds: 20,
      },
      plan,
    );
    assert.doesNotThrow(() => checkLessonAccess(db, second.id));
    assert.equal(service.snapshot().results.length, 3);
  } finally {
    db.close();
  }
});
test('Block boundaries require real reading, vocabulary and writing in the block window; classes cannot substitute for reading', () => {
  const block = levelLessons('A2').slice(0, blockSize),
    date = '2026-10-14T12:00:00.000Z';
  const data: CourseEvidence = {
    day: '2026-10-14',
    documents: [{ id: 'article', level: 'A2', filename: null } as never],
    reviews: [],
    tutorMessages: [],
    tutorAttempts: [],
    results: block.map((l) =>
      result('grammar', `class:${l.id}`, date, { answers: JSON.stringify({ lessonId: l.id }) }),
    ),
  };
  assert.equal(integration(data, block).filter((r) => r.done).length, 1);
  const next = levelLessons('A2')[blockSize];
  assert.equal(lessonRequirements(data, next).filter((r) => !r.done).length, 3);
  data.results.push(
    result('reading', 'old-reading', '2026-10-13T12:00:00.000Z', { document_id: 'article' }),
  );
  assert.equal(integration(data, block).find((r) => r.id === 'reading')!.done, false);
  data.results.push(result('reading', 'reading', date, { document_id: 'article' }));
  data.results.push(
    result('vocabulary', 'game:help', date, { answers: JSON.stringify({ helpUsed: true }) }),
  );
  assert.equal(integration(data, block).find((r) => r.id === 'vocabulary')!.done, false);
  data.results.push(result('vocabulary', 'game:clean', date));
  data.results.push(
    result('writing', 'writing', date, {
      correct: null,
      total: null,
      answers: JSON.stringify({ text: 'This is my own description of a situation from class.' }),
    }),
  );
  data.tutorMessages.push({
    id: 'voice',
    document_id: 'voice-room',
    role: 'user',
    content: 'I practised asking for directions in a real situation.',
    sources: '[]',
    mode: 'user',
    created_at: date,
  });
  assert.ok(integration(data, block).every((r) => r.done));
  assert.ok(lessonRequirements(data, next).every((r) => r.done));
  // Completing one block still cannot open B1 or count a class score as a full language level.
  assert.equal(courseRoute(data).level, 'A2');
  assert.equal(lessonRequirements(data, levelLessons('B1')[0])[0].done, false);
});
test('A previous-day reading is resumed with its original ID; update migrations keep drafts and completed checkpoints', () => {
  const db = new DatabaseSync(':memory:');
  try {
    initialize(db);
    const service = createLearningService({
      db: () => db,
      transaction: (fn) => fn(),
      uuid: randomUUID,
    });
    const state = service.snapshot(),
      reading = state.plan.activities.find((a) => a.kind === 'reading')!;
    service.startSession(reading.id);
    db.prepare('UPDATE plans SET day=? WHERE id=?').run('2026-01-01', reading.plan_id);
    const draft = '{"answer":1}';
    db.prepare('INSERT OR REPLACE INTO reading_progress VALUES(?,?,?,?)').run(
      reading.document_id,
      1,
      draft,
      new Date().toISOString(),
    );
    const next = service.snapshot();
    assert.equal(next.backlog![0].id, reading.id);
    assert.throws(() => checkLessonAccess(db, levelLessons('A2')[0].id), /día anterior/);
    db.prepare('UPDATE activities SET completed_at=? WHERE id=?').run(
      new Date().toISOString(),
      reading.id,
    );
    assert.doesNotThrow(() => checkLessonAccess(db, levelLessons('A2')[0].id));
    db.prepare('INSERT INTO course_checkpoints VALUES(?,?,?)').run(
      'level:A2',
      'A2',
      new Date().toISOString(),
    );
    initialize(db);
    preserveCourseProgress(db);
    assert.equal(courseRoute(courseEvidence(db)).level, 'B1');
    assert.equal(
      db.prepare('SELECT draft FROM reading_progress WHERE document_id=?').get(reading.document_id)!
        .draft,
      draft,
    );
  } finally {
    db.close();
  }
});
test('An older backup gains the new table and a stale device does not remove course checkpoints', () => {
  const baseline = () => ({
    version: 1 as const,
    data: Object.fromEntries(tables.map((t) => [t, []])),
  });
  const old = baseline();
  delete old.data.course_checkpoints;
  assert.deepEqual(validate(old).data.course_checkpoints, []);
  const left = baseline(),
    right = baseline();
  left.data.course_checkpoints = [
    { id: 'level:A2', level: 'A2', completed_at: '2026-10-14' },
  ] as never[];
  assert.equal(merge(left, right).data.course_checkpoints.length, 1);
  assert.equal(merge(right, left).data.course_checkpoints.length, 1);
});
test('A full level unlocks only after every class block has cross-section evidence, and a completed checkpoint keeps the level after later catalog updates', () => {
  const items = levelLessons('A2'),
    data: CourseEvidence = {
      day: '2026-10-14',
      documents: [{ id: 'a2-story', level: 'A2', filename: null } as never],
      reviews: [],
      tutorMessages: [],
      tutorAttempts: [],
      results: [],
    };
  for (let offset = 0; offset < items.length; offset += blockSize) {
    const time = new Date(Date.UTC(2026, 9, 14, 0, offset)).toISOString(),
      after = new Date(Date.UTC(2026, 9, 14, 0, offset, 1)).toISOString();
    const block = items.slice(offset, offset + blockSize);
    for (const lesson of block)
      data.results.push(
        result('grammar', `class:${lesson.id}`, time, {
          answers: JSON.stringify({ lessonId: lesson.id }),
        }),
      );
    assert.equal(courseRoute(data).level, 'A2');
    data.results.push(
      result('reading', `reading-${offset}`, after, { document_id: 'a2-story' }),
      result('vocabulary', `game:${offset}`, after),
      result('writing', `writing-${offset}`, after, {
        answers: JSON.stringify({
          text: 'I practised a concrete situation using the ideas from this block.',
        }),
        correct: null,
        total: null,
      }),
    );
    data.tutorMessages.push({
      id: `speaking-${offset}`,
      document_id: 'voice-room',
      role: 'user',
      content: 'I explained a situation using the ideas from the current block.',
      sources: '[]',
      mode: 'user',
      created_at: after,
    });
    if (offset + blockSize < items.length) assert.equal(courseRoute(data).level, 'A2');
  }
  assert.equal(courseRoute(data).level, 'B1');
  assert.ok(courseRoute(data).completed.includes('A2'));
  data.courseCheckpoints = [{ id: 'level:A2', level: 'A2', completed_at: '2026-10-14T12:00:00Z' }];
  data.results = [];
  data.reviews = [];
  data.tutorMessages = [];
  assert.equal(courseRoute(data).level, 'B1');
});

test('Recent reading failures pause new classes everywhere, preserve earned checkpoints, and clear after a successful reading', () => {
  const first = levelLessons('A2')[0],
    next = levelLessons('A2')[1];
  const data: CourseEvidence = {
    day: '2026-10-14',
    documents: [{ id: 'story', level: 'A2', filename: null } as never],
    reviews: [],
    tutorMessages: [],
    tutorAttempts: [],
    courseCheckpoints: [{ id: `block:${first.id}`, level: 'A2', completed_at: '2026-10-13' }],
    results: [
      result('grammar', 'class:first', '2026-10-14T09:00:00Z', {
        answers: JSON.stringify({ lessonId: first.id }),
        correct: 2,
        total: 2,
      }),
      result('reading', 'r1', '2026-10-14T10:00:00Z', {
        document_id: 'story',
        correct: 0,
        total: 2,
      }),
      result('reading', 'r2', '2026-10-14T11:00:00Z', {
        document_id: 'story',
        correct: 1,
        total: 2,
      }),
    ],
  };
  assert.equal(learningJourney(data).next!.id, 'reinforce:reading');
  assert.ok(lessonRequirements(data, next).some((r) => r.id === 'reinforce:reading' && !r.done));
  assert.deepEqual(lessonRequirements(data, first), []);
  assert.equal(data.courseCheckpoints!.length, 1);
  data.results.push(
    result('reading', 'r3', '2026-10-14T12:00:00Z', { document_id: 'story', correct: 2, total: 2 }),
  );
  assert.equal(reinforcement(data, 'A2').length, 0);
  assert.ok(lessonRequirements(data, next).every((r) => r.done));
});
test('PDF checks feed the same reading reinforcement, and an advanced optional reading does not falsely block an elementary learner', () => {
  const data: CourseEvidence = {
    day: '2026-10-14',
    documents: [
      { id: 'pdf', level: 'Unassessed', filename: 'book.pdf' } as never,
      { id: 'advanced', level: 'C2', filename: null } as never,
    ],
    results: [
      result('reading', 'advanced1', '2026-10-14T09:00:00Z', {
        document_id: 'advanced',
        correct: 0,
        total: 2,
      }),
      result('reading', 'advanced2', '2026-10-14T10:00:00Z', {
        document_id: 'advanced',
        correct: 0,
        total: 2,
      }),
    ],
    reviews: [],
    tutorMessages: [],
    tutorAttempts: [],
  };
  assert.deepEqual(reinforcement(data, 'A2'), []);
  for (let i = 0; i < 2; i++)
    data.tutorAttempts.push({
      id: `pdf${i}`,
      document_id: 'pdf',
      question_id: 'word',
      prompt: 'A sourced question',
      answer: 'wrong',
      correct: 0,
      feedback: 'Source correction',
      source_paragraph: 0,
      created_at: `2026-10-14T11:0${i}:00Z`,
    });
  assert.equal(reinforcement(data, 'A2')[0].id, 'reinforce:reading');
  data.tutorAttempts.push({
    ...data.tutorAttempts[0],
    id: 'recovery',
    correct: 1,
    created_at: '2026-10-14T12:00:00Z',
  });
  assert.deepEqual(reinforcement(data, 'A2'), []);
});
test('An English level change aligns untouched daily tasks while preserving an active reading and its draft', () => {
  const db = new DatabaseSync(':memory:');
  try {
    initialize(db);
    const service = createLearningService({
      db: () => db,
      transaction: (fn) => fn(),
      uuid: randomUUID,
    });
    const before = service.snapshot(),
      reading = before.plan.activities.find((a) => a.kind === 'reading')!;
    const session = service.startSession(reading.id);
    service.checkpoint(reading.document_id!, 1, { saved: 1 });
    db.prepare('INSERT INTO course_checkpoints VALUES(?,?,?)').run(
      'level:A2',
      'A2',
      new Date().toISOString(),
    );
    const after = service.snapshot();
    assert.equal(courseRoute(after).level, 'B1');
    assert.equal(
      after.plan.activities.find((a) => a.id === reading.id)!.document_id,
      reading.document_id,
    );
    assert.equal(after.documents.find((d) => d.id === reading.document_id)!.draft.saved, 1);
    assert.equal(
      db.prepare('SELECT activity_id FROM sessions WHERE id=?').get(session.id)!.activity_id,
      reading.id,
    );
    const grammar = after.plan.activities.find((a) => a.kind === 'grammar')!;
    assert.ok(grammar.payload.questions!.every((q) => q.band === 'B1'));
    assert.equal(
      after.plan.activities.find((a) => a.kind === 'writing')!.id,
      before.plan.activities.find((a) => a.kind === 'writing')!.id,
    );
  } finally {
    db.close();
  }
});
