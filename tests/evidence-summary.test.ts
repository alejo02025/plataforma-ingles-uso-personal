import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evidenceSummary } from '../src/lib/evidence-summary';
import type { Snapshot, Result } from '../src/lib/types';
import { voiceDocumentId } from '../src/lib/voice';

function state(): Snapshot {
  return {
    profile: { name: 'Alejo', daily_minutes: 20, interests: [], theme: 'light' },
    day: '2026-10-14',
    aiAvailable: false,
    protected: false,
    diagnostic: { id: 'd', completed_at: null, answers: [] },
    questions: [],
    documents: [],
    resumeActivity: null,
    plan: { day: '2026-10-14', minutes: 20, reason: '', activities: [] },
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
function result(
  id: string,
  skill: Result['skill'],
  correct: number | null,
  total: number | null,
  answers = '{}',
  day = '2026-10-14',
): Result {
  return {
    id,
    activity_id: id,
    skill,
    correct,
    total,
    answers,
    day,
    completed_at: `${day}T15:00:00Z`,
    active_seconds: 0,
    title: 'Practice',
    document_id: null,
  };
}
test('observed accuracy excludes self-ratings, aided attempts and unscored writing without conflating effort with mastery', () => {
  const data = state();
  data.results = [
    result('routine:words', 'vocabulary', 2, 3),
    result('game:review', 'vocabulary', 1, 1, '{"helpUsed":true}'),
    result('review:legacy', 'vocabulary', 1, 1),
    result('class:grammar', 'grammar', 4, 5),
    result('grammar:bad', 'grammar', 1, 3, 'not valid JSON'),
    result('write', 'writing', null, null, '{"text":"I am practising."}'),
    result('reading', 'reading', 1, 2),
  ];
  const original = JSON.stringify(data),
    summary = evidenceSummary(data);
  assert.deepEqual(
    summary.skills.find((s) => s.skill === 'vocabulary'),
    { skill: 'vocabulary', attempts: 1, correct: 2, total: 3, accuracy: 67 },
  );
  assert.equal(summary.skills.find((s) => s.skill === 'grammar')!.total, 5);
  assert.equal(summary.activities, 7);
  assert.equal(summary.writing, 1);
  assert.equal(summary.days, 1);
  assert.equal(JSON.stringify(data), original, 'read-only summary must preserve all records');
});
test('weekly records use Argentina study days, exclude future dates and do not treat saved words as completed study days', () => {
  const data = state();
  data.results = [
    result('old', 'grammar', 1, 2, '{}', '2026-10-07'),
    result('first', 'grammar', 1, 2, '{}', '2026-10-08'),
    result('last', 'grammar', 1, 2),
    result('future', 'grammar', 1, 2, '{}', '2026-10-15'),
  ];
  data.sessions = [
    {
      id: 'late',
      activity_id: 'x',
      title: 'Practice',
      kind: 'grammar',
      started_at: '2026-10-08T02:30:00Z',
      ended_at: null,
      active_seconds: 600,
    },
    {
      id: 'in',
      activity_id: 'x',
      title: 'Practice',
      kind: 'grammar',
      started_at: '2026-10-08T03:30:00Z',
      ended_at: null,
      active_seconds: 120,
    },
  ];
  const word = {
    id: 'w',
    word: 'ticket',
    meaning: 'boleto',
    pronunciation: '',
    example: '',
    source_id: null,
    created_at: '2026-10-09T15:00:00Z',
    due_at: '2026-10-14T03:00:00Z',
    interval: 0,
    ease: 2.5,
    reviews: 0,
  };
  data.vocabulary = [
    word,
    { ...word, id: 'future-word', due_at: '2026-10-15T15:00:00Z' },
    { ...word, id: 'legacy', due_at: '' },
  ];
  const summary = evidenceSummary(data);
  assert.equal(summary.activities, 2);
  assert.equal(summary.days, 2);
  assert.equal(summary.minutes, 2);
  assert.equal(summary.due, 1);
});

test('oral practice distinguishes recordings from scored synthetic listening and ignores helped scores', () => {
  const data = state();
  data.tutorMessages = [
    {
      id: '11111111-1111-4111-8111-111111111111',
      mode: 'listening',
      helpUsed: false,
      answers: [0, 1],
      duration: 0,
    },
    {
      id: '22222222-2222-4222-8222-222222222222',
      mode: 'listening',
      helpUsed: true,
      answers: [0, 0],
      duration: 0,
    },
    {
      id: '33333333-3333-4333-8333-333333333333',
      mode: 'recording',
      helpUsed: false,
      answers: [],
      duration: 12,
    },
  ].map((a) => ({
    id: a.id,
    document_id: voiceDocumentId,
    role: 'user',
    content: JSON.stringify({ kind: 'oral-v1', level: 'A2', heard: a.mode === 'listening', ...a }),
    sources: '',
    mode: 'local',
    created_at: '2026-10-14T15:00:00Z',
  }));
  const summary = evidenceSummary(data);
  assert.deepEqual(summary.listening, { correct: 1, total: 2, attempts: 1 });
  assert.equal(summary.recordings, 1);
  assert.equal(summary.skills.find((s) => s.skill === 'grammar')!.total, 0);
  assert.equal(summary.writing, 0);
});
