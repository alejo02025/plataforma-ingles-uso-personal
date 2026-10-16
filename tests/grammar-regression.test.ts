import { test } from 'node:test';
import assert from 'node:assert/strict';
import { englishBuilderVerbs, portugueseBuilderVerbs } from '../src/locales/learning/builder-verbs';
import { englishSubjects, portugueseSubjects } from '../src/locales/learning/foundations';
import { buildReferenceSentence as build } from '../src/locales/learning/sentence-builder';
import {
  builderStructure,
  spanishBuilderStructure,
} from '../src/locales/learning/builder-structure';

test('Portuguese past preserves c/qu, g/gu and ç/c without changing the other persons', () => {
  for (const [id, first, third] of [
    ['pagar', 'paguei', 'pagou'],
    ['chegar', 'cheguei', 'chegou'],
    ['começar', 'comecei', 'começou'],
    ['praticar', 'pratiquei', 'praticou'],
    ['buscar', 'busquei', 'buscou'],
    ['publicar', 'publiquei', 'publicou'],
    ['alcançar', 'alcancei', 'alcançou'],
    ['carregar', 'carreguei', 'carregou'],
  ]) {
    const v = portugueseBuilderVerbs.find((v) => v.id === id)!;
    assert.match(
      build(true, v, portugueseSubjects[0], 'past', 'statement').text,
      new RegExp(`^Eu ${first} `),
    );
    assert.match(
      build(true, v, portugueseSubjects[0], 'past', 'negative').text,
      new RegExp(`^Eu não ${first} `),
    );
    assert.match(
      build(true, v, portugueseSubjects[1], 'past', 'question').text,
      new RegExp(`^Você ${third} .*\\?$`),
    );
  }
  const pagar = portugueseBuilderVerbs.find((v) => v.id === 'pagar')!;
  assert.equal(
    build(true, pagar, portugueseSubjects[0], 'past', 'statement').translation,
    'Yo pagué la cuenta.',
  );
});

test('Portuguese stem and written stress exceptions are preserved in all relevant persons', () => {
  const construir = portugueseBuilderVerbs.find((v) => v.id === 'construir')!;
  assert.equal(
    build(true, construir, portugueseSubjects[0], 'imperfect', 'statement').text,
    'Eu construía uma casa.',
  );
  assert.equal(
    build(true, construir, portugueseSubjects[4], 'imperfect', 'negative').text,
    'Nós não construíamos uma casa.',
  );
  assert.equal(
    build(true, construir, portugueseSubjects[5], 'imperfect', 'question').text,
    'Vocês construíam uma casa?',
  );
  const odiar = portugueseBuilderVerbs.find((v) => v.id === 'odiar')!;
  assert.equal(
    build(true, odiar, portugueseSubjects[0], 'present', 'statement').text,
    'Eu odeio barulho.',
  );
  assert.equal(
    build(true, odiar, portugueseSubjects[5], 'subjunctive', 'negative').text,
    'Espero que vocês não odeiem barulho.',
  );
  assert.equal(
    build(true, odiar, portugueseSubjects[4], 'subjunctive', 'statement').text,
    'Espero que nós odiemos barulho.',
  );
});

test('English scaffold follows the selected person, polarity and actual imperative model', () => {
  const study = englishBuilderVerbs.find((v) => v.id === 'study')!;
  const she = englishSubjects.find((s) => s.id === 'she')!;
  const we = englishSubjects.find((s) => s.id === 'we')!;
  const you = englishSubjects.find((s) => s.id === 'you')!;
  const cases = [
    [
      'present',
      'question',
      she,
      'Does she study English?',
      'does + subject + base verb + complement + ?',
    ],
    [
      'past',
      'negative',
      she,
      'She did not study English.',
      'subject + did + not + base verb + complement',
    ],
    [
      'present-perfect',
      'question',
      she,
      'Has she studied English?',
      'has + subject + past participle + complement + ?',
    ],
    [
      'imperative',
      'negative',
      we,
      "Let's not study English.",
      "let's + not + base verb + complement",
    ],
    [
      'imperative',
      'question',
      you,
      'Could you study English, please?',
      'could + you + base verb + complement + please + ?',
    ],
    [
      'gerund',
      'negative',
      she,
      'She does not check the instructions before studying English.',
      'subject + does + not + check + detail + before + verb-ing',
    ],
  ] as const;
  for (const [time, kind, subject, text, scaffold] of cases) {
    assert.equal(build(false, study, subject, time, kind).text, text);
    assert.equal(builderStructure(false, time, kind, study, subject), scaffold);
    assert.match(spanishBuilderStructure(scaffold), /verbo|participio/);
  }
  const be = englishBuilderVerbs.find((v) => v.id === 'be')!;
  assert.equal(
    builderStructure(false, 'past', 'question', be, we),
    'were + subject + complement + ?',
  );
  assert.equal(build(false, be, we, 'past', 'question').text, 'Were we at home?');
});

test('Portuguese non-finite and compound-subjunctive scaffolds match their actual model', () => {
  const study = portugueseBuilderVerbs.find((v) => v.id === 'estudar')!;
  assert.equal(
    builderStructure(true, 'infinitive', 'negative', study),
    'sujeito + não + pretender no presente + infinitivo + complemento',
  );
  assert.equal(
    builderStructure(true, 'infinitive-perfect', 'negative', study),
    'sujeito + não + lembrar no presente + de + ter (infinitivo pessoal) + particípio + complemento',
  );
  assert.doesNotMatch(builderStructure(true, 'subjunctive-past', 'statement', study), /composto/);
  assert.match(
    builderStructure(true, 'subjunctive-perfect', 'statement', study),
    /ter no subjuntivo \+ particípio/,
  );
  assert.match(
    builderStructure(true, 'subjunctive-future-perfect', 'question', study),
    /^Quando.*ter no subjuntivo.*será melhor.*\?/,
  );
  assert.equal(
    spanishBuilderStructure(
      builderStructure(false, 'past', 'negative', englishBuilderVerbs[0], englishSubjects[0]),
    ),
    'sujeto + was + not + complemento',
  );
});
