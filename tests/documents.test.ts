import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
import { initialize } from '../src/lib/schema';
import { createLearningService } from '../src/lib/domain';
import { documentMutation } from '../src/lib/document-store';
import { merge, stamp, tables, type Manifest } from '../src/lib/browser/merge';

test('Trash keeps a PDF, source references, reading progress and tutor history intact for restoration', () => {
  const connection = new DatabaseSync(':memory:');
  try {
    connection.exec('PRAGMA foreign_keys=ON');
    initialize(connection);
    const service = createLearningService({
      db: () => connection,
      transaction: (fn) => fn(),
      uuid: randomUUID,
    });
    connection
      .prepare('INSERT INTO documents VALUES(?,?,?,?,?,?,?,?,?,?,?)')
      .run(
        'personal-pdf',
        'My PDF',
        'Your material',
        'Unassessed',
        'pdf',
        2,
        '',
        '["The first page has a story.","The second page explains a detail."]',
        '[]',
        'personal-pdf.pdf',
        '2026-10-13T12:00:00Z',
      );
    connection
      .prepare('INSERT INTO document_sections VALUES(?,?,?,?)')
      .run('section-two', 'personal-pdf', 1, 2);
    connection
      .prepare('INSERT INTO reading_progress VALUES(?,?,?,?)')
      .run('personal-pdf', 1, '{"q1":1}', '2026-10-13T12:01:00Z');
    connection
      .prepare('INSERT INTO tutor_messages VALUES(?,?,?,?,?,?,?)')
      .run(
        'reply',
        'personal-pdf',
        'assistant',
        'A saved conversation.',
        '[1]',
        'guided',
        '2026-10-13T12:02:00Z',
      );
    documentMutation(connection, 'documents/trash', { id: 'personal-pdf' });
    documentMutation(connection, 'documents/trash', { id: 'personal-pdf' });
    assert.ok(!service.documents().some((doc) => doc.id === 'personal-pdf'));
    const snapshot = service.snapshot();
    const removed = snapshot.trashedDocuments!.find((doc) => doc.id === 'personal-pdf')!;
    assert.equal(removed.source, 'trash:pdf');
    assert.equal(removed.filename, 'personal-pdf.pdf');
    assert.equal(removed.paragraph, 1);
    assert.deepEqual(removed.pages, [null, 2]);
    assert.deepEqual(removed.draft, { q1: 1 });
    assert.equal(snapshot.tutorMessages[0].content, 'A saved conversation.');
    documentMutation(connection, 'documents/restore', { id: 'personal-pdf' });
    const restored = service.documents().find((doc) => doc.id === 'personal-pdf')!;
    assert.equal(restored.source, 'pdf');
    assert.equal(restored.paragraph, 1);
    assert.deepEqual(service.snapshot().trashedDocuments, []);
    assert.deepEqual(connection.prepare('PRAGMA foreign_key_check').all(), []);
    assert.throws(
      () =>
        documentMutation(connection, 'documents/trash', {
          id: service.documents().find((doc) => doc.source === 'editorial')!.id,
        }),
      /Editorial readings/,
    );
    assert.throws(
      () => documentMutation(connection, 'documents/trash', { id: 'missing' }),
      /Document not found/,
    );
  } finally {
    connection.close();
  }
});

test('a stale second device cannot bring a trashed PDF back, and a later restore keeps both devices history', () => {
  const initial: Manifest = {
    version: 1,
    data: Object.fromEntries(tables.map((table) => [table, []])),
  };
  initial.data.documents = [{ id: 'pdf', source: 'pdf', filename: 'pdf.pdf' }];
  const base = stamp(initial, undefined, 'seed', 1);
  const removed = structuredClone(base);
  removed.data.documents[0].source = 'trash:pdf';
  const deletion = stamp(removed, base, 'notebook', 2);
  const offline = structuredClone(base);
  offline.data.reading_progress = [{ document_id: 'pdf', paragraph: 3 }];
  offline.data.tutor_messages = [
    { id: 'message', document_id: 'pdf', content: 'An offline answer.' },
  ];
  const otherDevice = stamp(offline, base, 'phone', 3);
  const combined = merge(deletion, otherDevice);
  assert.equal(combined.data.documents[0].source, 'trash:pdf');
  assert.equal(combined.data.reading_progress[0].paragraph, 3);
  assert.equal(combined.data.tutor_messages.length, 1);
  assert.deepEqual(merge(deletion, otherDevice), merge(otherDevice, deletion));
  const restored = structuredClone(combined);
  restored.data.documents[0].source = 'pdf';
  const result = merge(stamp(restored, combined, 'notebook', 4), deletion);
  assert.equal(result.data.documents[0].source, 'pdf');
  assert.equal(result.data.tutor_messages.length, 1);
  assert.equal(result.data.documents[0].filename, 'pdf.pdf');
});
