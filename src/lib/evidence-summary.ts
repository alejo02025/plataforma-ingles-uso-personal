import { dailyRewards, offsetDay } from './daily-rewards';
import { localDay } from './learning';
import { oralEvidence } from './oral-practice';
import type { Snapshot } from './types';

export const measuredSkills = ['reading', 'grammar', 'vocabulary'] as const;
function dayOf(timestamp: string) {
  const date = new Date(timestamp);
  return Number.isFinite(date.getTime()) ? localDay(date) : null;
}

/** Practice is an observed record, not proof of global language proficiency. */
export function evidenceSummary(data: Snapshot) {
  const first = offsetDay(data.day, -6);
  const oral = oralEvidence(data);
  const weekOral = oral.filter((a) => {
    const day = dayOf(a.created_at);
    return day !== null && day >= first && day <= data.day;
  });
  const weekResults = data.results.filter((r) => r.day >= first && r.day <= data.day);
  const sessions = data.sessions.filter((s) => {
    const day = dayOf(s.started_at);
    return day !== null && day >= first && day <= data.day;
  });
  const days = dailyRewards(data).week.filter((d) => d.done).length;
  const due = data.vocabulary.filter(
    (w) =>
      dayOf(w.due_at) !== null &&
      dayOf(w.due_at)! <= data.day &&
      Date.parse(w.due_at) <= Date.now(),
  ).length;
  const skills = measuredSkills.map((skill) => {
    const scored = data.results.filter((r) => {
      if (
        r.skill !== skill ||
        !r.total ||
        r.correct === null ||
        r.correct < 0 ||
        r.correct > r.total
      )
        return false;
      // Legacy review results are a learner's own rating, not an objective test.
      if (skill === 'vocabulary' && !/^(game:|routine:|class:)/.test(r.activity_id)) return false;
      try {
        return !(JSON.parse(r.answers) as { helpUsed?: boolean }).helpUsed;
      } catch {
        return false;
      }
    });
    const total = scored.reduce((n, r) => n + r.total!, 0);
    const correct = scored.reduce((n, r) => n + r.correct!, 0);
    return {
      skill,
      attempts: scored.length,
      total,
      correct,
      accuracy: total ? Math.round((correct / total) * 100) : null,
    };
  });
  const listening = oral.filter((a) => a.mode === 'listening' && !a.helpUsed);
  return {
    days,
    minutes: Math.round(
      (sessions.reduce((n, s) => n + s.active_seconds, 0) +
        weekOral.reduce((n, a) => n + a.duration, 0)) /
        60,
    ),
    activities: weekResults.length + weekOral.length,
    due,
    skills,
    writing: data.results.filter((r) => r.skill === 'writing').length,
    listening: {
      correct: listening.reduce((n, a) => n + (a.correct || 0), 0),
      total: listening.reduce((n, a) => n + (a.total || 0), 0),
      attempts: listening.length,
    },
    recordings: oral.filter((a) => a.mode === 'recording').length,
  };
}
