import { z } from 'zod';
import { validate, type Manifest } from './merge';
import { workspaceId } from '../workspace';
export const backupLimit = 100 * 1024 * 1024;
const attachment = z
  .object({
    key: z
      .string()
      .max(160)
      .regex(/^(?:file:[a-zA-Z0-9-]+\.pdf|oral-audio:[a-zA-Z0-9-]+)$/),
    kind: z.enum(['bytes', 'blob']),
    mime: z.string().max(100),
    base64: z
      .string()
      .max(backupLimit)
      .regex(/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/),
  })
  .strict();
const envelope = z
  .object({
    format: z.literal('lingua-local-backup'),
    version: z.literal(1),
    workspace: z.enum(['en', 'pt']),
    createdAt: z.string().datetime(),
    manifest: z.unknown(),
    attachments: z.array(attachment).max(10000),
  })
  .strict();
export type LocalBackupFile = Omit<z.infer<typeof envelope>, 'manifest'> & { manifest: Manifest };
export function parseLocalBackup(input: unknown): LocalBackupFile {
  const parsed = envelope.parse(input);
  if (parsed.workspace !== workspaceId)
    throw new Error('Este respaldo pertenece a otro idioma. Cambiá al idioma correspondiente.');
  const manifest = validate(parsed.manifest);
  const profile = manifest.data.profile;
  if (
    profile.length !== 1 ||
    Number(profile[0].id) !== 1 ||
    typeof profile[0].name !== 'string' ||
    !profile[0].name.trim() ||
    !['light', 'dark'].includes(String(profile[0].theme))
  )
    throw new Error('El respaldo no contiene un perfil válido.');
  const jsonFields: Record<string, string[]> = {
    profile: ['interests'],
    documents: ['paragraphs', 'questions'],
    activities: ['payload'],
    reading_progress: ['draft'],
    results: ['answers'],
  };
  for (const [table, fields] of Object.entries(jsonFields))
    for (const row of manifest.data[table])
      for (const field of fields) {
        if (typeof row[field] !== 'string')
          throw new Error('El respaldo contiene datos incompletos.');
        try {
          JSON.parse(row[field] as string);
        } catch {
          throw new Error('El respaldo contiene datos dañados.');
        }
      }
  if (parsed.attachments.reduce((n, a) => n + a.base64.length, 0) > backupLimit)
    throw new Error('El respaldo supera el límite de 100 MB.');
  const keys = parsed.attachments.map((a) => a.key);
  if (new Set(keys).size !== keys.length)
    throw new Error('El respaldo contiene archivos duplicados.');
  return { ...parsed, manifest };
}
