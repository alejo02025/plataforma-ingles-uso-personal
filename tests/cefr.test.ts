import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { initialize } from '../src/lib/schema';
import { cefrCourse, cefrLevels } from '../src/lib/cefr-curriculum';
import { cefrMutation } from '../src/lib/cefr-store';
import { merge, tables, type Manifest } from '../src/lib/browser/merge';
test('Every CEFR stage contains progressively different Portuguese reading, grammar, writing and speaking practices', () => {
  assert.deepEqual(
    cefrCourse.map((unit) => unit.level),
    ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
  );
  for (const unit of cefrCourse) {
    assert.equal(unit.tasks.length, 4);
    assert.ok(unit.canDo);
    assert.ok(unit.text);
    for (const task of unit.tasks) if (task.options) assert.ok(task.options[task.answer!]);
  }
  assert.ok(cefrCourse[5].text.length > cefrCourse[0].text.length);
});
test('Legacy starter tasks cannot bypass the connected course or unlock a future level', () => {
  const db = new DatabaseSync(':memory:');
  try {
    initialize(db);
    db.prepare('INSERT INTO cefr_state VALUES(?,?,?)').run('route', 'A1', new Date().toISOString());
    for (const task of cefrCourse[0].tasks)
      db.prepare('INSERT INTO cefr_attempts VALUES(?,?,?,?,?,?)').run(
        randomUUID(),
        'A1',
        task.id,
        task.options ? '0' : 'Minha prática anterior continua guardada.',
        task.options ? 1 : null,
        new Date().toISOString(),
      );
    assert.throws(() => cefrMutation(db, 'cefr/advance', {}), /cuatro prácticas no bastan/);
    assert.throws(
      () =>
        cefrMutation(db, 'cefr/answer', {
          id: randomUUID(),
          level: 'C2',
          task: 'reading',
          answer: '0',
        }),
      /bloqueado/,
    );
    assert.equal(db.prepare('SELECT count(*) AS n FROM cefr_attempts').get()!.n, 4);
    assert.equal(db.prepare('SELECT count(*) AS n FROM evaluations').get()!.n, 0);
  } finally {
    db.close();
  }
});
test('A stale device cannot move the CEFR route back after an advance', () => {
  const base = () => ({
    version: 1 as const,
    data: Object.fromEntries(tables.map((table) => [table, []])),
  });
  const left: Manifest = base(),
    right: Manifest = base();
  left.data.cefr_state = [{ id: 'route', level: 'B1', updated_at: '2026-10-13' }] as never[];
  right.data.cefr_state = [{ id: 'route', level: 'A1', updated_at: '2026-10-14' }] as never[];
  left.clocks = { 'cefr_state/route': { level: '0000000000000001:a' } };
  right.clocks = { 'cefr_state/route': { level: '0000000000000002:b' } };
  assert.equal(merge(left, right).data.cefr_state[0].level, 'B1');
  assert.equal(merge(right, left).data.cefr_state[0].level, 'B1');
});
