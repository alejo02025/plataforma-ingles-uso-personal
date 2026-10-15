import type { DatabaseSync } from 'node:sqlite';
import { z } from 'zod';
import {
  makeStudyDay,
  studyDayId,
  studyTaskDone,
  parseStudyDay,
  type StudyDay,
} from './daily-study';
import type { Snapshot } from './types';
const inputSchema = z.object({
  minutes: z.union([
    z.literal(5),
    z.literal(15),
    z.literal(20),
    z.literal(30),
    z.literal(40),
    z.literal(45),
  ]),
  paused: z
    .object({
      id: z.string().uuid(),
      mode: z.enum(['vocabulary', 'grammar', 'reading']),
      level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']),
      block: z.number().int().min(0).max(100),
    })
    .nullish(),
});
/** Agenda lives in the existing synced database; no new schema and no learning credit. */
export function saveStudyDay(
  db: Pick<DatabaseSync, 'prepare'>,
  input: unknown,
  data: Snapshot,
): StudyDay {
  const x = inputSchema.parse(input),
    id = studyDayId(data.day);
  const old = db.prepare('SELECT payload FROM activities WHERE id=?').get(id);
  let payload: Record<string, unknown> = {};
  if (old) {
    try {
      payload = JSON.parse(old.payload as string);
    } catch {
      payload = { previousPayload: old.payload };
    }
  }
  const saved = parseStudyDay(payload?.studyDay);
  if (saved && saved.day === data.day) {
    if (saved.minutes !== x.minutes) {
      const done = saved.tasks
        .filter((task) => studyTaskDone(task, saved, data))
        .map((task) => ({ ...task, completed: true }));
      // A finished day never reopens merely because a preference changed.
      const next =
        done.length === saved.tasks.length
          ? { ...saved, minutes: x.minutes }
          : makeStudyDay(data, x.minutes, x.paused);
      if (done.length !== saved.tasks.length)
        next.tasks = [
          ...done,
          ...next.tasks.filter((task) => !done.some((d) => d.id === task.id)),
        ].slice(0, 4);
      db.prepare('UPDATE activities SET payload=? WHERE id=?').run(
        JSON.stringify({ ...payload, optional: true, studyDay: next }),
        id,
      );
      return next;
    }
    return saved;
  }
  const planId = db.prepare('SELECT id FROM plans WHERE day=?').get(data.day)!.id as string;
  const agenda = makeStudyDay(data, x.minutes, x.paused);
  if (old) {
    db.prepare('UPDATE activities SET payload=? WHERE id=?').run(
      JSON.stringify({
        ...payload,
        optional: true,
        previousAgenda: payload?.studyDay,
        studyDay: agenda,
      }),
      id,
    );
    return agenda;
  }
  db.prepare(
    'INSERT INTO activities(id,plan_id,kind,title,minutes,document_id,payload) VALUES(?,?,?,?,?,?,?)',
  ).run(
    id,
    planId,
    'grammar',
    'Daily study agenda',
    0,
    null,
    JSON.stringify({ optional: true, studyDay: agenda }),
  );
  return agenda;
}
