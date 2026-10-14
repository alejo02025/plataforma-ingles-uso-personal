import { saveRoutine } from '@/lib/routine-store';
import { courseWriting, courseGrammar } from '@/lib/course-store';
import { saveLesson } from '@/lib/lesson-store';
import { voiceMutation } from '@/lib/voice-store';
import { workspaceId } from '@/lib/workspace';
import { documentMutation } from '@/lib/document-store';
import { tables } from '@/lib/browser/merge';
import { tutorMutation } from '@/lib/tutor-store';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { saveGame } from '@/lib/game-store';
import { db, dataDir, transaction } from '@/lib/db';
import { authorized, checkOrigin, equal, sessionCookie } from '@/lib/auth';
import {
  snapshot,
  answerDiagnostic,
  startSession,
  tickSession,
  finishActivity,
  saveWord,
  reviewWord,
  checkpoint,
  AppError,
  dailyPlan,
} from '@/lib/service';
import { correctWriting, lookupWord, generateQuestions } from '@/lib/ai';
import { importDocument, MAX_FILE_SIZE } from '@/lib/import';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const id = z.string().min(1).max(80);
const answers = z.record(z.string().max(80), z.number().int().min(0).max(10));
function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
}
function route(request: NextRequest) {
  return request.nextUrl.pathname.replace('/api/', '');
}
export async function GET(request: NextRequest) {
  try {
    const endpoint = route(request);
    if (endpoint === 'health') {
      db().prepare('SELECT version FROM schema_migrations ORDER BY version DESC LIMIT 1').get();
      return json({ status: 'ok' });
    }
    if (!authorized(request)) return json({ error: 'Enter your access key.' }, 401);
    if (endpoint === 'state') return json(snapshot());
    if (endpoint === 'export') {
      const data = Object.fromEntries(
        tables.map((t) => [t, db().prepare(`SELECT * FROM ${t}`).all()]),
      );
      return new NextResponse(
        JSON.stringify(
          { version: 1, workspace: workspaceId, exported_at: new Date().toISOString(), data },
          null,
          2,
        ),
        {
          headers: {
            'Content-Type': 'application/json',
            'Content-Disposition': 'attachment; filename="english-os-data.json"',
            'Cache-Control': 'no-store',
          },
        },
      );
    }
    if (endpoint.startsWith('files/')) {
      const doc = db().prepare('SELECT filename FROM documents WHERE id=?').get(endpoint.slice(6));
      if (!doc?.filename) throw new AppError('File not found.', 404);
      const buffer = await readFile(
        path.join(dataDir, 'files', path.basename(doc.filename as string)),
      );
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="document.pdf"',
          'Cache-Control': 'no-store',
        },
      });
    }
    return json({ error: 'Route not found.' }, 404);
  } catch (error) {
    return handleError(error);
  }
}
export async function POST(request: NextRequest) {
  try {
    checkOrigin(request);
    const endpoint = route(request);
    const length = Number(request.headers.get('content-length') || 0);
    if (length > MAX_FILE_SIZE + 50_000) throw new AppError('This request is too large.', 413);
    if (endpoint === 'login') {
      const { token } = z.object({ token: z.string().max(200) }).parse(await request.json());
      if (!process.env.APP_ACCESS_TOKEN || !equal(token, process.env.APP_ACCESS_TOKEN))
        throw new AppError('Incorrect access key.', 401);
      const response = json({ ok: true });
      response.cookies.set('english-session', sessionCookie(), {
        httpOnly: true,
        sameSite: 'strict',
        secure:
          request.nextUrl.protocol === 'https:' ||
          request.headers.get('x-forwarded-proto') === 'https',
        maxAge: 7 * 86400,
        path: '/',
      });
      return response;
    }
    if (!authorized(request)) return json({ error: 'Enter your access key.' }, 401);
    if (endpoint === 'import') {
      const form = await request.formData();
      const title = z.string().trim().min(3).max(160).parse(form.get('title'));
      const file = form.get('file');
      const text = z
        .string()
        .max(100_000)
        .optional()
        .parse(form.get('text') || undefined);
      return json(
        await importDocument(title, text, file instanceof File && file.size ? file : undefined),
      );
    }
    const rawText = await request.text();
    if (rawText.length > 150_000) throw new AppError('This request is too large.', 413);
    let input: unknown;
    try {
      input = JSON.parse(rawText);
    } catch {
      throw new AppError('Invalid JSON.');
    }
    if (endpoint === 'voice/message') return json(voiceMutation(db(), input));
    if (endpoint === 'course/writing') {
      dailyPlan();
      const plan = db().prepare('SELECT id FROM plans WHERE day=?').get(snapshot().day)!;
      return json(transaction(() => courseWriting(db(), plan.id as string)));
    }
    if (endpoint === 'course/grammar') {
      dailyPlan();
      const plan = db().prepare('SELECT id FROM plans WHERE day=?').get(snapshot().day)!;
      return json(transaction(() => courseGrammar(db(), plan.id as string)));
    }
    if (endpoint === 'classes/result') {
      dailyPlan();
      const plan = db().prepare('SELECT id FROM plans WHERE day=?').get(snapshot().day)!;
      return json(transaction(() => saveLesson(db(), input, plan.id as string)));
    }
    if (endpoint === 'routine/result') {
      dailyPlan();
      const plan = db().prepare('SELECT id FROM plans WHERE day=?').get(snapshot().day)!;
      return json(transaction(() => saveRoutine(db(), input, plan.id as string)));
    }
    if (endpoint === 'games/result') {
      dailyPlan();
      const plan = db().prepare('SELECT id FROM plans ORDER BY day DESC LIMIT 1').get()!;
      return json(transaction(() => saveGame(db(), input, plan.id as string)));
    }
    if (endpoint === 'documents/trash' || endpoint === 'documents/restore')
      return json(documentMutation(db(), endpoint, input));
    if (endpoint.startsWith('tutor/')) return json(tutorMutation(db(), endpoint, input));
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
      const x = z
        .object({ sessionId: id, seconds: z.number().int().min(0).max(7200) })
        .parse(input);
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
      return json(await correctWriting(x.text, x.activityId));
    }
    if (endpoint === 'lookup') {
      const x = z
        .object({ word: z.string().min(1).max(100), sentence: z.string().max(1500) })
        .parse(input);
      return json(await lookupWord(x.word, x.sentence));
    }
    if (endpoint === 'generate-questions') {
      const x = z.object({ documentId: id }).parse(input);
      return json(await generateQuestions(x.documentId));
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
    return json({ error: 'Route not found.' }, 404);
  } catch (error) {
    return handleError(error);
  }
}
function handleError(error: unknown) {
  if (error instanceof AppError) return json({ error: error.message }, error.status);
  if (error instanceof z.ZodError)
    return json({ error: 'Check your entries: a field is incomplete or invalid.' }, 400);
  console.error('English OS:', error instanceof Error ? error.name : 'Unknown error');
  return json(
    { error: 'The action could not be completed. Your previous data is preserved.' },
    500,
  );
}
