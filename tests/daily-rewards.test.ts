import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dailyRewards, offsetDay } from '../src/lib/daily-rewards';
import type { Snapshot, Result } from '../src/lib/types';

function state(day = '2026-10-14'): Snapshot {
  return {
    profile: { name: 'Alejo', daily_minutes: 20, interests: [], theme: 'light' },
    day,
    aiAvailable: false,
    protected: false,
    diagnostic: { id: 'd', completed_at: null, answers: [] },
    questions: [],
    documents: [],
    resumeActivity: null,
    plan: { day, minutes: 20, reason: '', activities: [] },
    vocabulary: [],
    results: [],
    evaluations: [],
    corrections: [],
    mistakes: [],
    reviews: [],
    sessions: [],
    tutorMessages: [],
    tutorAttempts: [],
  };
}
function result(day: string, id = day, skill: Result['skill'] = 'grammar'): Result {
  return {
    id,
    activity_id: id,
    skill,
    correct: 0,
    total: 3,
    answers: '{}',
    completed_at: `${day}T15:00:00Z`,
    day,
    active_seconds: 10,
    title: 'Practice',
    document_id: null,
  };
}
const badge = (data: Snapshot, id: string) => dailyRewards(data).badges.find((b) => b.id === id)!;

test('streaks count distinct days of saved practice, preserve yesterday until today ends, and restart after a gap', () => {
  const data = state();
  data.results = [result('2026-10-12'), result('2026-10-13'), result('2026-10-13', 'another')];
  assert.equal(dailyRewards(data).currentStreak, 2);
  assert.equal(dailyRewards(data).todayDone, false);
  data.results.push(result(data.day), result(data.day, 'repeat'));
  assert.equal(dailyRewards(data).currentStreak, 3);
  assert.equal(dailyRewards(data).todayActivities, 2);
  assert.equal(badge(data, 'three-days').earned, true);
  const preserved = JSON.stringify(data);
  assert.equal(dailyRewards(data, '2026-10-15').currentStreak, 3);
  assert.equal(dailyRewards(data, '2026-10-16').currentStreak, 0);
  assert.equal(dailyRewards(data, '2026-10-16').bestStreak, 3);
  assert.ok(dailyRewards(data, '2026-10-16').badges.find((b) => b.id === 'three-days')!.earned);
  assert.equal(JSON.stringify(data), preserved, 'calculating rewards never mutates saved data');
  data.day = '2026-10-16';
  data.results.push(result(data.day));
  assert.equal(dailyRewards(data).currentStreak, 1);
});

test('all-history streaks cross month, year and leap-day boundaries and award past milestones after pauses', () => {
  assert.equal(offsetDay('2024-03-01', -1), '2024-02-29');
  assert.equal(offsetDay('2026-01-01', -1), '2025-12-31');
  const data = state('2026-10-14');
  data.results = Array.from({ length: 30 }, (_, i) => result(offsetDay('2025-12-20', i)));
  assert.equal(dailyRewards(data).currentStreak, 0);
  assert.equal(dailyRewards(data).bestStreak, 30);
  for (const id of ['three-days', 'seven-days', 'thirty-days'])
    assert.equal(badge(data, id).earned, true);
  assert.equal(dailyRewards(data).week.length, 7);
});

test('saved words and session timers do not create a streak; failed reviews and genuine PDF answers do, in Argentina time', () => {
  const data = state();
  data.vocabulary = [
    {
      id: 'w',
      word: 'ticket',
      meaning: 'boleto',
      pronunciation: '',
      example: '',
      source_id: null,
      created_at: '2026-10-14T15:00:00Z',
      due_at: '',
      interval: 0,
      ease: 2.5,
      reviews: 0,
    },
  ];
  data.sessions = [
    {
      id: 's',
      activity_id: 'a',
      started_at: '2026-10-14T15:00:00Z',
      active_seconds: 999,
      ended_at: null,
      title: '',
      kind: 'reading',
    },
  ];
  assert.equal(dailyRewards(data).earned, 0);
  data.reviews.push({
    word_id: 'w',
    word: 'ticket',
    known: 0,
    day: '2026-10-13',
    reviewed_at: '2026-10-14T01:30:00Z',
  });
  const attempt = {
    id: 'pdf',
    document_id: 'd',
    question_id: 'q',
    prompt: '?',
    answer: 'An idea',
    correct: null,
    feedback: '',
    source_paragraph: 0,
    created_at: '2026-10-14T02:59:00Z',
  };
  data.tutorAttempts.push(attempt);
  assert.equal(dailyRewards(data).todayDone, false);
  data.tutorAttempts.push({ ...attempt, id: 'today', created_at: '2026-10-14T03:00:00Z' });
  assert.equal(dailyRewards(data).currentStreak, 2);
  assert.equal(dailyRewards(data).todayActivities, 1);
  assert.equal(badge(data, 'words').earned, true);
  assert.equal(badge(data, 'reading').earned, true);
  assert.equal(dailyRewards(state()).earned, 0, 'the other profile has its own evidence');
});

test('class badges count passed unique lessons and stored block/level checkpoints; rewards never bypass course gates', () => {
  const data = state();
  data.results = Array.from({ length: 12 }, (_, i) => ({
    ...result(data.day, `class:attempt-${i}`),
    answers: JSON.stringify({ lessonId: i < 3 ? 'first' : `lesson-${i}` }),
    correct: i === 11 ? 2 : 3,
    total: 3,
  }));
  assert.equal(badge(data, 'ten-classes').value, 9);
  assert.equal(badge(data, 'ten-classes').earned, false);
  data.results.push({
    ...result(data.day, 'class:tenth'),
    answers: JSON.stringify({ lessonId: 'tenth' }),
    correct: 4,
    total: 5,
  });
  assert.equal(badge(data, 'ten-classes').earned, true);
  assert.equal(badge(data, 'first-block').earned, false);
  data.courseCheckpoints = [
    { id: 'block:first', level: 'A2', completed_at: '2026-10-14T15:00:00Z' },
    { id: 'level:A2', level: 'A2', completed_at: '2026-10-14T15:00:00Z' },
  ];
  assert.equal(badge(data, 'first-block').earned, true);
  assert.equal(badge(data, 'first-level').earned, true);
});

test('future, malformed and unfinished evidence does not light today or award achievements', () => {
  const data = state();
  data.results = [
    result('2026-10-15'),
    result('2026-02-30'),
    { ...result(data.day), completed_at: '' },
  ];
  data.tutorAttempts = [
    {
      id: 'a',
      document_id: 'd',
      question_id: 'q',
      prompt: '?',
      answer: ' ',
      correct: null,
      feedback: '',
      source_paragraph: 0,
      created_at: '2026-10-14T15:00:00Z',
    },
  ];
  assert.equal(dailyRewards(data).earned, 0);
  assert.equal(dailyRewards(data).currentStreak, 0);
  assert.equal(dailyRewards(data).todayActivities, 0);
});
