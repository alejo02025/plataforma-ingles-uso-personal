import { textSections } from '../text-sections';
import { db, basePath } from './database';
import { write } from './storage';
export async function importDocument(title: string, text?: string, file?: File) {
  const id = crypto.randomUUID();
  let bytes: Uint8Array | undefined;
  let extracted: { page: number | null; text: string }[] | undefined;
  if (file) {
    if (file.size > 10 * 1024 * 1024) throw new Error('The PDF must be smaller than 10 MB.');
    bytes = new Uint8Array(await file.arrayBuffer());
    if (new TextDecoder().decode(bytes.slice(0, 5)) !== '%PDF-')
      throw new Error('This file does not have a valid PDF header.');
    const pdfjs = await import('pdfjs-dist');
    pdfjs.GlobalWorkerOptions.workerSrc = `${basePath}/assets/pdf.worker.min.mjs`;
    const parser = await pdfjs.getDocument({ data: bytes.slice(), isEvalSupported: false }).promise;
    try {
      if (parser.numPages > 150) throw new Error('Import a section of up to 150 pages.');
      const pages: { page: number; text: string }[] = [];
      for (let page = 1; page <= parser.numPages; page++) {
        const content = await (await parser.getPage(page)).getTextContent();
        pages.push({
          page,
          text: content.items.map((item) => ('str' in item ? item.str : '')).join(' '),
        });
      }
      extracted = pages;
      text = pages.map((p) => p.text).join('\n\n');
    } finally {
      await parser.destroy();
    }
  }
  if (!text || text.trim().length < 80)
    throw new Error('At least 80 characters are needed. Scanned PDFs require OCR.');
  if (text.length > 100000) throw new Error('Import a section of up to 100,000 characters.');
  const sections = textSections(extracted || [{ page: null, text }]);
  const paragraphs = sections.map((section) => section.text);
  if (bytes) await write(`file:${id}.pdf`, bytes);
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
      file ? `${id}.pdf` : null,
      new Date().toISOString(),
    );
  for (const [index, section] of sections.entries())
    db()
      .prepare('INSERT INTO document_sections VALUES(?,?,?,?)')
      .run(`${id}:${index}`, id, index, section.page);
  return { id };
}
