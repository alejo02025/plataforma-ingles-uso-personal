import { z } from 'zod';
import { learningJourney } from './course-route';
import { studyBudget, studyRecommendation } from './study-recommendation';
import { routineRecord } from './routine';
import { isPortuguese } from './workspace';
import { oralEvidence } from './oral-practice';
import { localDay } from './learning';
import { writingChallenge } from '@/locales/learning/writing-challenges';
import type { Snapshot } from './types';

export type StudyTask = {
  id: string;
  title: string;
  purpose: string;
  purposeSpanish?: string;
  minutes: number;
  completed?: boolean;
  action:
    | { kind: 'activity'; id: string }
    | { kind: 'class'; id: string }
    | { kind: 'review'; words: string[] }
    | { kind: 'oral'; mode: 'listening' }
    | {
        kind: 'routine';
        mode: 'vocabulary' | 'grammar' | 'reading' | 'writing';
        level: string;
        block: number;
      };
};
export type StudyDay = {
  version: 1;
  day: string;
  minutes: number;
  baseline: string[];
  tasks: StudyTask[];
};
const storedAgenda = z.object({
  version: z.literal(1),
  day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  minutes: z.number().int().min(5).max(45),
  baseline: z.array(z.string()),
  tasks: z
    .array(
      z.object({
        id: z.string().min(1),
        title: z.string().min(1),
        purpose: z.string(),
        purposeSpanish: z.string().optional(),
        minutes: z.number().int().min(1).max(45),
        completed: z.boolean().optional(),
        action: z.discriminatedUnion('kind', [
          z.object({ kind: z.literal('activity'), id: z.string().min(1) }),
          z.object({ kind: z.literal('class'), id: z.string().min(1) }),
          z.object({ kind: z.literal('review'), words: z.array(z.string()).min(1).max(3) }),
          z.object({ kind: z.literal('oral'), mode: z.literal('listening') }),
          z.object({
            kind: z.literal('routine'),
            mode: z.enum(['vocabulary', 'grammar', 'reading', 'writing']),
            level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']),
            block: z.number().int().min(0).max(100),
          }),
        ]),
      }),
    )
    .min(1)
    .max(4),
});
export function parseStudyDay(value: unknown): StudyDay | undefined {
  const parsed = storedAgenda.safeParse(value);
  return parsed.success ? parsed.data : undefined;
}
export const studyDayId = (day: string) => `study-day:${day}`;
export function readStudyDay(data: Snapshot): StudyDay | undefined {
  const saved = parseStudyDay(
    data.plan.activities.find((a) => a.id === studyDayId(data.day))?.payload.studyDay,
  );
  return saved?.day === data.day ? saved : undefined;
}
/** A finite agenda, separate from course gates and from proficiency evidence. */
export function makeStudyDay(
  data: Snapshot,
  requested: number,
  paused?: Parameters<typeof studyRecommendation>[2],
  canListen = false,
): StudyDay {
  const minutes = studyBudget(requested),
    pt = isPortuguese;
  const journey = learningJourney(data);
  const recommendation = studyRecommendation(data, minutes, paused);
  const due = data.vocabulary
    .filter((w) => Date.parse(w.due_at) <= Date.now())
    .slice(0, 3)
    .map((w) => w.id);
  const routine = (
    mode: 'vocabulary' | 'grammar' | 'reading' | 'writing',
    duration = mode === 'writing' ? writingChallenge(journey.level, pt).minutes : 4,
  ): StudyTask => ({
    id: `routine:${mode}`,
    minutes: duration,
    title: {
      vocabulary: pt ? 'Palavras em contexto' : 'Words in context',
      grammar: pt ? 'Construa frases' : 'Build sentences',
      reading: pt ? 'Leia uma situação curta' : 'Read a short situation',
      writing: pt ? 'Escreva com suas palavras' : 'Write in your own words',
    }[mode],
    purpose: {
      vocabulary: pt
        ? 'Recuperar palavras úteis sem olhar a resposta.'
        : 'Recall useful words before seeing the answer.',
      grammar: pt
        ? 'Organizar ideias e praticar a estrutura do seu bloco.'
        : 'Organise ideas and practise your current sentence pattern.',
      reading: pt
        ? 'Encontrar detalhes e compreender uma situação real.'
        : 'Find details and understand a real situation.',
      writing: pt
        ? 'Produzir um texto pessoal com a proposta e os critérios do seu nível.'
        : 'Produce a personal text using the brief and criteria for your level.',
    }[mode],
    purposeSpanish: {
      vocabulary: 'Recuperá palabras útiles antes de ver la respuesta.',
      grammar: 'Organizá ideas y practicá la estructura de oración de tu bloque actual.',
      reading: 'Encontrá detalles y comprendé una situación real.',
      writing: 'Escribí un texto personal con la consigna y los criterios de tu nivel.',
    }[mode],
    action: { kind: 'routine', mode, level: journey.level, block: journey.block },
  });
  const action = recommendation.action;
  const primary: StudyTask = {
    id:
      action.kind === 'class'
        ? `class:${action.id}`
        : action.kind === 'activity'
          ? `activity:${action.activity.id}`
          : action.kind === 'review'
            ? 'review'
            : `routine:${action.mode}`,
    title: recommendation.title,
    purpose: recommendation.reason,
    purposeSpanish: recommendation.es,
    minutes: recommendation.sessionMinutes,
    action:
      action.kind === 'activity'
        ? { kind: 'activity', id: action.activity.id }
        : action.kind === 'review'
          ? { kind: 'review', words: due }
          : action.kind === 'class'
            ? action
            : routine(action.mode).action,
  };
  const candidates = [
    ...(due.length && action.kind !== 'review'
      ? [
          {
            id: 'review',
            title: pt ? 'Revisar palavras' : 'Review saved words',
            purpose: pt
              ? 'Recuperar até três palavras da memória.'
              : 'Recall up to three words from memory.',
            purposeSpanish: 'Recuperá hasta tres palabras de la memoria.',
            minutes: 3,
            action: { kind: 'review' as const, words: due },
          },
        ]
      : []),
    ...(['vocabulary', 'writing'] as const)
      .filter((mode) => !journey.tasks.find((t) => t.id === mode)?.done)
      .map((mode) => routine(mode)),
    ...(minutes >= 20 &&
    canListen &&
    !oralEvidence(data).some((r) => r.mode === 'listening' && r.level === journey.level)
      ? [
          {
            id: 'oral:listening',
            title: pt ? 'Ouça uma situação curta' : 'Listen to a short situation',
            purpose: pt
              ? 'Ouça uma voz sintética e responda a duas perguntas sobre o conteúdo.'
              : 'Listen to a synthetic voice and answer two questions about its content.',
            purposeSpanish:
              'Escuchá una voz sintética y respondé dos preguntas sobre su contenido.',
            minutes: 4,
            action: { kind: 'oral' as const, mode: 'listening' as const },
          },
        ]
      : []),
    ...(['grammar', 'reading'] as const)
      .filter((mode) => !journey.tasks.find((t) => t.id === mode)?.done)
      .map((mode) => routine(mode)),
    routine('writing'),
    routine('reading'),
    routine('grammar'),
  ];
  const tasks = [primary];
  let remaining = minutes - primary.minutes;
  for (const candidate of candidates) {
    if (tasks.length === 4 || remaining < 3) break;
    if (tasks.some((t) => t.id === candidate.id)) continue;
    // A level-specific writing brief cannot be reduced to a three-minute filler.
    if (
      candidate.action.kind === 'routine' &&
      candidate.action.mode === 'writing' &&
      candidate.minutes > remaining
    )
      continue;
    const duration = Math.min(candidate.minutes, remaining);
    tasks.push({ ...candidate, minutes: duration });
    remaining -= duration;
  }
  return {
    version: 1,
    day: data.day,
    minutes,
    tasks,
    baseline: [
      ...data.results.filter((r) => r.day === data.day).map((r) => r.id),
      ...data.reviews
        .filter((r) => r.day === data.day)
        .map((r) => `review:${r.word_id}:${r.reviewed_at}`),
      ...oralEvidence(data).map((r) => `oral:${r.id}`),
    ],
  };
}
export function studyTaskDone(task: StudyTask, plan: StudyDay, data: Snapshot): boolean {
  if (task.completed) return true;
  const fresh = data.results.filter((r) => r.day === plan.day && !plan.baseline.includes(r.id));
  const a = task.action;
  if (a.kind === 'activity')
    return (
      data.results.some((r) => r.activity_id === a.id) ||
      [...data.plan.activities, ...(data.backlog || [])].some(
        (r) => r.id === a.id && !!r.completed_at,
      )
    );
  if (a.kind === 'review')
    return (
      a.words.length > 0 &&
      a.words.every((id) =>
        data.reviews.some(
          (r) =>
            r.word_id === id &&
            r.day === plan.day &&
            !plan.baseline.includes(`review:${r.word_id}:${r.reviewed_at}`),
        ),
      )
    );
  if (a.kind === 'class')
    return fresh.some((r) => {
      try {
        return r.activity_id.startsWith('class:') && JSON.parse(r.answers).lessonId === a.id;
      } catch {
        return false;
      }
    });
  if (a.kind === 'oral')
    return oralEvidence(data).some(
      (r) =>
        r.mode === a.mode &&
        localDay(new Date(r.created_at)) === plan.day &&
        !plan.baseline.includes(`oral:${r.id}`),
    );
  if (a.mode === 'writing') return fresh.some((r) => r.skill === 'writing');
  return fresh.some((r) => {
    const record = routineRecord(r);
    return record?.mode === a.mode && record.level === a.level && record.block === a.block;
  });
}
