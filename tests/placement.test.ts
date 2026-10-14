import { test } from 'node:test';
import assert from 'node:assert/strict';
import { placementSummary } from '../src/lib/placement';
import { diagnosticQuestions as en } from '../src/lib/content';
import { diagnosticQuestions as pt } from '../src/locales/pt-BR/content';
for (const [language, questions] of [
  ['EN', en],
  ['PT', pt],
] as const) {
  test(`Placement shows beginner, prevents skipping weaker bands and caps a perfect sample (${language})`, () => {
    const sample = (passed: (band: string) => boolean) => ({
      questions,
      diagnostic: {
        id: 'fixture',
        completed_at: 'now',
        answers: questions.map((q) => ({
          question_id: q.id,
          answer: passed(q.band) ? q.answer : q.options.length - 1,
          correct: passed(q.band) ? 1 : 0,
        })),
      },
    });
    assert.equal(questions.length, 12);
    assert.equal(placementSummary(sample((b) => b === 'A1')).label, 'A1');
    assert.equal(placementSummary(sample((b) => b === 'A1' || b === 'A2')).label, 'A2');
    assert.equal(placementSummary(sample((b) => b === 'B2')).label, 'A1');
    const perfect = placementSummary(sample(() => true));
    assert.equal(perfect.label, 'B1–B2');
    assert.equal(perfect.correct, 12);
    assert.ok(perfect.skills.every((s) => s.correct === 4 && s.total === 4));
    assert.ok(questions.every((q) => q.options[q.answer] !== q.options.at(-1)));
  });
}
