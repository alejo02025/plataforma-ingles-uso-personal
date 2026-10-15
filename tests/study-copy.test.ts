import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { nativeCopy, spanishCopy } from '../src/lib/study-copy';
import { StudyCopy, copyText } from '../src/components/study-copy';
import { englishClasses, portugueseClasses } from '../src/locales/lessons/catalog';
import { diagnosticQuestions as englishDiagnostic } from '../src/lib/content';
import { diagnosticQuestions as portugueseDiagnostic } from '../src/locales/pt-BR/content';
import { levelBases } from '../src/locales/learning/level-bases';
import { grammarReference } from '../src/locales/learning/grammar-reference';
import { englishTenses, portugueseTenses } from '../src/locales/learning/tense-reference';
import {
  englishBuilderTimes,
  portugueseBuilderTimes,
} from '../src/locales/learning/sentence-builder';

for (const pt of [false, true]) {
  test(`All class explanations, tips and answer rationales have authored native support (${pt ? 'PT' : 'EN'})`, () => {
    const classes = pt ? portugueseClasses : englishClasses;
    assert.equal(classes.length, 131);
    for (const lesson of classes) {
      for (const source of [lesson.explanation, lesson.tip, ...lesson.checks.map((q) => q.why)]) {
        const value = nativeCopy(source, pt);
        assert.ok(value, `${lesson.id}: missing native explanation for ${source}`);
        assert.equal(value.includes('{'), false, `${lesson.id}: unresolved placeholder`);
        // Models/Spanish glosses in quotes are intentional, but editorial prose is native.
        assert.doesNotMatch(
          value,
          /(?:En esta clase practicás|Observá el sujeto|El modelo correcto es)/,
        );
      }
    }
  });
  test(`Level objectives and all grammar/tense reference guidance have native support (${pt ? 'PT' : 'EN'})`, () => {
    const guidance = [
      ...Object.values(levelBases).flatMap((level) => (pt ? level.pt : level.en)),
      ...grammarReference.map((entry) => (pt ? entry.explanationPT : entry.explanationEN)),
      ...(pt ? portugueseTenses : englishTenses).flatMap((entry) => [entry.use, entry.tip]),
      ...(pt ? portugueseBuilderTimes : englishBuilderTimes).map((entry) => entry.explanation),
    ];
    for (const source of guidance) {
      const native = nativeCopy(source, pt);
      assert.ok(native, source);
      assert.doesNotMatch(native, /(?:Empezá|Podés|Usá |Conjugá|No omitas)/);
    }
  });
}

test('Combined JSX copy translates numbers, CEFR bands, punctuation and counted fragments', () => {
  const source = copyText(
    createElement(
      'p',
      null,
      'Tu nivel activo es ',
      createElement('strong', null, 'A2'),
      '. Los siguientes se habilitan al completar clases y prácticas; los ya completados quedan para repaso.',
    ),
  );
  assert.match(nativeCopy(source, false)!, /^Your active level is A2\./);
  assert.match(nativeCopy(source, true)!, /^Seu nível ativo é A2\./);
  const goal = `A2 · Bloque 1: ${levelBases.A2.en[0]}`;
  assert.match(nativeCopy(goal, false)!, /^A2 · Block 1: Describe routines/);
  assert.match(nativeCopy(goal, true)!, /^A2 · Bloco 1: Descrever rotinas/);
  assert.equal(nativeCopy('1 / 5'), '1 / 5');
  assert.equal(nativeCopy('A1 / A2'), 'A1 / A2');
  const count =
    'Hoy tenés 2 prácticas guardadas. El día de estudio cambia a medianoche de Argentina. Si ayer practicaste, tenés todo hoy para continuar la racha; una pausa no borra tu progreso ni tus logros.';
  assert.match(nativeCopy(count, true)!, /^Hoje você tem 2 práticas salvas\./);
});

test('Templates translate known dynamic skills and optional aids but preserve quoted meanings', () => {
  const repair = (aid: string) =>
    `Necesitás reforzar vocabulario: tus últimos 2 ejercicios de esta competencia registran 1 de 6 respuestas correctas. Completá una nueva práctica de esa competencia con al menos 80 % de aciertos${aid} para habilitar nuevas clases. Tus niveles, hitos e intentos anteriores se conservan.`;
  assert.match(nativeCopy(repair(' sin ayudas'), true)!, /reforçar vocabulário/);
  assert.match(nativeCopy(repair(' sin ayudas'), true)!, /acertos sem ajuda/);
  assert.match(nativeCopy(repair(''), false)!, /correct answers to unlock/);
  const model =
    'En esta clase practicás «glass», que significa «vaso». Observá el sujeto, el momento de la acción y cómo cambia el verbo: «glass». La forma negativa y la pregunta mantienen la misma situación, pero cambian su intención.';
  assert.match(nativeCopy(model, true)!, /«vaso»|“vaso”/);
  assert.doesNotMatch(nativeCopy(model, true)!, /significa.*copo/);
});

test('Unknown prose is never labeled translated by catch-all placeholders or partial word matches', () => {
  assert.equal(nativeCopy('Texto propio no traducido automáticamente'), null);
  assert.equal(nativeCopy('constructor'), null);
  assert.equal(nativeCopy('toString'), null);
  assert.equal(nativeCopy('Tu nivel activo es A2. Otra instrucción desconocida.'), null);
  assert.equal(nativeCopy('gramáticainventada'), null);
  assert.equal(nativeCopy('Texto desconocido / otro texto'), null);
  assert.equal(
    spanishCopy('Always available, with no level requirements.', false),
    'Siempre disponible, sin requisitos de nivel.',
  );
});

test('StudyCopy keeps the native instruction first and Spanish support below in safe markup', () => {
  const markup = renderToStaticMarkup(
    createElement(StudyCopy, {
      as: 'li',
      children: 'Siempre disponible, sin requisitos de nivel.',
    }),
  );
  assert.ok(markup.indexOf('study-native') < markup.indexOf('study-spanish'));
  assert.match(markup, /lang="es"/);
  assert.equal((markup.match(/<li/g) || []).length, 1);
  const missing = renderToStaticMarkup(
    createElement(StudyCopy, { children: 'Una instrucción editorial nueva sin traducción.' }),
  );
  assert.match(missing, /data-study-copy="missing"/);
  assert.equal(missing.includes('study-native'), false);
  const withId = renderToStaticMarkup(
    createElement(StudyCopy, {
      id: 'one-instruction',
      children: 'Siempre disponible, sin requisitos de nivel.',
    }),
  );
  assert.equal((withId.match(/id="one-instruction"/g) || []).length, 1);
});

for (const [pt, questions] of [
  [false, englishDiagnostic],
  [true, portugueseDiagnostic],
] as const) {
  test(`The 24 diagnostic prompts and every review choice have Spanish support (${pt ? 'PT' : 'EN'})`, () => {
    assert.equal(questions.length, 24);
    for (const question of questions) {
      for (const native of [question.prompt, ...(question.options || [])]) {
        assert.ok(spanishCopy(native, pt), `${question.id}: missing Spanish support for ${native}`);
      }
    }
    assert.equal(spanishCopy('Continue', pt), 'Continuar');
    assert.equal(spanishCopy('Texto personal no traducido', pt), null);
  });
}
