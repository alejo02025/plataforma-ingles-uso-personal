import { textSections } from './text-sections';
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
  let extracted: { page: number | null; text: string }[] | undefined;
  if (file) {
    if (file.size > MAX_FILE_SIZE) throw new AppError('The PDF must be smaller than 10 MB.', 413);
    buffer = Buffer.from(await file.arrayBuffer());
    if (!buffer.subarray(0, 5).equals(Buffer.from('%PDF-')))
      throw new AppError('This file does not have a valid PDF header.');
    const { PDFParse } = await import('pdf-parse');
    const parser = new PDFParse({ data: buffer });
    try {
      const info = await parser.getInfo();
      if (info.total > 150) throw new AppError('Import a section of up to 150 pages.');
      const result = await parser.getText({ pageJoiner: '\n\n' });
      text = result.text;
      extracted = result.pages.map((page) => ({ page: page.num, text: page.text }));
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('This PDF could not be read. It may be protected or damaged.');
    } finally {
      await parser.destroy();
    }
    filename = `${id}.pdf`;
  }
  if (!text || text.trim().length < 80)
    throw new AppError(
      'At least 80 text characters are needed. Scanned PDFs require OCR, which is not included yet.',
    );
  if (text.length > 100_000)
    throw new AppError('The text is too long. Import a section of up to 100,000 characters.', 413);
  const sections = textSections(extracted || [{ page: null, text }]);
  const paragraphs = sections.map((section) => section.text);
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
        'Your material',
        'Not assessed',
        file ? 'pdf' : 'texto',
        Math.max(1, Math.ceil(text.split(/\s+/).length / 130)),
        'Personal material · difficulty not assessed yet',
        JSON.stringify(paragraphs),
        '[]',
        filename,
        new Date().toISOString(),
      );
  } catch (error) {
    if (filename) await unlink(path.join(dataDir, 'files', filename));
    throw error;
  }
  for (const [index, section] of sections.entries())
    db()
      .prepare('INSERT INTO document_sections VALUES(?,?,?,?)')
      .run(`${id}:${index}`, id, index, section.page);
  return { id };
}
