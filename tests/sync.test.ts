import { test } from 'node:test';
import assert from 'node:assert/strict';
import { merge, stamp, tables, validate, type Manifest } from '../src/lib/browser/merge';
function empty(): Manifest {
  return { version: 1, data: Object.fromEntries(tables.map((table) => [table, []])) };
}
test('sincronización combina cambios independientes de dos dispositivos y mantiene las finalizaciones', () => {
  const initial = empty();
  initial.data.profile = [{ id: 1, name: 'Alejo', theme: 'light' }];
  initial.data.activities = [{ id: 'reading', completed_at: null, payload: '{}' }];
  const base = stamp(initial, undefined, 'seed', 1);
  const first = structuredClone(base);
  first.data.profile[0].name = 'Alejo B';
  first.data.activities[0].completed_at = '2026-10-13';
  first.data.reviews = [{ id: 'review-a', word_id: 'word', known: 1 }];
  const second = structuredClone(base);
  second.data.profile[0].theme = 'dark';
  second.data.reviews = [{ id: 'review-b', word_id: 'word', known: 0 }];
  const left = stamp(first, base, 'notebook', 2),
    right = stamp(second, base, 'phone', 3);
  const result = merge(left, right);
  assert.deepEqual(result.data.profile, [{ id: 1, name: 'Alejo B', theme: 'dark' }]);
  assert.equal(result.data.activities[0].completed_at, '2026-10-13');
  assert.equal(result.data.reviews.length, 2);
  assert.deepEqual(merge(left, right), merge(right, left));
  assert.deepEqual(merge(result, result), result);
});
test('dos intentos offline conservan sus resultados y referencias al combinarse', () => {
  const first = empty();
  first.data.plans = [{ id: 'plan-a', day: '2026-10-13' }];
  first.data.activities = [{ id: 'activity', plan_id: 'plan-a', payload: '{}' }];
  first.data.sessions = [{ id: 's-a', activity_id: 'activity' }];
  first.data.results = [{ id: 'r-a', activity_id: 'activity', session_id: 's-a', correct: 2 }];
  const second = structuredClone(first);
  second.data.plans[0].id = 'plan-b';
  second.data.activities[0].plan_id = 'plan-b';
  second.data.sessions = [{ id: 's-b', activity_id: 'activity' }];
  second.data.results = [{ id: 'r-b', activity_id: 'activity', session_id: 's-b', correct: 1 }];
  const result = merge(first, second);
  assert.equal(result.data.results.length, 2);
  assert.equal(result.data.plans.length, 1);
  assert.equal(new Set(result.data.results.map((r) => r.activity_id)).size, 2);
  for (const row of result.data.results)
    assert.ok(result.data.activities.some((a) => a.id === row.activity_id));
  assert.deepEqual(merge(result, result).data, result.data);
});
test('el respaldo rechaza tablas y valores no compatibles sin ejecutar SQL remoto', () => {
  assert.throws(() =>
    validate({ version: 1, data: { ...empty().data, 'profile; DROP TABLE documents': [] } }),
  );
  assert.throws(() =>
    validate({
      version: 1,
      data: { ...empty().data, profile: [{ id: 1, name: { invalid: true } }] },
    }),
  );
});

test('los planes reemplazados después del diagnóstico no reaparecen desde un dispositivo atrasado', () => {
  const initial = empty();
  initial.data.plans = [{ id: 'p', day: '2026-10-13' }];
  initial.data.activities = [{ id: 'old', plan_id: 'p', payload: '{}' }];
  const base = stamp(initial, undefined, 'device', 1);
  const updated = structuredClone(base);
  updated.data.activities = [{ id: 'new', plan_id: 'p', payload: '{}' }];
  const current = stamp(updated, base, 'device', 2);
  assert.deepEqual(
    merge(current, base).data.activities.map((row) => row.id),
    ['new'],
  );
  const learning = structuredClone(base);
  learning.data.sessions = [{ id: 'session', activity_id: 'old' }];
  const combined = merge(current, stamp(learning, base, 'phone', 3));
  assert.equal(combined.data.activities.length, 2);
  assert.ok(
    combined.data.activities.some((row) => row.id === combined.data.sessions[0].activity_id),
  );
});

test('study spaces refuse cross-language backups and merges while preserving legacy English backups', () => {
  const english = empty();
  assert.equal(validate(structuredClone(english)).version, 1);
  const portuguese: Manifest = { ...empty(), workspace: 'pt' };
  assert.throws(() => validate(portuguese), /different study space/);
  assert.throws(() => merge(english, portuguese), /Different study spaces/);
  assert.deepEqual(english.data.documents, []);
});
