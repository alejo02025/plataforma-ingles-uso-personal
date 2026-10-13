import { z } from 'zod';
import type { DatabaseSync } from 'node:sqlite';
import { voiceDocumentId } from './voice';
export function voiceMutation(db: Pick<DatabaseSync, 'prepare'>, input: unknown) {
  const x = z
    .object({
      id: z.string().uuid(),
      role: z.enum(['user', 'assistant']),
      content: z.string().trim().min(1).max(3000),
      mode: z.enum(['user', 'local', 'guided']),
    })
    .parse(input);
  db.prepare(
    'INSERT OR IGNORE INTO documents(id,title,topic,level,source,minutes,intro,paragraphs,questions,created_at) VALUES(?,?,?,?,?,?,?,?,?,?)',
  ).run(
    voiceDocumentId,
    'Speaking room',
    'Speaking',
    'Unassessed',
    'conversation',
    3,
    '',
    '[]',
    '[]',
    new Date().toISOString(),
  );
  db.prepare('INSERT OR IGNORE INTO tutor_messages VALUES(?,?,?,?,?,?,?)').run(
    x.id,
    voiceDocumentId,
    x.role,
    x.content,
    '[]',
    x.mode,
    new Date().toISOString(),
  );
  return { ok: true };
}
