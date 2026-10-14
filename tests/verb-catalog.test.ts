import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { englishTenses, portugueseTenses } from '../src/locales/learning/tense-reference';
for (const lang of ['en', 'pt'])
  test(`Offline ${lang} verbs contain thousands of distinct sense-aligned entries`, () => {
    const rows = JSON.parse(readFileSync(`public/assets/verbs/${lang}.json`, 'utf8')) as {
      word: string;
      senses: { id: string; es: string[]; gloss: string }[];
    }[];
    assert.ok(rows.length >= 2000);
    assert.equal(new Set(rows.map((r) => r.word)).size, rows.length);
    for (const r of rows) {
      assert.ok(r.senses.length);
      for (const s of r.senses) {
        assert.match(s.id, /^\d{8}-v$/);
        assert.ok(s.es.length);
        assert.ok(s.gloss.length);
      }
    }
    const core = rows.find((r) => r.word === (lang === 'en' ? 'study' : 'estudar'));
    assert.ok(core?.senses.some((s) => s.es.includes('estudiar')));
  });
test('Tense reference covers twelve English combinations and Portuguese simple and compound moods', () => {
  assert.equal(
    englishTenses.filter((t) => ['Present', 'Past', 'Future'].includes(t.group)).length,
    12,
  );
  for (const name of [
    'Presente do subjuntivo',
    'Pretérito imperfeito do subjuntivo',
    'Futuro do subjuntivo',
    'Futuro composto do subjuntivo',
    'Infinitivo impessoal e pessoal',
    'Imperativo afirmativo e negativo',
  ])
    assert.ok(portugueseTenses.some((t) => t.name === name));
  for (const t of [...englishTenses, ...portugueseTenses]) {
    assert.equal(t.examples.length, 3);
    assert.ok(t.examples[2].includes('?'));
    assert.ok(t.translation && t.use && t.tip);
  }
});
