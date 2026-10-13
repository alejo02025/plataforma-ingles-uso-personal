import type { DatabaseSync } from 'node:sqlite';
import { z } from 'zod';
import { makePuzzle, normalizeAnswer, gameTitles } from './games';
import { AppError } from './domain';
import { localDay } from './learning';
export function saveGame(
  connection: Pick<DatabaseSync, 'prepare'>,
  input: unknown,
  planId: string,
) {
  const x = z
    .object({
      id: z.string().uuid(),
      mode: z.enum(['match', 'sentence', 'trail']),
      seed: z.string().min(1).max(100),
      answers: z.array(z.string().max(1500)).max(4),
      seconds: z.number().int().min(0).max(7200),
    })
    .parse(input);
  const id = `game:${x.id}`;
  const previous = connection
    .prepare('SELECT correct,total FROM results WHERE activity_id=?')
    .get(id);
  if (previous) return { ...previous, repeated: true };
  const puzzle = makePuzzle(x.mode, x.seed);
  if (x.answers.length !== puzzle.rounds.length)
    throw new AppError('Finish every round before saving.');
  const correct = puzzle.rounds.filter(
    (round, index) => normalizeAnswer(x.answers[index]) === normalizeAnswer(round.solution),
  ).length;
  const date = new Date().toISOString(),
    total = puzzle.rounds.length;
  connection
    .prepare(
      'INSERT INTO activities(id,plan_id,kind,title,minutes,document_id,payload,completed_at) VALUES(?,?,?,?,?,?,?,?)',
    )
    .run(
      id,
      planId,
      'vocabulary',
      gameTitles[x.mode],
      3,
      null,
      JSON.stringify({ optional: true, game: x.mode }),
      date,
    );
  connection
    .prepare(
      'INSERT INTO sessions(id,activity_id,started_at,active_seconds,ended_at) VALUES(?,?,?,?,?)',
    )
    .run(id, id, new Date(Date.now() - x.seconds * 1000).toISOString(), x.seconds, date);
  connection
    .prepare('INSERT INTO results VALUES(?,?,?,?,?,?,?,?,?)')
    .run(
      id,
      id,
      id,
      'vocabulary',
      correct,
      total,
      JSON.stringify({ game: x.mode, seed: x.seed, responses: x.answers, feedback: [] }),
      date,
      localDay(),
    );
  connection
    .prepare('INSERT INTO progress_history VALUES(?,?,?,?,?,?)')
    .run(id, 'vocabulary', correct, total, id, date);
  return { correct, total, repeated: false };
}
