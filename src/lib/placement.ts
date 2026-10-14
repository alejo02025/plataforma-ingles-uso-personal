import type { Snapshot } from './types';
/** A small exercise sample provides orientation, never a CEFR certificate or course unlock. */
export function placementSummary(data: Pick<Snapshot, 'questions' | 'diagnostic'>) {
  const answered = data.questions.filter((q) =>
    data.diagnostic.answers.some((a) => a.question_id === q.id),
  );
  const bands = ['A1', 'A2', 'B1', 'B2'].map((band) => {
    const items = answered.filter((q) => q.band === band);
    return {
      band,
      total: items.length,
      correct: items.filter(
        (q) => data.diagnostic.answers.find((a) => a.question_id === q.id)?.correct,
      ).length,
    };
  });
  let level = 'A1';
  for (const b of bands) {
    if (!b.total) continue;
    if (b.total < 3 || b.correct / b.total < 2 / 3) break;
    level = b.band;
  }
  const label = level === 'B2' ? 'B1–B2' : level;
  const skills = ['reading', 'grammar', 'vocabulary'].map((skill) => {
    const items = answered.filter((q) => q.skill === skill);
    return {
      skill,
      total: items.length,
      correct: items.filter(
        (q) => data.diagnostic.answers.find((a) => a.question_id === q.id)?.correct,
      ).length,
    };
  });
  const focus =
    [...skills].sort(
      (a, b) => a.correct / Math.max(a.total, 1) - b.correct / Math.max(b.total, 1),
    )[0]?.skill || 'reading';
  return {
    label,
    level,
    bands,
    skills,
    focus,
    correct: data.diagnostic.answers.filter((a) => a.correct).length,
    total: data.diagnostic.answers.length,
  };
}
