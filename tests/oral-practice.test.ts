import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { initialize } from '../src/lib/schema';
import { createLearningService } from '../src/lib/domain';
import { saveOralAttempt } from '../src/lib/oral-store';
import { oralEvidence, oralTask } from '../src/lib/oral-practice';
import { dailyRewards } from '../src/lib/daily-rewards';
import { evidenceSummary } from '../src/lib/evidence-summary';
import { validate } from '../src/lib/browser/merge';
import { tables } from '../src/lib/browser/merge';
const listening = () => ({
  id: randomUUID(),
  kind: 'oral-v1' as const,
  mode: 'listening' as const,
  level: 'A2' as const,
  duration: 0,
  answers: [0, 1],
  heard: true,
});
test('listening answers are recomputed, assisted practice is separate, and repeated IDs retain the original responses', () => {
  const db = new DatabaseSync(':memory:');
  try {
    initialize(db);
    const service = createLearningService({
      db: () => db,
      uuid: randomUUID,
      transaction: (f) => f(),
    });
    const before = service.snapshot();
    const first = listening();
    assert.equal(saveOralAttempt(db, first).correct, 1);
    const replay = saveOralAttempt(db, { ...first, answers: [0, 0] });
    assert.equal(replay.correct, 1);
    assert.deepEqual(replay.evidence.answers, [0, 1]);
    assert.equal(replay.repeated, true);
    const aided = saveOralAttempt(db, { ...listening(), answers: [0, 0], heard: false });
    assert.equal(
      aided.evidence.helpUsed,
      true,
      'reading a transcript without finished audio is not independent listening',
    );
    assert.throws(() => saveOralAttempt(db, { ...listening(), correct: 2 }), /Unrecognized key/);
    assert.throws(() => saveOralAttempt(db, { ...listening(), level: 'B2' }), /current level/);
    assert.throws(() => saveOralAttempt(db, { ...listening(), answers: [0] }), /both/);
    const after = service.snapshot();
    assert.deepEqual(after.results, before.results);
    assert.deepEqual(after.evaluations, before.evaluations);
    assert.equal(oralEvidence(after).length, 2);
    assert.equal(dailyRewards(after).currentStreak, 1);
    assert.deepEqual(evidenceSummary(after).listening, { correct: 1, total: 2, attempts: 1 });
    assert.equal(after.courseCheckpoints?.length || 0, 0);
  } finally {
    db.close();
  }
});
test('recordings preserve text metadata in existing backups, remain unassessed and never become class scores', () => {
  const db = new DatabaseSync(':memory:');
  try {
    initialize(db);
    const service = createLearningService({
      db: () => db,
      uuid: randomUUID,
      transaction: (f) => f(),
    });
    const input = {
      id: randomUUID(),
      kind: 'oral-v1',
      mode: 'recording',
      level: 'A2',
      duration: 12.3,
      mime: 'audio/webm;codecs=opus',
      transcript: 'Yesterday I bought a ticket.',
      transcriptSource: 'manual',
      note: 'Practise past verb forms.',
    };
    const response = saveOralAttempt(db, input);
    assert.equal(response.correct, null);
    assert.equal(response.total, null);
    assert.throws(
      () => saveOralAttempt(db, { ...input, id: randomUUID(), duration: 0 }),
      /Record audio/,
    );
    assert.throws(
      () => saveOralAttempt(db, { ...input, id: randomUUID(), mime: 'text/html' }),
      /Record audio/,
    );
    assert.throws(
      () => saveOralAttempt(db, { ...input, id: randomUUID(), pronunciation: 100 }),
      /Unrecognized key/,
    );
    assert.throws(() =>
      saveOralAttempt(db, { ...input, id: randomUUID(), transcriptSource: 'browser-local' }),
    );
    const state = service.snapshot();
    assert.equal(oralEvidence(state)[0].transcriptSource, 'manual');
    assert.equal(evidenceSummary(state).recordings, 1);
    assert.equal(state.results.length, 0);
    const backup = validate({
      version: 1,
      workspace: 'en',
      data: Object.fromEntries(tables.map((t) => [t, db.prepare(`SELECT * FROM ${t}`).all()])),
    });
    assert.ok(
      backup.data.tutor_messages.some((r) =>
        String(r.content).includes('Practise past verb forms'),
      ),
    );
    assert.equal(
      JSON.stringify(backup).includes('blob:'),
      false,
      'audio stays in the browser; no temporary URL or binary is falsely exported',
    );
  } finally {
    db.close();
  }
});
test('oral tasks have original contextual progression in both languages and specific Spanish feedback', () => {
  for (const level of ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const)
    for (const pt of [false, true]) {
      const task = oralTask(level, pt);
      assert.ok(task.story.length > 50);
      assert.ok(task.prompt.length > 20);
      assert.equal(task.questions.length, 2);
      for (let i = 0; i < 2; i++) {
        assert.equal(task.options[i].length, 3);
        assert.equal(new Set(task.options[i]).size, 3);
        assert.ok(task.whyNative[i].length > 25);
        assert.ok(task.whySpanish[i].length > 25);
      }
      assert.ok(task.spanishStory && task.spanishPrompt);
    }
});
