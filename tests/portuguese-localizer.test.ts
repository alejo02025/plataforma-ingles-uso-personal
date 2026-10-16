import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

test('Portuguese build localizes native controls but preserves Spanish teaching copy and its markup', async () => {
  const { localizePortuguese } = await import(
    new URL('../scripts/localize-portuguese.mjs', import.meta.url).href
  );
  const root = await mkdtemp(path.join(tmpdir(), 'grammar-localization-'));
  try {
    await mkdir(path.join(root, 'src/lib'), { recursive: true });
    await mkdir(path.join(root, 'src/components'), { recursive: true });
    const fixture = `<div>
      <select aria-label="Choose a time"><option>Present</option></select>
      <span lang="es">Tiempo verbal</span>
      <p lang="es-AR"><strong>Question</strong>Tiempo verbal</p>
      <StudyCopy native="Present">Afirmación / modelo</StudyCopy>
      <StudyCopy><strong>Tiempo verbal</strong></StudyCopy>
      <SpanishTranslation text="Present" spanish="Tiempo verbal" />
    </div>`;
    const file = path.join(root, 'src/components/fixture.tsx');
    await writeFile(file, fixture);
    await localizePortuguese(root);
    const output = await readFile(file, 'utf8');
    assert.match(output, /aria-label="Escolher um tempo"/);
    assert.ok(output.includes('<span lang="es">Tiempo verbal</span>'));
    assert.ok(output.includes('<p lang="es-AR"><strong>Question</strong>Tiempo verbal</p>'));
    assert.ok(output.includes('>Afirmación / modelo</StudyCopy>'));
    assert.ok(output.includes('<StudyCopy><strong>Tiempo verbal</strong></StudyCopy>'));
    assert.match(output, /spanish="Tiempo verbal"/);
    assert.match(output, /native="Presente"/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
