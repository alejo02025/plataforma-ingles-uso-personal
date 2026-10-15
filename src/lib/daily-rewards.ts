import { localDay } from './learning';
import { lessonRecord } from './course-route';
import { oralEvidence } from './oral-practice';
import type { Snapshot } from './types';

export function offsetDay(day: string, offset: number) {
  const date = new Date(`${day}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}
function validDay(day: string) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(day) &&
    Number.isFinite(Date.parse(`${day}T12:00:00Z`)) &&
    offsetDay(day, 0) === day
  );
}
function timestampDay(timestamp: string) {
  const date = new Date(timestamp);
  return Number.isFinite(date.getTime()) ? localDay(date) : '';
}

/** Opening the app, saving a word or leaving a timer running is not completed practice. */
export function dailyRewards(data: Snapshot, today = data.day) {
  const dates = new Set<string>();
  let todayActivities = 0;
  function add(day: string) {
    if (!validDay(day) || day > today) return;
    dates.add(day);
    if (day === today) todayActivities++;
  }
  const results = [...new Map(data.results.map((r) => [r.activity_id, r])).values()].filter(
    (r) => r.completed_at && validDay(r.day) && r.day <= today,
  );
  results.forEach((r) => add(r.day));
  const reviews = data.reviews.filter((r) => validDay(r.day) && r.day <= today);
  reviews.forEach((r) => add(r.day));
  const pdf = data.tutorAttempts.filter(
    (a) =>
      a.answer.trim() &&
      validDay(timestampDay(a.created_at)) &&
      timestampDay(a.created_at) <= today,
  );
  pdf.forEach((a) => add(timestampDay(a.created_at)));
  oralEvidence(data).forEach((a) => add(timestampDay(a.created_at)));
  for (const a of data.cefr?.attempts || []) if (a.answer.trim()) add(timestampDay(a.created_at));
  if (data.diagnostic.completed_at) add(timestampDay(data.diagnostic.completed_at));
  let bestStreak = 0,
    consecutive = 0,
    previous = '';
  for (const day of [...dates].sort()) {
    consecutive = previous && offsetDay(previous, 1) === day ? consecutive + 1 : 1;
    bestStreak = Math.max(bestStreak, consecutive);
    previous = day;
  }
  let currentStreak = 0;
  let cursor = dates.has(today) ? today : offsetDay(today, -1);
  while (dates.has(cursor)) {
    currentStreak++;
    cursor = offsetDay(cursor, -1);
  }
  const classes = new Set(
    results
      .filter(
        (r) =>
          lessonRecord(r)?.lessonId &&
          Number(r.total) > 0 &&
          Number(r.correct) / Number(r.total) >= 0.8,
      )
      .map((r) => lessonRecord(r)!.lessonId),
  ).size;
  const checkpoints = (data.courseCheckpoints || []).filter(
    (c) => validDay(timestampDay(c.completed_at)) && timestampDay(c.completed_at) <= today,
  );
  const badges = [
    {
      id: 'first-practice',
      en: 'First step',
      pt: 'Primeiro passo',
      why: 'Guardá tu primera actividad, repaso o respuesta sobre un PDF; también cuenta un diagnóstico completado. Practicar cuenta, aunque te equivoques.',
      value: dates.size,
      target: 1,
    },
    {
      id: 'words',
      en: 'Words in action',
      pt: 'Palavras em ação',
      why: 'Terminá una actividad de vocabulario o repasá una palabra. Guardar una palabra sin practicarla todavía no cuenta.',
      value: results.filter((r) => r.skill === 'vocabulary').length + reviews.length,
      target: 1,
    },
    {
      id: 'grammar',
      en: 'Grammar in action',
      pt: 'Gramática na prática',
      why: 'Completá una actividad de gramática: ordenar una oración, practicar un patrón o terminar una clase de gramática.',
      value: results.filter((r) => r.skill === 'grammar').length,
      target: 1,
    },
    {
      id: 'reading',
      en: 'A little reading',
      pt: 'Um pouco de leitura',
      why: 'Terminá una lectura breve o guardá una respuesta sobre uno de tus PDF.',
      value: results.filter((r) => r.skill === 'reading').length + pdf.length,
      target: 1,
    },
    {
      id: 'writing',
      en: 'Your own words',
      pt: 'Suas próprias palavras',
      why: 'Completá una práctica de escritura. Este logro reconoce la práctica guardada, no califica la calidad del texto.',
      value: results.filter((r) => r.skill === 'writing').length,
      target: 1,
    },
    {
      id: 'first-class',
      en: 'First class',
      pt: 'Primeira aula',
      why: 'Aprobá tu primera clase con al menos 80 % de aciertos.',
      value: classes,
      target: 1,
    },
    {
      id: 'three-days',
      en: 'Three days together',
      pt: 'Três dias seguidos',
      why: 'Guardá práctica en tres días consecutivos. Tu mejor racha conserva este logro aunque después hagas una pausa.',
      value: bestStreak,
      target: 3,
    },
    {
      id: 'seven-days',
      en: 'A week of practice',
      pt: 'Uma semana de prática',
      why: 'Practicá siete días consecutivos. Varios ejercicios en un mismo día suman un solo día de racha.',
      value: bestStreak,
      target: 7,
    },
    {
      id: 'thirty-days',
      en: 'Thirty days together',
      pt: 'Trinta dias seguidos',
      why: 'Alcanzá una racha de treinta días de práctica guardada.',
      value: bestStreak,
      target: 30,
    },
    {
      id: 'ten-classes',
      en: 'Ten classes',
      pt: 'Dez aulas',
      why: 'Aprobá diez clases distintas con al menos 80 %. Repetir una clase sirve para repasar, pero no aumenta este contador.',
      value: classes,
      target: 10,
    },
    {
      id: 'first-block',
      en: 'Everything connects',
      pt: 'Tudo se conecta',
      why: 'Completá un bloque integrado: clases, lectura, vocabulario y escritura, con los requisitos de tu recorrido.',
      value: checkpoints.filter((c) => c.id.startsWith('block:')).length,
      target: 1,
    },
    {
      id: 'first-level',
      en: 'A new chapter',
      pt: 'Um novo capítulo',
      why: 'Completá un nivel del recorrido y sus prácticas para habilitar el siguiente. Es un hito de la app, no una certificación MCER.',
      value: checkpoints.filter((c) => c.id.startsWith('level:')).length,
      target: 1,
    },
  ].map((b) => ({ ...b, earned: b.value >= b.target }));
  return {
    currentStreak,
    bestStreak,
    todayActivities,
    todayDone: dates.has(today),
    badges,
    earned: badges.filter((b) => b.earned).length,
    week: Array.from({ length: 7 }, (_, i) => {
      const day = offsetDay(today, i - 6);
      return { day, done: dates.has(day) };
    }),
  };
}
