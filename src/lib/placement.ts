import type { Snapshot } from './types';

/** Selected-response evidence only. It never certifies CEFR proficiency or unlocks a course. */
export function placementSummary(data: Pick<Snapshot, 'questions' | 'diagnostic'>) {
  // Unknown or repeated imported IDs must not inflate scores or coverage.
  const answered = data.questions.filter(
    (q, i, bank) =>
      bank.findIndex((item) => item.id === q.id) === i &&
      data.diagnostic.answers.some((a) => a.question_id === q.id),
  );
  const isCorrect = (id: string) =>
    data.diagnostic.answers.find((a) => a.question_id === id)?.correct === 1;
  const legacy =
    Boolean(data.diagnostic.completed_at) && !answered.some((q) => q.id.startsWith('d-v2-'));
  const bands = ['A1', 'A2', 'B1', 'B2'].map((band) => {
    const items = answered.filter((q) => q.band === band);
    const expected = data.questions.filter((q) => q.band === band).length;
    const minimum = legacy ? 3 : Math.min(6, expected);
    const threshold = legacy ? 2 / 3 : 0.8;
    return {
      band,
      total: items.length,
      correct: items.filter((q) => isCorrect(q.id)).length,
      expected,
      sufficient: items.length >= minimum && minimum >= 3,
      threshold,
    };
  });
  let level = 'A1';
  for (const b of bands) {
    if (legacy && !b.total) continue; // Preserve the original 9-item assessment's missing A1 band.
    // Higher scores cannot compensate for a missing or weaker prerequisite band.
    if (!b.sufficient || b.correct / b.total < b.threshold) break;
    level = b.band;
  }
  const label = level === 'B2' ? 'B1–B2' : level;
  const skills = ['reading', 'grammar', 'vocabulary'].map((skill) => {
    const items = answered.filter((q) => q.skill === skill);
    return {
      skill,
      total: items.length,
      correct: items.filter((q) => isCorrect(q.id)).length,
      coverage: items.length >= 6 ? ('broader' as const) : ('limited' as const),
      bands: bands.map(({ band }) => {
        const sample = items.filter((q) => q.band === band);
        return {
          band,
          total: sample.length,
          correct: sample.filter((q) => isCorrect(q.id)).length,
        };
      }),
    };
  });
  const measured = skills.filter((s) => s.total > 0);
  const focus =
    [...measured].sort((a, b) => a.correct / a.total - b.correct / b.total)[0]?.skill || 'reading';
  return {
    label,
    level,
    bands,
    skills,
    focus,
    correct: answered.filter((q) => isCorrect(q.id)).length,
    total: answered.length,
    expected: data.questions.length,
    legacy,
    complete: Boolean(data.diagnostic.completed_at),
    confidence: 'low' as const,
    unassessed: ['writing', 'listening', 'speaking'] as const,
  };
}
