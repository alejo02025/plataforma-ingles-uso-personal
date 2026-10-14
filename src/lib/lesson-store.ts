import { z } from 'zod';
import { checkLessonAccess } from './course-store';
import type { DatabaseSync } from 'node:sqlite';
import { lessons, classRevision } from './lessons';
import { localDay } from './learning';
import { AppError } from './domain';
export function saveLesson(
  connection: Pick<DatabaseSync, 'prepare'>,
  input: unknown,
  planId: string,
) {
  const x = z
    .object({
      id: z.string().uuid(),
      lessonId: z.string().max(60),
      revision: z.number().int(),
      answers: z.array(z.number().int().min(0).max(2)).max(6),
      practice: z.string().trim().max(2000).default(''),
      seconds: z.number().int().min(0).max(7200),
    })
    .parse(input);
  const lesson = lessons.find((item) => item.id === x.lessonId);
  if (!lesson || x.revision !== classRevision)
    throw new AppError('This class has changed. Update the app and reopen it.');
  if (x.answers.length !== lesson.checks.length)
    throw new AppError('Answer every question before saving your class.');
  const id = `class:${x.id}`;
  const previous = connection
    .prepare('SELECT correct,total,answers FROM results WHERE activity_id=?')
    .get(id);
  if (previous) {
    const saved = JSON.parse(previous.answers as string);
    if (saved.lessonId !== lesson.id) throw new AppError('This attempt belongs to another class.');
    return {
      correct: previous.correct,
      total: previous.total,
      feedback: saved.feedback,
      repeated: true,
    };
  }
  checkLessonAccess(connection, lesson.id);
  const feedback = lesson.checks.map((q, i) => ({
    id: `${lesson.id}:${i}`,
    correct: x.answers[i] === q.answer,
    explanationSpanish: q.why,
    correction: q.correction,
  }));
  const skill = lesson.skill || 'grammar';
  const correct = feedback.filter((f) => f.correct).length,
    total = feedback.length,
    date = new Date().toISOString();
  connection
    .prepare(
      'INSERT INTO activities(id,plan_id,kind,title,minutes,document_id,payload,completed_at) VALUES(?,?,?,?,?,?,?,?)',
    )
    .run(
      id,
      planId,
      skill,
      lesson.title,
      8,
      null,
      JSON.stringify({ optional: true, lesson: lesson.id }),
      date,
    );
  connection
    .prepare(
      'INSERT INTO sessions(id,activity_id,started_at,active_seconds,ended_at) VALUES(?,?,?,?,?)',
    )
    .run(id, id, new Date(Date.now() - x.seconds * 1000).toISOString(), x.seconds, date);
  connection.prepare('INSERT INTO results VALUES(?,?,?,?,?,?,?,?,?)').run(
    id,
    id,
    id,
    skill,
    correct,
    total,
    JSON.stringify({
      lessonId: lesson.id,
      revision: classRevision,
      responses: x.answers,
      practice: x.practice,
      feedback,
    }),
    date,
    localDay(),
  );
  connection
    .prepare('INSERT INTO progress_history VALUES(?,?,?,?,?,?)')
    .run(id, skill, correct, total, id, date);
  feedback.forEach((f, i) => {
    if (!f.correct)
      connection
        .prepare('INSERT INTO mistakes VALUES(?,?,?,?,?,?,?,?,?)')
        .run(
          `${id}:${i}`,
          null,
          id,
          skill,
          lesson.checks[i].options[x.answers[i]],
          f.correction,
          f.explanationSpanish,
          `${lesson.id}:${i}`,
          date,
        );
  });
  return { correct, total, feedback, repeated: false };
}
