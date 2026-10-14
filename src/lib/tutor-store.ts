import { z } from 'zod';
import type { db as nativeDb } from './db';
import { questions } from './tutor';
import { pdfWhy } from '@/locales/es/answer-help';
const id = z.string().min(1).max(150);
export function tutorMutation(db: ReturnType<typeof nativeDb>, endpoint: string, input: unknown) {
  if (endpoint === 'tutor/message') {
    const item = z
      .object({
        id,
        documentId: id,
        role: z.enum(['user', 'assistant']),
        content: z.string().trim().min(1).max(12000),
        sources: z.array(z.number().int().min(0)).max(5),
        mode: z.enum(['local', 'guided', 'user']),
      })
      .parse(input);
    const doc = db.prepare('SELECT paragraphs FROM documents WHERE id=?').get(item.documentId);
    if (!doc) throw new Error('Document not found.');
    const paragraphs = JSON.parse(doc.paragraphs as string) as string[];
    if (item.sources.some((source) => source >= paragraphs.length))
      throw new Error('Invalid source reference.');
    db.prepare('INSERT OR IGNORE INTO tutor_messages VALUES(?,?,?,?,?,?,?)').run(
      item.id,
      item.documentId,
      item.role,
      item.content,
      JSON.stringify(item.sources),
      item.mode,
      new Date().toISOString(),
    );
    return { ok: true };
  }
  if (endpoint === 'tutor/answer') {
    const item = z
      .object({
        documentId: id,
        round: z.number().int().min(0).max(10000),
        focus: z.number().int().min(0),
        questionId: id,
        answer: z.string().trim().min(1).max(3000),
      })
      .parse(input);
    const doc = db.prepare('SELECT id,paragraphs FROM documents WHERE id=?').get(item.documentId);
    if (!doc) throw new Error('Document not found.');
    const question = questions(
      { id: doc.id as string, paragraphs: JSON.parse(doc.paragraphs as string), pages: [] },
      item.round,
      item.focus,
    ).find((q) => q.id === item.questionId);
    if (!question) throw new Error('This question is no longer available.');
    if (question.answer !== null && !question.options.includes(item.answer))
      throw new Error('Choose one of the available answers.');
    const correct =
      question.answer === null ? null : Number(question.options[question.answer] === item.answer);
    const feedback =
      correct === null
        ? 'Your response is saved. Compare it with the source passage; this open answer has not been automatically graded.'
        : correct
          ? 'Correct. You found the detail in your document.'
          : `${pdfWhy(question.kind)}\n\n${question.options[question.answer!]}`;
    const attemptId = crypto.randomUUID();
    db.prepare('INSERT INTO tutor_attempts VALUES(?,?,?,?,?,?,?,?,?)').run(
      attemptId,
      item.documentId,
      question.id,
      question.prompt,
      item.answer,
      correct,
      feedback,
      question.source.paragraph,
      new Date().toISOString(),
    );
    return { id: attemptId, correct, feedback };
  }
  throw new Error('Unknown tutor action.');
}
