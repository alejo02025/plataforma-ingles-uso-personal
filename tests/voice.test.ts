import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
import { initialize } from '../src/lib/schema';
import { createLearningService } from '../src/lib/domain';
import { voiceMutation } from '../src/lib/voice-store';
import { checkedVoiceReply, coachResponse } from '../src/lib/voice';
test('Voice history persists separately from PDFs and records real learner messages without an invented pronunciation grade', () => {
  const db = new DatabaseSync(':memory:');
  try {
    initialize(db);
    const service = createLearningService({
      db: () => db,
      transaction: (fn) => fn(),
      uuid: randomUUID,
    });
    const before = service.snapshot();
    const message = {
      id: randomUUID(),
      role: 'user',
      content: 'Today I walked to the park.',
      mode: 'user',
    };
    voiceMutation(db, message);
    voiceMutation(db, message);
    voiceMutation(db, {
      id: randomUUID(),
      role: 'assistant',
      content: 'What did you see there?',
      mode: 'local',
    });
    const after = service.snapshot();
    assert.deepEqual(after.documents, before.documents);
    assert.equal(after.tutorMessages.filter((m) => m.document_id === 'voice-room').length, 2);
    assert.deepEqual(after.results, before.results);
    assert.deepEqual(after.evaluations, before.evaluations);
  } finally {
    db.close();
  }
});
test('The AI tutor does not repeat fictional degrees or years of employment as real credentials', () => {
  assert.ok(
    !checkedVoiceReply('I have 30 years of teaching experience and won an award.').includes(
      '30 years',
    ),
  );
  assert.equal(
    checkedVoiceReply('That sounds interesting. What did you enjoy?'),
    'That sounds interesting. What did you enjoy?',
  );
});

test('An echo or repetitive model reply becomes a labelled, well-formed practice prompt', () => {
  assert.equal(
    coachResponse('Today I went to the park.', 'Today I went to the park.', 0).mode,
    'guided',
  );
  assert.equal(
    coachResponse('Ao parque, eu faz o que o que eu apreciado.', 'Hoje eu fui ao parque.', 0).mode,
    'guided',
  );
  assert.equal(
    coachResponse('That sounds interesting. What did you enjoy?', 'I read a book.', 0).mode,
    'local',
  );
});
