import { randomUUID } from 'node:crypto';
import { mkdir, writeFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import { db, dataDir } from './db';
import { AppError } from './service';
export const MAX_FILE_SIZE = 10 * 1024 * 1024;
export function splitText(text: string): string[] {
  const cleaned = text
    .replace(/\r/g, '')
    .replace(/\u0000/g, '')
    .trim();
  const sections = cleaned
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
  return sections.flatMap((section) => {
    const words = section.split(' '),
      chunks: string[] = [];
    for (let i = 0; i < words.length; i += 100) chunks.push(words.slice(i, i + 100).join(' '));
    return chunks;
  });
}
export async function importDocument(title: string, text?: string, file?: File) {
  let filename: string | null = null,
    buffer: Buffer | undefined;
  const id = randomUUID();
  if (file) {
    if (file.size > MAX_FILE_SIZE) throw new AppError('El PDF debe pesar menos de 10 MB.', 413);
    buffer = Buffer.from(await file.arrayBuffer());
    if (!buffer.subarray(0, 5).equals(Buffer.from('%PDF-')))
      throw new AppError('El archivo no tiene una cabecera PDF válida.');
    const { PDFParse } = await import('pdf-parse');
    const parser = new PDFParse({ data: buffer });
    try {
      const info = await parser.getInfo();
      if (info.total > 150) throw new AppError('Importá un fragmento de hasta 150 páginas.');
      const result = await parser.getText({ pageJoiner: '\n\n' });
      text = result.text;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('No pudimos leer este PDF. Puede estar protegido o dañado.');
    } finally {
      await parser.destroy();
    }
    filename = `${id}.pdf`;
  }
  if (!text || text.trim().length < 80)
    throw new AppError(
      'Necesitamos al menos 80 caracteres de texto. Los PDF escaneados requieren OCR, todavía no disponible.',
    );
  if (text.length > 100_000)
    throw new AppError(
      'El texto es demasiado largo. Importá un fragmento de hasta 100.000 caracteres.',
      413,
    );
  const paragraphs = splitText(text);
  if (buffer && filename) {
    await mkdir(path.join(dataDir, 'files'), { recursive: true, mode: 0o700 });
    await writeFile(path.join(dataDir, 'files', filename), buffer, { mode: 0o600, flag: 'wx' });
  }
  try {
    db()
      .prepare('INSERT INTO documents VALUES(?,?,?,?,?,?,?,?,?,?,?)')
      .run(
        id,
        title,
        'Tu material',
        'Sin estimar',
        file ? 'pdf' : 'texto',
        Math.max(1, Math.ceil(text.split(/\s+/).length / 130)),
        'Material personal · dificultad pendiente de evaluación',
        JSON.stringify(paragraphs),
        '[]',
        filename,
        new Date().toISOString(),
      );
  } catch (error) {
    if (filename) await unlink(path.join(dataDir, 'files', filename));
    throw error;
  }
  return { id };
}
