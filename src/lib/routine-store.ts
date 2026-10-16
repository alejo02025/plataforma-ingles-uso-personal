import type { DatabaseSync } from 'node:sqlite';
import { z } from 'zod';
import { makeRoutine, routineEvaluation, validRoutineResponse, routineTitles } from './routine';
import { learningJourney, levelLessons, blockSize } from './course-route';
import { courseEvidence } from './course-store';
import { localDay } from './learning';
import { AppError } from './domain';
export function saveRoutine(db: Pick<DatabaseSync, 'prepare'>, input: unknown, planId: string) {
  const x = z
    .object({
      id: z.string().uuid(),
      mode: z.enum(['vocabulary', 'grammar', 'reading']),
      level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']),
      block: z.number().int().min(0).max(100),
      edition: z.union([z.literal(1), z.literal(2), z.literal(3)]),
      variant: z.number().int().min(0).max(1000).default(0),
      answers: z.array(z.string().min(1).max(1000)).max(8),
      helpUsed: z.boolean().default(false),
      support: z
        .array(
          z.object({
            questionId: z.string().max(100),
            kind: z.enum(['hint', 'translation', 'word']),
            step: z.number().int().min(0).max(8),
          }),
        )
        .max(100)
        .default([]),
      seconds: z.number().int().min(0).max(7200),
    })
    .parse(input);
  const id = `routine:${x.id}`,
    previous = db.prepare('SELECT correct,total,answers FROM results WHERE activity_id=?').get(id);
  if (previous) {
    const p = JSON.parse(previous.answers as string);
    if (
      p.mode !== x.mode ||
      p.level !== x.level ||
      p.block !== x.block ||
      p.edition !== x.edition ||
      (p.variant ?? 0) !== x.variant
    )
      throw new AppError('Este intento pertenece a otra actividad.');
    return {
      correct: previous.correct,
      total: previous.total,
      responses: p.responses,
      feedback: p.feedback,
      helpUsed: p.helpUsed === true,
      unverified: p.unverified || 0,
      repeated: true,
    };
  }
  const journey = learningJourney(courseEvidence(db));
  if (
    !journey.completed.includes(x.level) &&
    (x.level !== journey.level || x.block > journey.block)
  )
    throw new AppError(
      'Este nivel o bloque todavía está bloqueado. Seguí el recorrido de tu perfil.',
    );
  if (x.block >= Math.ceil(levelLessons(x.level).length / blockSize))
    throw new AppError('Bloque no disponible.');
  const set = makeRoutine(x.mode, x.level, x.block, undefined, {
    edition: x.edition,
    variant: x.variant,
  });
  if (x.answers.length !== set.rounds.length)
    throw new AppError('Completá todos los ejercicios antes de guardar.');
  for (let i = 0; i < x.answers.length; i++) {
    const answer = x.answers[i],
      round = set.rounds[i];
    if (!validRoutineResponse(round, x.mode, answer))
      throw new AppError(
        x.mode === 'grammar' && !round.format
          ? 'Usá todos los bloques de la oración, una sola vez.'
          : 'Elegí una de las opciones de la actividad o escribí una respuesta válida.',
      );
  }
  if (x.support.some((item) => !set.rounds.some((q) => q.id === item.questionId)))
    throw new AppError('La ayuda pertenece a otro ejercicio.');
  const { correct, total, unverified, verdicts } = routineEvaluation(set, x.answers),
    helpUsed = x.helpUsed || x.support.length > 0,
    date = new Date().toISOString();
  const feedback = set.rounds.map((q, i) => ({
    id: q.id,
    correct: verdicts[i] === 'unverified' ? null : verdicts[i] === 'correct',
    verdict: verdicts[i],
    category: q.category || x.mode,
    context: q.context || q.text || '',
    source: q.source,
    explanationSpanish: q.why,
    explanationNative: q.explanationNative,
    correction: q.solution,
  }));
  db.prepare(
    'INSERT INTO activities(id,plan_id,kind,title,minutes,document_id,payload,completed_at) VALUES(?,?,?,?,?,?,?,?)',
  ).run(
    id,
    planId,
    x.mode,
    routineTitles[x.mode],
    3,
    null,
    JSON.stringify({ optional: true, routine: { level: x.level, block: x.block, mode: x.mode } }),
    date,
  );
  db.prepare(
    'INSERT INTO sessions(id,activity_id,started_at,active_seconds,ended_at) VALUES(?,?,?,?,?)',
  ).run(id, id, new Date(Date.now() - x.seconds * 1000).toISOString(), x.seconds, date);
  db.prepare('INSERT INTO results VALUES(?,?,?,?,?,?,?,?,?)').run(
    id,
    id,
    id,
    x.mode,
    correct,
    total,
    JSON.stringify({
      mode: x.mode,
      level: x.level,
      block: x.block,
      edition: x.edition,
      variant: x.variant,
      responses: x.answers,
      helpUsed,
      support: x.support,
      unverified,
      feedback,
    }),
    date,
    localDay(),
  );
  db.prepare('INSERT INTO progress_history VALUES(?,?,?,?,?,?)').run(
    id,
    x.mode,
    correct,
    total,
    id,
    date,
  );
  feedback.forEach((f, i) => {
    if (f.correct === false)
      db.prepare('INSERT INTO mistakes VALUES(?,?,?,?,?,?,?,?,?)').run(
        `${id}:${i}`,
        null,
        id,
        f.category,
        x.answers[i],
        f.correction,
        f.explanationSpanish,
        `${x.level}:${x.mode}:${f.id}`,
        date,
      );
  });
  return { correct, total, unverified, responses: x.answers, feedback, helpUsed, repeated: false };
}
