import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  buildSentence,
  englishSubjects,
  portugueseSubjects,
  englishVerbs,
  portugueseVerbs,
  verbPart,
  type Tense,
  type SentenceKind,
} from '../src/locales/learning/foundations';
import { reviewedHelp, findWordHelp, cleanWord } from '../src/lib/word-help';
test('Sentence models distinguish auxiliaries, be, Brazilian future and formal future without inventing a grade', () => {
  const study = englishVerbs.find((v) => v.id === 'study')!,
    she = englishSubjects.find((s) => s.id === 'she')!;
  assert.equal(
    buildSentence(false, study, she, 'present', 'question').text,
    'Does she study English?',
  );
  assert.equal(
    buildSentence(false, study, she, 'past', 'negative').text,
    'She did not study English.',
  );
  assert.equal(
    buildSentence(false, study, she, 'future', 'statement').text,
    'She will study English.',
  );
  assert.equal(
    buildSentence(false, study, she, 'plans', 'question').text,
    'Is she going to study English?',
  );
  const be = englishVerbs[0];
  assert.equal(buildSentence(false, be, she, 'past', 'question').text, 'Was she at home?');
  const pt = portugueseVerbs.find((v) => v.id === 'estudar')!,
    voce = portugueseSubjects.find((s) => s.id === 'voce')!;
  assert.equal(
    buildSentence(true, pt, voce, 'present', 'negative').text,
    'Você não estuda português.',
  );
  assert.equal(
    buildSentence(true, pt, voce, 'future', 'statement').text,
    'Você vai estudar português.',
  );
  assert.equal(
    buildSentence(true, pt, voce, 'plans', 'statement').text,
    'Você estudará português.',
  );
  assert.equal(
    buildSentence(true, pt, voce, 'past', 'question').translation,
    '¿Vos estudiaste portugués?',
  );
  const fazer = portugueseVerbs.find((v) => v.id === 'fazer')!;
  assert.equal(verbPart(true, fazer, portugueseSubjects[0], 'plans'), 'farei');
  for (const [pt, verbs, subjects] of [
    [false, englishVerbs, englishSubjects],
    [true, portugueseVerbs, portugueseSubjects],
  ] as const)
    for (const verb of verbs)
      for (const subject of subjects)
        for (const tense of ['present', 'past', 'future', 'plans'] as Tense[])
          for (const kind of ['statement', 'negative', 'question'] as SentenceKind[]) {
            const result = buildSentence(pt, verb, subject, tense, kind);
            assert.ok(
              !result.text.includes('undefined') && result.translation && result.explanation,
            );
            assert.ok(verbPart(pt, verb, subject, tense));
          }
});
test('Word help gives curated Spanish support, loads the bundled dictionary and admits missing entries', async () => {
  assert.equal(cleanWord('“I’m,”'), "i'm");
  assert.match(reviewedHelp('the')!.translation, /El/);
  assert.match(reviewedHelp('studied')!.usage, /estudié/);
  assert.equal(reviewedHelp('will study')!.source, 'reviewed');
  const fetch = globalThis.fetch;
  try {
    globalThis.fetch = async (input) => {
      assert.match(String(input), /\/assets\/word-help\/en\.json/);
      return new Response(readFileSync('public/assets/word-help/en.json'), {
        headers: { 'Content-Type': 'application/json' },
      });
    };
    const word = await findWordHelp('umbrella', 'I need an umbrella.');
    assert.equal(word.source, 'dictionary');
    assert.match(word.translation, /paraguas/i);
    const missing = await findWordHelp('zzzxnonexistent');
    assert.equal(missing.source, 'missing');
    assert.match(missing.translation, /no tengo una traducción fiable/);
  } finally {
    globalThis.fetch = fetch;
  }
});
