import { test } from 'node:test';
import assert from 'node:assert/strict';
import { greetingForHour, practiceDays } from '../src/lib/momentum';
import type { Snapshot } from '../src/lib/types';
function state(): Snapshot {
  return {
    profile: { name: 'Alejo', daily_minutes: 20, interests: ['Travel'], theme: 'light' },
    day: '2026-10-13',
    aiAvailable: false,
    protected: false,
    diagnostic: { id: 'd', completed_at: null, answers: [] },
    questions: [],
    documents: [],
    resumeActivity: null,
    plan: { day: '2026-10-13', minutes: 20, reason: '', activities: [] },
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
test('greetings change with the local hour, including afternoon and evening', () => {
  assert.equal(greetingForHour(8), 'Good morning');
  assert.equal(greetingForHour(14), 'Good afternoon');
  assert.equal(greetingForHour(21), 'Good evening');
  assert.equal(greetingForHour(1), 'Good evening');
});
test('momentum rises from saved practice, declines on completed inactive days, and preserves day details', () => {
  const snapshot = state();
  snapshot.results.push({
    id: 'r',
    activity_id: 'a',
    skill: 'reading',
    correct: 2,
    total: 2,
    answers: '{}',
    completed_at: '2026-10-08T15:00:00Z',
    day: '2026-10-08',
    active_seconds: 60,
    title: 'A short reading',
    document_id: null,
  });
  snapshot.tutorAttempts.push({
    id: 'attempt',
    document_id: 'pdf',
    question_id: 'q',
    prompt: 'What happened?',
    answer: 'A journey.',
    correct: null,
    feedback: 'Saved without a grade.',
    source_paragraph: 0,
    created_at: '2026-10-10T16:00:00Z',
  });
  const points = practiceDays(snapshot, 7);
  const first = points.find((day) => day.day === '2026-10-08')!,
    inactive = points.find((day) => day.day === '2026-10-09')!,
    next = points.find((day) => day.day === '2026-10-10')!;
  assert.ok(first.score > 0);
  assert.ok(inactive.score < first.score);
  assert.ok(next.score > inactive.score);
  assert.equal(first.activities[0].title, 'A short reading');
  assert.equal(next.attempts[0].answer, 'A journey.');
  assert.equal(
    points.at(-1)!.score,
    points.at(-2)!.score,
    'an unfinished day without records is not penalized yet',
  );
});

test('recorded oral practice contributes only its technical duration and a saved event to the habit graph', () => {
  const snapshot = state();
  const id = '67b72694-7aee-4d4a-92f1-2744b0b18897';
  snapshot.tutorMessages.push({
    id,
    document_id: 'voice-room',
    role: 'user',
    mode: 'user',
    sources: '[]',
    created_at: '2026-10-13T15:00:00Z',
    content: JSON.stringify({
      id,
      kind: 'oral-v1',
      mode: 'recording',
      level: 'A2',
      duration: 60,
      mime: 'audio/webm',
    }),
  });
  const day = practiceDays(snapshot, 7).at(-1)!;
  assert.equal(day.practised, true);
  assert.equal(day.minutes, 1);
  assert.equal(day.messages.length, 1);
  assert.equal(day.activities.length, 0);
});
