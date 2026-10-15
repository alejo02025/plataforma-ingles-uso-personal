import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
import { initialize } from '../src/lib/schema';
import { createLearningService } from '../src/lib/domain';
import { makeStudyDay, readStudyDay, studyTaskDone } from '../src/lib/daily-study';
import { saveStudyDay } from '../src/lib/daily-study-store';
import type { Result, Snapshot } from '../src/lib/types';
function fixture() {
  const db = new DatabaseSync(':memory:');
  initialize(db);
  const service = createLearningService({
    db: () => db,
    transaction: (fn) => fn(),
    uuid: randomUUID,
  });
  return { db, service, data: service.snapshot() };
}
function result(data: Snapshot, task: ReturnType<typeof makeStudyDay>['tasks'][number]): Result {
  const action = task.action;
  const answers =
    action.kind === 'class'
      ? { lessonId: action.id }
      : action.kind === 'routine'
        ? {
            mode: action.mode,
            level: action.level,
            block: action.block,
            edition: 2,
            variant: 0,
            helpUsed: true,
          }
        : {};
  return {
    id: randomUUID(),
    activity_id:
      action.kind === 'class'
        ? `class:${randomUUID()}`
        : action.kind === 'routine'
          ? `routine:${randomUUID()}`
          : action.kind === 'activity'
            ? action.id
            : '',
    skill: action.kind === 'routine' ? action.mode : 'grammar',
    correct: 0,
    total: 6,
    answers: JSON.stringify(answers),
    day: data.day,
    completed_at: new Date().toISOString(),
    active_seconds: 23,
    title: 'Actual saved attempt',
    document_id: null,
  };
}
test('finite agendas fit all new and legacy budgets without mutating histories or course gates', () => {
  const f = fixture();
  try {
    const original = JSON.stringify(f.data);
    for (const minutes of [5, 15, 20, 30, 40, 45]) {
      const plan = makeStudyDay(f.data, minutes);
      assert.ok(plan.tasks.length > 0 && plan.tasks.length <= 4);
      assert.ok(plan.tasks.reduce((s, t) => s + t.minutes, 0) <= minutes);
      assert.equal(new Set(plan.tasks.map((t) => t.id)).size, plan.tasks.length);
      assert.ok(plan.tasks.every((t) => t.minutes > 0));
    }
    assert.equal(JSON.stringify(f.data), original);
  } finally {
    f.db.close();
  }
});
test('saved agenda is idempotent and survives SQLite reload without earning fake sessions/results', () => {
  const f = fixture();
  try {
    const plan = saveStudyDay(f.db, { minutes: 20 }, f.data);
    const again = saveStudyDay(f.db, { minutes: 20 }, f.service.snapshot());
    assert.deepEqual(again, plan);
    const fresh = f.service.snapshot();
    assert.deepEqual(readStudyDay(fresh), plan);
    assert.equal(fresh.results.length, 0);
    assert.equal(fresh.sessions.length, 0);
    assert.equal(fresh.courseCheckpoints?.length, 0);
    assert.equal(
      f.db.prepare("SELECT COUNT(*) AS n FROM activities WHERE id LIKE 'study-day:%'").get()!.n,
      1,
    );
  } finally {
    f.db.close();
  }
});
test('completion means new saved work, not opening a task, past results or passing a level', () => {
  const f = fixture();
  try {
    const plan = makeStudyDay(f.data, 20);
    const task = plan.tasks[0];
    assert.equal(studyTaskDone(task, plan, f.data), false);
    const attempt = result(f.data, task);
    f.data.results.push(attempt);
    assert.equal(
      studyTaskDone(task, plan, f.data),
      true,
      'a failed attempt still records study, not mastery',
    );
    assert.equal(studyTaskDone(task, { ...plan, baseline: [attempt.id] }, f.data), false);
    attempt.day = '2000-01-01';
    assert.equal(studyTaskDone(task, plan, f.data), false);
  } finally {
    f.db.close();
  }
});
test('agenda does not reroll after all tasks complete, including after a duration change', () => {
  const f = fixture();
  try {
    const plan = saveStudyDay(f.db, { minutes: 20 }, f.data);
    f.data.results = plan.tasks.map((task) => result(f.data, task));
    assert.ok(plan.tasks.every((t) => studyTaskDone(t, plan, f.data)));
    const stable = saveStudyDay(f.db, { minutes: 20 }, f.data);
    assert.deepEqual(stable, plan);
    const shorter = saveStudyDay(f.db, { minutes: 15 }, f.data);
    assert.deepEqual(shorter.tasks, plan.tasks);
    assert.ok(shorter.tasks.every((t) => studyTaskDone(t, shorter, f.data)));
  } finally {
    f.db.close();
  }
});
test('word review completion requires every scheduled word, and never claims objective accuracy', () => {
  const f = fixture();
  try {
    const now = new Date().toISOString();
    f.data.vocabulary = ['a', 'b', 'c', 'd'].map((id) => ({
      id,
      word: id,
      meaning: 'word',
      pronunciation: '',
      example: '',
      source_id: null,
      created_at: now,
      due_at: '2000-01-01',
      interval: 0,
      ease: 2.5,
      reviews: 0,
    }));
    const plan = makeStudyDay(f.data, 20);
    const task = plan.tasks.find((t) => t.action.kind === 'review')!;
    assert.ok(task);
    assert.equal(studyTaskDone(task, plan, f.data), false);
    for (const word_id of ['a', 'b'])
      f.data.reviews.push({ word_id, word: word_id, known: 0, day: f.data.day, reviewed_at: now });
    assert.equal(studyTaskDone(task, plan, f.data), false);
    f.data.reviews.push({ word_id: 'c', word: 'c', known: 0, day: f.data.day, reviewed_at: now });
    assert.equal(studyTaskDone(task, plan, f.data), true);
    assert.equal(f.data.results.length, 0);
  } finally {
    f.db.close();
  }
});
test('new task baseline excludes earlier practice and changing time preserves completed tasks', () => {
  const f = fixture();
  try {
    const plan = saveStudyDay(f.db, { minutes: 20 }, f.data);
    f.data.results.push(result(f.data, plan.tasks[1]));
    const changed = saveStudyDay(f.db, { minutes: 15 }, f.data);
    assert.equal(changed.tasks[0].id, plan.tasks[1].id);
    assert.equal(studyTaskDone(changed.tasks[0], changed, f.data), true);
    assert.ok(changed.tasks.length <= 4);
    assert.ok(
      changed.tasks
        .filter((t) => !studyTaskDone(t, changed, f.data))
        .reduce((s, t) => s + t.minutes, 0) <= 15,
    );
    assert.throws(() => saveStudyDay(f.db, { minutes: 999 }, f.data));
  } finally {
    f.db.close();
  }
});
test('a corrupted agenda can be rebuilt while preserving its original payload and all real history', () => {
  const f = fixture();
  try {
    saveStudyDay(f.db, { minutes: 20 }, f.data);
    const corrupt = { version: 1, day: f.data.day, tasks: null };
    f.db
      .prepare('UPDATE activities SET payload=? WHERE id=?')
      .run(JSON.stringify({ optional: true, studyDay: corrupt }), `study-day:${f.data.day}`);
    assert.equal(readStudyDay(f.service.snapshot()), undefined);
    const repaired = saveStudyDay(f.db, { minutes: 15 }, f.service.snapshot());
    assert.equal(repaired.minutes, 15);
    const payload = JSON.parse(
      f.db.prepare('SELECT payload FROM activities WHERE id=?').get(`study-day:${f.data.day}`)!
        .payload as string,
    );
    assert.deepEqual(payload.previousAgenda, corrupt);
    assert.equal(f.service.snapshot().results.length, 0);
    assert.equal(f.service.snapshot().sessions.length, 0);
  } finally {
    f.db.close();
  }
});
test('a word due later today does not create an empty or impossible review task', () => {
  const f = fixture();
  try {
    const now = new Date().toISOString();
    f.data.vocabulary = [
      {
        id: 'future-word',
        word: 'ticket',
        meaning: 'boleto',
        pronunciation: '',
        example: '',
        source_id: null,
        created_at: now,
        due_at: new Date(Date.now() + 3600000).toISOString(),
        interval: 0,
        ease: 2.5,
        reviews: 0,
      },
    ];
    const plan = makeStudyDay(f.data, 20);
    assert.ok(plan.tasks.every((t) => t.action.kind !== 'review'));
  } finally {
    f.db.close();
  }
});
test('new usual-time budgets retain positive real activities when vocabulary reviews are due', () => {
  for (const minutes of [15, 20, 30, 45]) {
    const db = new DatabaseSync(':memory:');
    try {
      initialize(db);
      db.prepare('UPDATE profile SET daily_minutes=? WHERE id=1').run(minutes);
      const service = createLearningService({
        db: () => db,
        transaction: (fn) => fn(),
        uuid: randomUUID,
      });
      service.saveWord({ word: 'ticket' });
      const data = service.snapshot();
      const tasks = data.plan.activities.filter((a) => !a.payload.optional);
      assert.ok(
        tasks.every((a) => a.minutes > 0),
        `${minutes} has a zero-minute task`,
      );
      assert.equal(
        tasks.reduce((s, a) => s + a.minutes, 0),
        minutes,
      );
    } finally {
      db.close();
    }
  }
});
