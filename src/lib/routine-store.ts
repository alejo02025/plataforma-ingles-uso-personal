import type { DatabaseSync } from 'node:sqlite';
import { z } from 'zod';
import { makeRoutine, routineScore, routineTitles, routineEdition } from './routine';
import { normalizeAnswer } from './games';
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
      edition: z.literal(routineEdition),
      answers: z.array(z.string().min(1).max(1000)).max(3),
      helpUsed: z.boolean().default(false),
      seconds: z.number().int().min(0).max(7200),
    })
    .parse(input);
  const id = `routine:${x.id}`,
    previous = db.prepare('SELECT correct,total,answers FROM results WHERE activity_id=?').get(id);
  if (previous) {
    const p = JSON.parse(previous.answers as string);
    if (p.mode !== x.mode || p.level !== x.level || p.block !== x.block || p.edition !== x.edition)
      throw new AppError('Este intento pertenece a otra actividad.');
    return {
      correct: previous.correct,
      total: previous.total,
      responses: p.responses,
      feedback: p.feedback,
      helpUsed: p.helpUsed === true,
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
  const set = makeRoutine(x.mode, x.level, x.block);
  if (x.answers.length !== set.rounds.length)
    throw new AppError('Completá todos los ejercicios antes de guardar.');
  for (let i = 0; i < x.answers.length; i++) {
    const answer = x.answers[i],
      round = set.rounds[i];
    if (x.mode === 'grammar') {
      const tokens = (s: string) => normalizeAnswer(s).split(' ').sort().join('|');
      if (tokens(answer) !== tokens(round.solution))
        throw new AppError('Usá todos los bloques de la oración, una sola vez.');
    } else if (!round.choices.includes(answer))
      throw new AppError('Elegí una de las opciones de la actividad.');
  }
  const correct = routineScore(set, x.answers),
    total = set.rounds.length,
    date = new Date().toISOString();
  const feedback = set.rounds.map((q, i) => ({
    id: q.id,
    correct: normalizeAnswer(x.answers[i]) === normalizeAnswer(q.solution),
    explanationSpanish: q.why,
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
      responses: x.answers,
      helpUsed: x.helpUsed,
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
    if (!f.correct)
      db.prepare('INSERT INTO mistakes VALUES(?,?,?,?,?,?,?,?,?)').run(
        `${id}:${i}`,
        null,
        id,
        x.mode,
        x.answers[i],
        f.correction,
        f.explanationSpanish,
        `${x.level}:${x.mode}:${f.id}`,
        date,
      );
  });
  return { correct, total, responses: x.answers, feedback, helpUsed: x.helpUsed, repeated: false };
}
