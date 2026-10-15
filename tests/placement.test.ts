import { test } from 'node:test';
import assert from 'node:assert/strict';
import { placementSummary } from '../src/lib/placement';
import { publicQuestion } from '../src/lib/domain';
import { diagnosticQuestions as en } from '../src/lib/content';
import { diagnosticQuestions as pt } from '../src/locales/pt-BR/content';
for (const [language, questions] of [
  ['EN', en],
  ['PT', pt],
] as const) {
  const sample = (passed: (band: string) => boolean, bank = questions) => ({
    questions,
    diagnostic: {
      id: 'fixture',
      completed_at: 'now',
      answers: bank.map((q) => ({
        question_id: q.id,
        answer: passed(q.band) ? q.answer : q.options.length - 1,
        correct: passed(q.band) ? 1 : 0,
      })),
    },
  });
  test(`Placement uses context, covers skills evenly and does not skip weaker bands (${language})`, () => {
    assert.equal(questions.length, 24);
    assert.equal(new Set(questions.map((q) => q.id)).size, questions.length);
    for (const question of questions) {
      const visible = publicQuestion(question);
      assert.ok(!('answer' in visible));
      assert.ok(!('explanation' in visible));
      assert.ok(!('explanationSpanish' in visible));
    }
    for (const band of ['A1', 'A2', 'B1', 'B2']) {
      assert.equal(questions.filter((q) => q.band === band).length, 6);
      for (const skill of ['reading', 'grammar', 'vocabulary'])
        assert.equal(questions.filter((q) => q.band === band && q.skill === skill).length, 2);
    }
    assert.equal(placementSummary(sample((b) => b === 'A1')).label, 'A1');
    assert.equal(placementSummary(sample((b) => b === 'A1' || b === 'A2')).label, 'A2');
    assert.equal(placementSummary(sample((b) => b === 'B2')).label, 'A1');
    const perfect = placementSummary(sample(() => true));
    assert.equal(perfect.label, 'B1–B2');
    assert.equal(perfect.correct, 24);
    assert.equal(perfect.confidence, 'low');
    assert.deepEqual(perfect.unassessed, ['writing', 'listening', 'speaking']);
    assert.ok(
      perfect.skills.every((s) => s.correct === 8 && s.total === 8 && s.coverage === 'broader'),
    );
    assert.ok(questions.every((q) => q.options[q.answer] !== q.options.at(-1)));
    assert.ok(
      questions
        .filter((q) => q.id.startsWith('d-v2-'))
        .every((q) => q.explanationSpanish && q.explanation),
    );
  });
  test(`A completed historical sample retains its original band rule; imports do not inflate scores (${language})`, () => {
    const old = questions.filter((q) => !q.id.startsWith('d-v2-'));
    const historical = sample(() => true, old);
    const result = placementSummary(historical);
    assert.equal(result.label, 'B1–B2');
    assert.equal(result.total, 12);
    assert.equal(result.legacy, true);
    assert.equal(result.confidence, 'low');
    historical.diagnostic.answers.push(historical.diagnostic.answers[0], {
      question_id: 'unknown-imported-id',
      answer: 0,
      correct: 1,
    });
    assert.equal(placementSummary(historical).total, 12);
    assert.equal(placementSummary(historical).correct, 12);
    const incomplete = sample(() => true, questions.slice(0, 3));
    incomplete.diagnostic.completed_at = '';
    assert.equal(placementSummary(incomplete).complete, false);
    assert.equal(placementSummary(incomplete).legacy, false);
    assert.equal(placementSummary(incomplete).bands[0].sufficient, false);
  });
}
