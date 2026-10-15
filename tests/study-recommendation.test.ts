import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { initialize } from '../src/lib/schema';
import { createLearningService } from '../src/lib/domain';
import { learningJourney, levelLessons, startLevel } from '../src/lib/course-route';
import { dailyBudgetKey, studyBudget, studyRecommendation } from '../src/lib/study-recommendation';
import type { Activity, Snapshot } from '../src/lib/types';

function state(): Snapshot {
  const db = new DatabaseSync(':memory:');
  try {
    initialize(db);
    return createLearningService({
      db: () => db,
      transaction: (fn) => fn(),
      uuid: randomUUID,
    }).snapshot();
  } finally {
    db.close();
  }
}
function activity(data: Snapshot): Activity {
  return {
    id: 'paused-reading',
    plan_id: data.day,
    kind: 'reading',
    title: 'A pending reading',
    minutes: 12,
    document_id: null,
    payload: { draft: 'preserve me' },
    completed_at: null,
  };
}
function dueWord(data: Snapshot) {
  data.vocabulary = [
    {
      id: 'word',
      word: 'ticket',
      meaning: 'boleto',
      pronunciation: '',
      example: '',
      source_id: null,
      created_at: `${data.day}T10:00:00Z`,
      due_at: `${data.day}T10:00:00Z`,
      interval: 0,
      ease: 2.5,
      reviews: 0,
    },
  ];
}
test('a five-minute break selects a pending short practice while a full session keeps the next unlocked class', () => {
  const data = state();
  const original = JSON.stringify(data);
  const short = studyRecommendation(data, 5),
    full = studyRecommendation(data, 20);
  assert.deepEqual(short.action, { kind: 'routine', mode: 'vocabulary' });
  assert.equal(short.sessionMinutes, 5);
  assert.equal(short.partial, false);
  assert.deepEqual(full.action, { kind: 'class', id: levelLessons(startLevel)[0].id });
  assert.equal(full.sessionMinutes, 8);
  assert.equal(
    JSON.stringify(data),
    original,
    'recommendations must not change plans, scores, drafts or checkpoints',
  );
});
test('unfinished reading stays first even when the budget is shorter and vocabulary is due', () => {
  const data = state();
  const pending = activity(data);
  data.backlog = [pending];
  dueWord(data);
  const rec = studyRecommendation(data, 5);
  assert.deepEqual(rec.action, { kind: 'activity', activity: pending });
  assert.equal(rec.minutes, 12);
  assert.equal(rec.sessionMinutes, 5);
  assert.equal(rec.partial, true);
  assert.equal(pending.completed_at, null);
  assert.equal(pending.payload.draft, 'preserve me');
});
test('a completed resume pointer does not send the learner back to the same exercise', () => {
  const data = state();
  data.resumeActivity = { ...activity(data), completed_at: `${data.day}T12:00:00Z` };
  assert.equal(studyRecommendation(data).action.kind, 'class');
});
test('repeated grammar errors keep their repair ahead of short practice, saved drafts and word reviews', () => {
  const data = state(),
    lesson = levelLessons(startLevel)[0];
  data.results = [0, 1].map((n) => ({
    id: `failure-${n}`,
    activity_id: `class:failure-${n}`,
    skill: 'grammar',
    correct: 0,
    total: 2,
    answers: JSON.stringify({ lessonId: lesson.id }),
    completed_at: `${data.day}T12:0${n}:00Z`,
    day: data.day,
    active_seconds: 20,
    title: lesson.title,
    document_id: null,
  }));
  dueWord(data);
  const before = JSON.stringify(learningJourney(data));
  const rec = studyRecommendation(data, 5, {
    id: 'paused',
    mode: 'vocabulary',
    level: startLevel,
    block: 0,
  });
  assert.equal(rec.priority, 'repair');
  assert.deepEqual(rec.action, { kind: 'class', id: lesson.id });
  assert.equal(rec.partial, true);
  assert.match(rec.es, /0 de 4/);
  assert.equal(
    JSON.stringify(learningJourney(data)),
    before,
    'a shorter session never bypasses repair gates',
  );
});
test('due vocabulary remains ahead of an available class in both short and long sessions', () => {
  const data = state();
  dueWord(data);
  for (const minutes of [5, 20, 40]) {
    const rec = studyRecommendation(data, minutes);
    assert.deepEqual(rec.action, { kind: 'review' });
    assert.equal(rec.sessionMinutes, 4);
  }
});
test('a valid paused routine resumes its own mode instead of switching to the next class', () => {
  const data = state();
  const paused = { id: 'draft', mode: 'grammar' as const, level: startLevel, block: 0 };
  dueWord(data);
  const rec = studyRecommendation(data, 20, paused);
  assert.equal(rec.priority, 'paused');
  assert.deepEqual(rec.action, { kind: 'routine', mode: 'grammar' });
});
test('a completed draft or a draft from another block or level never reopens through the main recommendation', () => {
  const data = state();
  const paused = { id: 'draft', mode: 'grammar' as const, level: startLevel, block: 0 };
  assert.equal(studyRecommendation(data, 20, { ...paused, block: 1 }).priority, 'class');
  assert.equal(studyRecommendation(data, 20, { ...paused, level: 'C2' }).priority, 'class');
  data.results = [
    {
      id: 'completed',
      activity_id: 'routine:draft',
      skill: 'grammar',
      correct: 6,
      total: 6,
      answers: '{}',
      completed_at: `${data.day}T12:00:00Z`,
      day: data.day,
      active_seconds: 60,
      title: 'Saved',
      document_id: null,
    },
  ];
  assert.notEqual(studyRecommendation(data, 20, paused).priority, 'paused');
});
test('daily budget keys expire by study day and malformed values fall back to the profile without mutation', () => {
  assert.notEqual(dailyBudgetKey('2026-10-15'), dailyBudgetKey('2026-10-16'));
  for (const invalid of [0, -5, 1000, null, '5', {}, NaN, Infinity])
    assert.equal(studyBudget(invalid, 40), 40);
  assert.equal(studyBudget(5, 40), 5);
  assert.equal(studyBudget(undefined, -2), 20);
  const data = state();
  data.profile.daily_minutes = 5;
  assert.equal(studyRecommendation(data).action.kind, 'routine');
  assert.equal(data.plan.minutes, 20, 'the existing daily plan is retained');
});
