import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { initialize } from '../src/lib/schema';
import { glossary } from '../src/lib/content';

test('English migration preserves learner history, drafts and custom definitions on repeated startup', () => {
  const db = new DatabaseSync(':memory:');
  try {
    db.exec('PRAGMA foreign_keys=ON');
    initialize(db);
    db.exec('DELETE FROM schema_migrations WHERE version=3');
    db.prepare('UPDATE profile SET name=?,interests=?,theme=? WHERE id=1').run(
      'My name',
      '["Viajes","My hobby"]',
      'dark',
    );
    const doc = db.prepare('SELECT id FROM documents LIMIT 1').get()!.id as string;
    db.prepare('INSERT INTO reading_progress VALUES(?,?,?,?)').run(
      doc,
      1,
      '{"q1":2}',
      '2026-10-12T12:00:00Z',
    );
    db.prepare('INSERT INTO diagnostics VALUES(?,?,?)').run('old-diagnosis', '2026-10-12', null);
    db.prepare('INSERT INTO diagnostic_answers VALUES(?,?,?,?)').run('old-diagnosis', 'd1', 1, 1);
    const insert = db.prepare('INSERT INTO vocabulary VALUES(?,?,?,?,?,?,?,?,?,?,?)');
    insert.run(
      'old-word',
      'narrow',
      'estrecho/a',
      '',
      '',
      null,
      '2026-10-12',
      '2026-10-13',
      1,
      2.5,
      3,
    );
    insert.run(
      'my-word',
      'fees',
      'My own explanation',
      '',
      '',
      null,
      '2026-10-12',
      '2026-10-13',
      1,
      2.5,
      3,
    );
    initialize(db);
    initialize(db);
    const profile = db.prepare('SELECT * FROM profile').get()!;
    assert.equal(profile.name, 'My name');
    assert.equal(profile.theme, 'dark');
    assert.deepEqual(JSON.parse(profile.interests as string), ['Travel', 'My hobby']);
    assert.equal(db.prepare('SELECT draft FROM reading_progress').get()!.draft, '{"q1":2}');
    assert.equal(db.prepare('SELECT answer FROM diagnostic_answers').get()!.answer, 1);
    assert.equal(
      db.prepare('SELECT meaning FROM vocabulary WHERE id=?').get('old-word')!.meaning,
      glossary.narrow.meaning,
    );
    assert.equal(
      db.prepare('SELECT meaning FROM vocabulary WHERE id=?').get('my-word')!.meaning,
      'My own explanation',
    );
    assert.equal(
      db.prepare('SELECT reviews FROM vocabulary WHERE id=?').get('old-word')!.reviews,
      3,
    );
    assert.equal(db.prepare('SELECT count(*) AS count FROM schema_migrations').get()!.count, 5);
  } finally {
    db.close();
  }
});
