import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  englishVerbs,
  portugueseVerbs,
  englishSubjects,
  portugueseSubjects,
  buildSentence,
  type Tense,
} from '../src/locales/learning/foundations';
import {
  buildReferenceSentence as build,
  englishBuilderTimes,
  portugueseBuilderTimes,
  builderSubjects,
  builderVerbWarning,
} from '../src/locales/learning/sentence-builder';
const ev = (id: string) => englishVerbs.find((v) => v.id === id)!;
const pv = (id: string) => portugueseVerbs.find((v) => v.id === id)!;
const es = (id: string) => englishSubjects.find((s) => s.id === id)!;
const ps = (id: string) => portugueseSubjects.find((s) => s.id === id)!;
test('English builder places auxiliaries and irregular participles correctly across advanced tense families', () => {
  assert.equal(
    build(false, ev('study'), es('she'), 'present-perfect-continuous', 'question').text,
    'Has she been studying English?',
  );
  assert.equal(
    build(false, ev('write'), es('we'), 'past-perfect', 'negative').text,
    'We had not written a message.',
  );
  assert.equal(
    build(false, ev('go'), es('i'), 'future-perfect', 'statement').text,
    'I will have gone to work.',
  );
  assert.equal(
    build(false, ev('drink'), es('they'), 'conditional-perfect', 'question').text,
    'Would they have drunk water?',
  );
  assert.equal(
    build(false, ev('study'), es('she'), 'subjunctive', 'negative').text,
    'It is important that she not study English.',
  );
  assert.equal(
    build(false, ev('study'), es('we'), 'imperative', 'question').translation,
    '¿Vamos a estudiar inglés?',
  );
  assert.equal(
    build(false, ev('write'), es('she'), 'infinitive', 'negative').translation,
    'No es útil que ella escriba un mensaje.',
  );
  assert.equal(
    build(false, ev('read'), es('she'), 'gerund', 'question').text,
    'Does she check the instructions before reading a book?',
  );
  assert.ok(builderVerbWarning(false, ev('have'), 'present-continuous'));
});
test('Portuguese builder distinguishes personal infinitive from subjunctive and preserves irregular forms and Spanish explanations', () => {
  assert.equal(
    build(true, pv('fazer'), ps('nos'), 'subjunctive-past', 'statement').text,
    'Seria bom se nós fizéssemos a tarefa.',
  );
  assert.equal(
    build(true, pv('comer'), ps('nos'), 'subjunctive-past', 'statement').text,
    'Seria bom se nós comêssemos frutas.',
  );
  assert.equal(
    build(true, pv('fazer'), ps('nos'), 'pluperfect-simple', 'statement').text,
    'Nós fizéramos a tarefa.',
  );
  assert.equal(
    build(true, pv('ir'), ps('eu'), 'personal-infinitive', 'statement').text,
    'É importante eu ir ao trabalho.',
  );
  assert.equal(
    build(true, pv('ir'), ps('eu'), 'subjunctive-future', 'statement').text,
    'Quando eu for ao trabalho, será diferente.',
  );
  assert.equal(
    build(true, pv('estudar'), ps('nos'), 'imperfect', 'statement').translation,
    'Nosotros estudiábamos portugués.',
  );
  assert.equal(
    build(true, pv('estudar'), ps('eu'), 'present-perfect', 'statement').translation,
    'Yo vengo estudiando portugués.',
  );
  assert.equal(
    build(true, pv('fazer'), ps('voce'), 'subjunctive-perfect', 'negative').text,
    'Espero que você não tenha feito a tarefa.',
  );
  assert.equal(
    build(true, pv('estudar'), ps('eu'), 'gerund-perfect', 'statement').text,
    'Tendo estudado português, eu posso descansar.',
  );
  assert.equal(
    build(true, pv('estudar'), ps('voce'), 'imperative', 'statement').translation,
    'Estudiá portugués.',
  );
});
test('Every builder choice supplies all sentence forms and keeps legacy course models unchanged', () => {
  for (const [pt, verbs, subjects, times] of [
    [false, englishVerbs, englishSubjects, englishBuilderTimes],
    [true, portugueseVerbs, portugueseSubjects, portugueseBuilderTimes],
  ] as const) {
    assert.equal(new Set(times.map((t) => t.id)).size, times.length);
    for (const v of verbs)
      for (const t of times)
        for (const s of builderSubjects(pt, t.id, [...subjects]))
          for (const kind of ['statement', 'negative', 'question'] as const) {
            const r = build(pt, v, s, t.id, kind);
            assert.ok(
              r.text.length > 4 && !r.text.includes('undefined'),
              `${v.word} ${s.text} ${t.id} ${kind}`,
            );
            assert.ok(r.translation.length > 4 && !r.translation.includes('undefined'));
            assert.ok(r.explanation.length > 10);
            assert.equal(r.text.endsWith('?'), kind === 'question');
            if (['present', 'past', 'future', 'plans'].includes(t.id))
              assert.deepEqual(r, buildSentence(pt, v, s, t.id as Tense, kind));
          }
  }
  assert.deepEqual(
    builderSubjects(true, 'imperative', portugueseSubjects).map((s) => s.id),
    ['voce', 'nos', 'voces'],
  );
});
