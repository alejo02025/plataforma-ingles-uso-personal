import { db, basePath } from './database';
import { write } from './storage';
export async function importDocument(title: string, text?: string, file?: File) {
  const id = crypto.randomUUID();
  let bytes: Uint8Array | undefined;
  if (file) {
    if (file.size > 10 * 1024 * 1024) throw new Error('El PDF debe pesar menos de 10 MB.');
    bytes = new Uint8Array(await file.arrayBuffer());
    if (new TextDecoder().decode(bytes.slice(0, 5)) !== '%PDF-')
      throw new Error('El archivo no tiene una cabecera PDF válida.');
    const pdfjs = await import('pdfjs-dist');
    pdfjs.GlobalWorkerOptions.workerSrc = `${basePath}/assets/pdf.worker.min.mjs`;
    const parser = await pdfjs.getDocument({ data: bytes.slice(), isEvalSupported: false }).promise;
    try {
      if (parser.numPages > 150) throw new Error('Importá un fragmento de hasta 150 páginas.');
      const pages = [];
      for (let page = 1; page <= parser.numPages; page++) {
        const content = await (await parser.getPage(page)).getTextContent();
        pages.push(content.items.map((item) => ('str' in item ? item.str : '')).join(' '));
      }
      text = pages.join('\n\n');
    } finally {
      await parser.destroy();
    }
  }
  if (!text || text.trim().length < 80)
    throw new Error('Necesitamos al menos 80 caracteres. Los PDF escaneados requieren OCR.');
  if (text.length > 100000) throw new Error('Importá un fragmento de hasta 100.000 caracteres.');
  const paragraphs = text
    .replace(/\r|\u0000/g, '')
    .trim()
    .split(/\n\s*\n/)
    .flatMap((section) => {
      const words = section.trim().split(/\s+/),
        chunks = [];
      for (let i = 0; i < words.length; i += 100) chunks.push(words.slice(i, i + 100).join(' '));
      return chunks;
    });
  if (bytes) await write(`file:${id}.pdf`, bytes);
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
      file ? `${id}.pdf` : null,
      new Date().toISOString(),
    );
  return { id };
}
