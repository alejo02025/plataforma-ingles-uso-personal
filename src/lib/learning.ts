import type { Skill } from './content';
export const skillNames: Record<Skill, string> = {
  reading: 'Reading',
  grammar: 'Grammar',
  vocabulary: 'Vocabulary',
  writing: 'Writing',
};
export function localDay(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Argentina/Buenos_Aires',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}
export function nextReview(
  previous: { interval: number; ease: number },
  known: boolean,
  now = new Date(),
) {
  const ease = known ? Math.min(2.8, previous.ease + 0.05) : Math.max(1.3, previous.ease - 0.2);
  const interval = known
    ? previous.interval === 0
      ? 1
      : previous.interval === 1
        ? 3
        : Math.ceil(previous.interval * ease)
    : 1;
  return { interval, ease, due_at: new Date(now.getTime() + interval * 86_400_000).toISOString() };
}
export function estimate(scores: { band: string; correct: boolean }[]) {
  if (scores.length < 3) return { level: null, confidence: 'insufficient' };
  // Deliberadamente conservador: 3 ítems no permiten certificar un nivel MCER.
  const a2 = scores.some((s) => s.band === 'A2' && s.correct);
  const b1 = scores.some((s) => s.band === 'B1' && s.correct);
  return { level: a2 && b1 ? 'B1 estimate' : 'A2 estimate', confidence: 'low' };
}
export function weakestSkill(
  results: { skill: string; correct: number | null; total: number | null }[],
): Skill {
  const measured: Skill[] = ['reading', 'grammar', 'vocabulary'];
  const precision = measured
    .map((skill) => {
      const sample = results.filter((r) => r.skill === skill && r.total && r.correct !== null);
      const total = sample.reduce((n, r) => n + r.total!, 0);
      return { skill, ratio: total ? sample.reduce((n, r) => n + r.correct!, 0) / total : null };
    })
    .filter((x) => x.ratio !== null)
    .sort((a, b) => a.ratio! - b.ratio!);
  return precision[0]?.skill ?? 'reading';
}
