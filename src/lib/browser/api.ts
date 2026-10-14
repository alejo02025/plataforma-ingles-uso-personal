import { courseWriting, courseGrammar } from '@/lib/course-store';
import { saveLesson } from '../lesson-store';
import { cefrMutation } from '../cefr-store';
import { isPortuguese } from '../workspace';
import { voiceMutation } from '../voice-store';
import { saveGame } from '../game-store';
import { documentMutation } from '../document-store';
import { tutorMutation } from '../tutor-store';
import { z } from 'zod';
import { createLearningService, AppError } from '../domain';
import { glossary } from '../content';
import { db, load, persist, transaction, exclusive, capture } from './database';
import { importDocument } from './import';
import { changed } from './sync';
const randomUUID = () => crypto.randomUUID();
function idFor(seed: string) {
  return `g:${seed}`;
}
const {
  snapshot,
  answerDiagnostic,
  startSession,
  tickSession,
  finishActivity,
  saveWord,
  reviewWord,
  checkpoint,
  dailyPlan,
} = createLearningService({ db, transaction, uuid: randomUUID, idFor });
function json(data: unknown) {
  return data;
}
function unavailableAI(): never {
  throw new AppError(
    'This feature needs the server AI service. You can still save your writing and use local AI in PDF Studio.',
  );
}
const id = z.string().min(1).max(80);
const answers = z.record(z.string().max(80), z.number().int().min(0).max(10));
export async function browserApi(endpoint: string, input?: unknown): Promise<unknown> {
  await load();
  return exclusive(async () => {
    const before = JSON.stringify(capture().data);
    const result = await dispatch(endpoint, input);
    const modified = before !== JSON.stringify(capture().data);
    await persist();
    if (modified) changed();
    return result;
  });
}
async function dispatch(endpoint: string, input?: unknown): Promise<unknown> {
  if (endpoint.startsWith('cefr/') && isPortuguese) return cefrMutation(db(), endpoint, input);
  if (endpoint === 'state') return snapshot();
  if (endpoint === 'voice/message') return voiceMutation(db(), input);
  if (endpoint === 'course/writing') {
    dailyPlan();
    const plan = db().prepare('SELECT id FROM plans WHERE day=?').get(snapshot().day)!;
    return transaction(() => courseWriting(db(), plan.id as string));
  }
  if (endpoint === 'course/grammar') {
    dailyPlan();
    const plan = db().prepare('SELECT id FROM plans WHERE day=?').get(snapshot().day)!;
    return transaction(() => courseGrammar(db(), plan.id as string));
  }
  if (endpoint === 'classes/result') {
    dailyPlan();
    const plan = db().prepare('SELECT id FROM plans WHERE day=?').get(snapshot().day)!;
    return transaction(() => saveLesson(db(), input, plan.id as string));
  }
  if (endpoint === 'games/result') {
    dailyPlan();
    const plan = db().prepare('SELECT id FROM plans ORDER BY day DESC LIMIT 1').get()!;
    return transaction(() => saveGame(db(), input, plan.id as string));
  }
  if (endpoint === 'documents/trash' || endpoint === 'documents/restore')
    return documentMutation(db(), endpoint, input);
  if (endpoint === 'export') return capture();
  if (endpoint === 'import') {
    if (!(input instanceof FormData)) throw new AppError('This material is not valid.');
    const title = z.string().trim().min(3).max(160).parse(input.get('title'));
    const file = input.get('file');
    const text = z
      .string()
      .max(100000)
      .optional()
      .parse(input.get('text') || undefined);
    return importDocument(title, text, file instanceof File && file.size ? file : undefined);
  }
  if (endpoint.startsWith('tutor/')) return tutorMutation(db(), endpoint, input);
  if (endpoint === 'profile') {
    const p = z
      .object({
        name: z.string().trim().min(1).max(60),
        daily_minutes: z.union([z.literal(5), z.literal(20), z.literal(40)]),
        interests: z
          .array(z.enum(['Travel', 'Finance', 'History', 'Technology', 'Work', 'Everyday Life']))
          .min(1)
          .max(6),
        theme: z.enum(['light', 'dark']),
      })
      .parse(input);
    db()
      .prepare('UPDATE profile SET name=?,daily_minutes=?,interests=?,theme=? WHERE id=1')
      .run(p.name, p.daily_minutes, JSON.stringify(p.interests), p.theme);
    return json({ ok: true });
  }
  if (endpoint === 'diagnostic') {
    const x = z.object({ questionId: id, answer: z.number().int().min(0).max(10) }).parse(input);
    return json(answerDiagnostic(x.questionId, x.answer));
  }
  if (endpoint === 'session') {
    const x = z.object({ activityId: id }).parse(input);
    return json(startSession(x.activityId));
  }
  if (endpoint === 'tick') {
    const x = z.object({ sessionId: id, seconds: z.number().int().min(0).max(7200) }).parse(input);
    tickSession(x.sessionId, x.seconds);
    return json({ ok: true });
  }
  if (endpoint === 'result') {
    const x = z
      .object({
        activityId: id,
        sessionId: id,
        seconds: z.number().int().min(0).max(7200),
        answers,
        text: z.string().max(6000).optional(),
      })
      .parse(input);
    return json(finishActivity(x));
  }
  if (endpoint === 'word') {
    const x = z
      .object({
        word: z.string().trim().min(1).max(100),
        sourceId: id.optional(),
        meaning: z.string().max(1000).optional(),
        pronunciation: z.string().max(150).optional(),
        example: z.string().max(1500).optional(),
      })
      .parse(input);
    return json(saveWord(x));
  }
  if (endpoint === 'review') {
    const x = z.object({ id, known: z.boolean() }).parse(input);
    return json(reviewWord(x.id, x.known));
  }
  if (endpoint === 'checkpoint') {
    const x = z.object({ id, paragraph: z.number().int().min(0), draft: answers }).parse(input);
    checkpoint(x.id, x.paragraph, x.draft);
    return json({ ok: true });
  }
  if (endpoint === 'correction') {
    const x = z
      .object({ text: z.string().trim().min(30).max(6000), activityId: id.optional() })
      .parse(input);
    return json(unavailableAI());
  }
  if (endpoint === 'lookup') {
    const x = z
      .object({ word: z.string().min(1).max(100), sentence: z.string().max(1500) })
      .parse(input);
    return json(
      glossary[x.word.toLowerCase()] || { meaning: '', pronunciation: '', example: x.sentence },
    );
  }
  if (endpoint === 'generate-questions') {
    const x = z.object({ documentId: id }).parse(input);
    return json(unavailableAI());
  }
  if (endpoint === 'reading-activity') {
    const x = z.object({ documentId: id }).parse(input);
    const doc = db().prepare('SELECT * FROM documents WHERE id=?').get(x.documentId);
    if (!doc) throw new AppError('Text not found.', 404);
    dailyPlan();
    const plan = db().prepare('SELECT id FROM plans ORDER BY day DESC LIMIT 1').get()!;
    const previous = db()
      .prepare(
        'SELECT id FROM activities WHERE document_id=? AND plan_id=? AND completed_at IS NULL',
      )
      .get(x.documentId, plan.id as string);
    if (previous) return json(previous);
    const activityId = randomUUID();
    db()
      .prepare(
        'INSERT INTO activities(id,plan_id,kind,title,minutes,document_id,payload) VALUES(?,?,?,?,?,?,?)',
      )
      .run(
        activityId,
        plan.id as string,
        'reading',
        doc.title as string,
        doc.minutes as number,
        x.documentId,
        JSON.stringify({ optional: true }),
      );
    return json({ id: activityId });
  }
  if (endpoint === 'draft') {
    const x = z.object({ activityId: id, text: z.string().max(6000) }).parse(input);
    const a = db()
      .prepare('SELECT payload FROM activities WHERE id=? AND completed_at IS NULL')
      .get(x.activityId);
    if (!a) throw new AppError('Activity not found.', 404);
    db()
      .prepare('UPDATE activities SET payload=? WHERE id=?')
      .run(JSON.stringify({ ...JSON.parse(a.payload as string), draft: x.text }), x.activityId);
    return json({ ok: true });
  }
  throw new AppError('Route not found.');
}
