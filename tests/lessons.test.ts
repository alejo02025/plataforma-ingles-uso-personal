import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { englishClasses, portugueseClasses } from '../src/locales/lessons/catalog';
import { lessons, classRevision } from '../src/lib/lessons';
import { saveLesson } from '../src/lib/lesson-store';
import { initialize } from '../src/lib/schema';
import { createLearningService } from '../src/lib/domain';
import { questionFeedback } from '../src/lib/answer-feedback';
import { practiceDays } from '../src/lib/momentum';

test('Both class catalogs cover A1–C2 with original explanations, spoken models and unambiguous choices', () => {
  for (const catalog of [englishClasses, portugueseClasses]) {
    assert.equal(new Set(catalog.map((l) => l.id)).size, 10);
    assert.deepEqual(
      [...new Set(catalog.map((l) => l.level))],
      ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    );
    for (const lesson of catalog) {
      assert.ok(lesson.explanation.length > 80);
      assert.equal(lesson.examples.length, 2);
      assert.equal(lesson.checks.length, 2);
      for (const q of lesson.checks) {
        assert.equal(new Set(q.options).size, 3);
        assert.ok(q.options[q.answer]);
        assert.ok(q.correction.length > 5 && q.why.length > 25);
      }
    }
  }
  for (const lesson of lessons)
    for (const [i, q] of lesson.checks.entries())
      assert.deepEqual(questionFeedback(`${lesson.id}:${i}`), {
        explanation: q.why,
        correction: q.correction,
      });
});

test('Class attempts are graded from the catalog, save Spanish corrections, and preserve daily plans and open practice without a fake grade', () => {
  const db = new DatabaseSync(':memory:');
  try {
    initialize(db);
    const service = createLearningService({
      db: () => db,
      transaction: (fn) => fn(),
      uuid: randomUUID,
    });
    const before = service.snapshot();
    const plan = db.prepare('SELECT id FROM plans WHERE day=?').get(before.day)!.id as string;
    const lesson = lessons[0];
    const input = {
      id: randomUUID(),
      lessonId: lesson.id,
      revision: classRevision,
      answers: [(lesson.checks[0].answer + 1) % 3, lesson.checks[1].answer],
      practice: 'My own sentence is kept without automatic writing assessment.',
      seconds: 19,
      correct: 99,
    };
    assert.throws(() => saveLesson(db, { ...input, answers: [] }, plan), /both questions/);
    assert.throws(
      () => saveLesson(db, { ...input, lessonId: portugueseClasses[0].id }, plan),
      /class has changed/,
    );
    assert.throws(() => saveLesson(db, { ...input, revision: 99 }, plan), /class has changed/);
    assert.equal(db.prepare('SELECT count(*) as n FROM results').get()!.n, 0);
    const saved = saveLesson(db, input, plan);
    assert.equal(saved.correct, 1);
    assert.equal(saved.total, 2);
    assert.equal(saved.feedback[0].explanationSpanish, lesson.checks[0].why);
    assert.equal(saved.feedback[0].correction, lesson.checks[0].correction);
    assert.equal(
      saveLesson(db, { ...input, answers: lesson.checks.map((q) => q.answer) }, plan).correct,
      1,
    );
    const after = service.snapshot();
    assert.equal(after.results.length, 1);
    assert.equal(after.results[0].active_seconds, 19);
    assert.equal(JSON.parse(after.results[0].answers).practice, input.practice);
    assert.equal(after.mistakes.length, 1);
    assert.equal(after.mistakes[0].explanation, lesson.checks[0].why);
    assert.deepEqual(after.plan.activities, before.plan.activities);
    assert.deepEqual(after.reviews, before.reviews);
    assert.equal(after.evaluations.length, before.evaluations.length);
    assert.equal(practiceDays(after, 1)[0].activities[0].title, lesson.title);
    const retry = saveLesson(
      db,
      { ...input, id: randomUUID(), answers: lesson.checks.map((q) => q.answer) },
      plan,
    );
    assert.equal(retry.correct, 2);
    assert.equal(service.snapshot().results.length, 2);
    const advanced = lessons.find((lesson) => lesson.skill === 'reading')!;
    saveLesson(
      db,
      {
        ...input,
        id: randomUUID(),
        lessonId: advanced.id,
        answers: advanced.checks.map((q) => q.answer),
      },
      plan,
    );
    assert.equal(service.snapshot().results.at(-1)!.skill, 'reading');
  } finally {
    db.close();
  }
});
