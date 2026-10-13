import { z } from 'zod';
import type { DatabaseSync } from 'node:sqlite';
import { AppError } from './domain';

export function documentMutation(
  connection: Pick<DatabaseSync, 'prepare'>,
  endpoint: string,
  input: unknown,
) {
  const { id } = z.object({ id: z.string().min(1).max(80) }).parse(input);
  const doc = connection.prepare('SELECT source FROM documents WHERE id=?').get(id);
  if (!doc) throw new AppError('Document not found.', 404);
  const source = String(doc.source);
  if (source === 'editorial' || source === 'trash:editorial')
    throw new AppError('Editorial readings stay in your library.');
  const original = source.startsWith('trash:') ? source.slice(6) : source;
  if (endpoint !== 'documents/trash' && endpoint !== 'documents/restore')
    throw new AppError('Unknown document action.');
  connection
    .prepare('UPDATE documents SET source=? WHERE id=?')
    .run(endpoint === 'documents/trash' ? `trash:${original}` : original, id);
  return { ok: true };
}
