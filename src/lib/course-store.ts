import { isPortuguese } from './workspace';
import { cefrLevels } from './cefr-curriculum';
import type { DatabaseSync } from 'node:sqlite';
import type { Snapshot, Activity } from './types';
import {
  courseRoute,
  lessonRequirements,
  levelLessons,
  integration,
  blockSize,
  startLevel,
  type CourseEvidence,
} from './course-route';
import { localDay } from './learning';
import { lessons } from './lessons';
type Connection = Pick<DatabaseSync, 'prepare'>;
export function courseEvidence(db: Connection): CourseEvidence {
  return {
    day: localDay(),
    courseCheckpoints: db
      .prepare('SELECT * FROM course_checkpoints ORDER BY completed_at,id')
      .all() as Snapshot['courseCheckpoints'],
    results: db
      .prepare(
        'SELECT r.*,a.document_id,a.title FROM results r JOIN activities a ON a.id=r.activity_id ORDER BY r.completed_at',
      )
      .all() as Snapshot['results'],
    reviews: db.prepare('SELECT * FROM reviews ORDER BY reviewed_at').all() as Snapshot['reviews'],
    documents: db.prepare('SELECT * FROM documents').all() as unknown as Snapshot['documents'],
    tutorMessages: db
      .prepare('SELECT * FROM tutor_messages ORDER BY created_at')
      .all() as Snapshot['tutorMessages'],
    tutorAttempts: db
      .prepare('SELECT * FROM tutor_attempts ORDER BY created_at')
      .all() as Snapshot['tutorAttempts'],
    backlog: db
      .prepare(
        "SELECT a.* FROM activities a JOIN plans p ON p.id=a.plan_id JOIN documents d ON d.id=a.document_id WHERE d.source NOT LIKE 'trash:%' AND a.kind='reading' AND a.completed_at IS NULL AND p.day < ? AND (EXISTS(SELECT 1 FROM sessions s WHERE s.activity_id=a.id) OR p.day=(SELECT MAX(day) FROM plans WHERE day < ?)) ORDER BY p.day,a.id",
      )
      .all(localDay(), localDay())
      .map((row) => ({ ...row, payload: JSON.parse(row.payload as string) })) as Activity[],
  };
}
export function checkLessonAccess(db: Connection, id: string) {
  const lesson = lessons.find((l) => l.id === id);
  if (!lesson) throw new Error('Class not found.');
  const pending = lessonRequirements(courseEvidence(db), lesson).filter((r) => !r.done);
  if (pending.length) throw new Error(pending.map((r) => r.explanation).join(' '));
}
export function studyLevel(db: Connection) {
  return courseRoute(courseEvidence(db)).level;
}
export function courseWriting(db: Connection, planId: string): Activity {
  const level = studyLevel(db);
  const existing = db
    .prepare(
      "SELECT * FROM activities WHERE plan_id=? AND kind='writing' AND completed_at IS NULL ORDER BY rowid LIMIT 1",
    )
    .get(planId);
  if (existing) return { ...existing, payload: JSON.parse(existing.payload as string) } as Activity;
  const id = `course-writing:${crypto.randomUUID()}`;
  const activity: Activity = {
    id,
    plan_id: planId,
    kind: 'writing',
    title: 'Use your class in real life',
    minutes: 5,
    document_id: null,
    payload: {
      optional: true,
      prompt: isPortuguese
        ? `${level} · Escreva uma situação real usando uma ideia das suas aulas atuais. Inclua pelo menos duas frases e um detalhe concreto. Sua prática é salva sem nota automática.`
        : `${level} · Write a real situation using an idea from your current classes. Include at least two sentences and a concrete detail. Your practice is saved without an automatic grade.`,
    },
    completed_at: null,
  };
  db.prepare(
    'INSERT INTO activities(id,plan_id,kind,title,minutes,document_id,payload) VALUES(?,?,?,?,?,?,?)',
  ).run(
    id,
    planId,
    activity.kind,
    activity.title,
    activity.minutes,
    null,
    JSON.stringify(activity.payload),
  );
  return activity;
}

export function preserveCourseProgress(db: Connection) {
  const evidence = courseEvidence(db),
    route = courseRoute(evidence);
  const save = db.prepare('INSERT OR IGNORE INTO course_checkpoints VALUES(?,?,?)');
  for (const level of cefrLevels.slice(
    cefrLevels.indexOf(startLevel),
    cefrLevels.indexOf(route.level) + 1,
  )) {
    const items = levelLessons(level);
    for (let i = 0; i < items.length; i += blockSize) {
      const block = items.slice(i, i + blockSize);
      if (integration(evidence, block).every((r) => r.done))
        save.run(`block:${block[0].id}`, level, new Date().toISOString());
    }
  }
  for (const level of route.completed) save.run(`level:${level}`, level, new Date().toISOString());
}
