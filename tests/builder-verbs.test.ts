import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  englishBuilderVerbs as en,
  portugueseBuilderVerbs as pt,
} from '../src/locales/learning/builder-verbs';
import {
  englishVerbs,
  portugueseVerbs,
  englishSubjects,
  portugueseSubjects,
} from '../src/locales/learning/foundations';
import {
  buildReferenceSentence as build,
  englishBuilderTimes,
  portugueseBuilderTimes,
  builderSubjects,
} from '../src/locales/learning/sentence-builder';
const ev = (id: string) => en.find((v) => v.id === id)!;
const pv = (id: string) => pt.find((v) => v.id === id)!;
const es = (id: string) => englishSubjects.find((s) => s.id === id)!;
const ps = (id: string) => portugueseSubjects.find((s) => s.id === id)!;
test('Expanded builder verbs remain separate from graded class banks and every selected form is complete', () => {
  assert.equal(englishVerbs.length, 15);
  assert.equal(portugueseVerbs.length, 15);
  assert.ok(en.length >= 180 && pt.length >= 175);
  for (const [lang, verbs, times, subjects] of [
    [false, en, englishBuilderTimes, englishSubjects],
    [true, pt, portugueseBuilderTimes, portugueseSubjects],
  ] as const) {
    assert.equal(new Set(verbs.map((v) => v.id)).size, verbs.length);
    for (const v of verbs)
      for (const t of times)
        for (const s of builderSubjects(lang, t.id, [...subjects]))
          for (const kind of ['statement', 'negative', 'question'] as const) {
            const r = build(lang, v, s, t.id, kind);
            assert.ok(
              r.text.length > 6 && !r.text.includes('undefined'),
              `${v.word} ${t.id} ${s.id}`,
            );
            assert.ok(r.translation.length > 6 && !r.translation.includes('undefined'));
          }
  }
});
test('Added English irregular and spelling-sensitive forms have correct Spanish equivalents', () => {
  assert.equal(
    build(false, ev('buy'), es('she'), 'present-perfect', 'negative').text,
    'She has not bought a ticket.',
  );
  assert.equal(build(false, ev('choose'), es('we'), 'past', 'statement').text, 'We chose a book.');
  assert.equal(
    build(false, ev('run'), es('i'), 'present-continuous', 'statement').text,
    'I am running in the park.',
  );
  assert.equal(
    build(false, ev('carry'), es('she'), 'present', 'statement').text,
    'She carries a bag.',
  );
  assert.equal(
    build(false, ev('bring'), es('i'), 'present-perfect', 'statement').translation,
    'Yo he traído un libro.',
  );
  assert.equal(
    build(false, ev('solve'), es('she'), 'present', 'statement').translation,
    'Ella resuelve un problema.',
  );
  assert.equal(
    build(false, ev('solve'), es('i'), 'present-perfect', 'statement').translation,
    'Yo he resuelto un problema.',
  );
  assert.equal(
    build(false, ev('search'), es('i'), 'past', 'statement').translation,
    'Yo busqué un archivo.',
  );
  assert.equal(
    build(false, ev('smile'), es('she'), 'future', 'statement').translation,
    'Ella sonreirá a un amigo.',
  );
  assert.equal(
    build(false, ev('thank'), es('she'), 'subjunctive', 'statement').translation,
    'Es importante que ella agradezca a un profesor.',
  );
});
test('Added Portuguese AR, ER and IR models preserve orthography, irregular stems and participles', () => {
  assert.equal(
    build(true, pv('traduzir'), ps('voce'), 'present', 'statement').text,
    'Você traduz um texto.',
  );
  assert.equal(
    build(true, pv('escrever'), ps('eu'), 'past-perfect', 'statement').text,
    'Eu tinha escrito uma mensagem.',
  );
  assert.equal(
    build(true, pv('construir'), ps('eu'), 'past-perfect', 'statement').text,
    'Eu tinha construído uma casa.',
  );
  assert.equal(
    build(true, pv('sair'), ps('eu'), 'subjunctive-future', 'statement').text,
    'Quando eu sair cedo, será diferente.',
  );
  assert.equal(
    build(true, pv('sair'), ps('voces'), 'subjunctive-future', 'statement').text,
    'Quando vocês saírem cedo, será diferente.',
  );
  assert.equal(
    build(true, pv('pôr'), ps('eu'), 'present', 'statement').text,
    'Eu ponho o livro na mesa.',
  );
  assert.equal(
    build(true, pv('pôr'), ps('nos'), 'personal-infinitive', 'statement').text,
    'É importante nós pormos o livro na mesa.',
  );
  assert.equal(
    build(true, pv('trazer'), ps('nos'), 'subjunctive-past', 'statement').text,
    'Seria bom se nós trouxéssemos um livro.',
  );
  assert.equal(
    build(true, pv('abrir'), ps('eu'), 'past-perfect', 'negative').text,
    'Eu não tinha aberto uma janela.',
  );
  assert.equal(
    build(true, pv('abrir'), ps('eu'), 'gerund', 'statement').text,
    'Eu estou abrindo uma janela.',
  );
  assert.equal(
    build(true, pv('pagar'), ps('eu'), 'subjunctive', 'statement').text,
    'Espero que eu pague a conta.',
  );
  assert.equal(
    build(true, pv('proteger'), ps('eu'), 'present', 'statement').text,
    'Eu protejo o meio ambiente.',
  );
  assert.equal(
    build(true, pv('construir'), ps('nos'), 'past', 'statement').text,
    'Nós construímos uma casa.',
  );
  assert.equal(
    build(true, pv('reunir'), ps('eu'), 'present', 'statement').text,
    'Eu reúno a equipe.',
  );
  assert.equal(
    build(true, pv('sentir'), ps('eu'), 'present', 'statement').text,
    'Eu sinto o frio.',
  );
});
