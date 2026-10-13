import ts from 'typescript';
import { readFile, writeFile, readdir, cp } from 'node:fs/promises';
import path from 'node:path';
const normalized = (text) => text.replace(/\s+/g, ' ').trim();
export async function localizePortuguese(root) {
  const dictionary = JSON.parse(await readFile('src/locales/pt-BR/ui.json', 'utf8'));
  const files = [];
  async function walk(dir) {
    for (const item of await readdir(dir, { withFileTypes: true })) {
      const name = path.join(dir, item.name);
      if (item.isDirectory()) {
        if (item.name !== 'locales') await walk(name);
      } else if (/\.tsx?$/.test(name) && !name.endsWith('/workspace.ts')) files.push(name);
    }
  }
  await walk(path.join(root, 'src'));
  for (const file of files) {
    const code = await readFile(file, 'utf8');
    const source = ts.createSourceFile(
      file,
      code,
      ts.ScriptTarget.Latest,
      true,
      file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
    );
    const edits = [];
    function visit(node) {
      const supported =
        ts.isJsxText(node) ||
        ts.isStringLiteral(node) ||
        ts.isNoSubstitutionTemplateLiteral(node) ||
        ts.isTemplateHead(node) ||
        ts.isTemplateMiddle(node) ||
        ts.isTemplateTail(node);
      if (supported) {
        // Keyboard codes and directives are contracts, never translated labels.
        const parent = node.parent;
        const keyboard =
          parent && ts.isBinaryExpression(parent) && /\.key\b/.test(parent.getText(source));
        const value = normalized(node.text);
        let translated = dictionary[value];
        if (
          ts.isStringLiteral(node) &&
          ts.isJsxAttribute(parent) &&
          parent.name.getText(source) === 'lang' &&
          value === 'en'
        )
          translated = 'pt-BR';
        const structural =
          ts.isStringLiteral(node) && (ts.isTypeNode(parent) || /^[a-z]+$/.test(value));
        if (!keyboard && !structural && translated !== undefined && value !== 'use client') {
          let text = translated;
          if (ts.isJsxText(node)) {
            edits.push({
              start: node.getStart(source),
              end: node.end,
              value: `{${JSON.stringify(`${/^\s/.test(node.text) ? ' ' : ''}${text}${/\s$/.test(node.text) ? ' ' : ''}`)}}`,
            });
          } else if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
            edits.push({
              start: node.getStart(source),
              end: node.end,
              value: JSON.stringify(text),
            });
          } else {
            // Preserve spaces between interpolations, but not source indentation.
            text = `${/^\s/.test(node.text) && !/^\n/.test(node.text) ? ' ' : ''}${text}${/\s$/.test(node.text) ? ' ' : ''}`;
            const escaped = JSON.stringify(text)
              .slice(1, -1)
              .replace(/`/g, '\\`')
              .replace(/\$\{/g, '\\${');
            edits.push({
              start: node.getStart(source) + 1,
              end: node.end - (ts.isTemplateTail(node) ? 1 : 2),
              value: escaped,
            });
          }
        }
      }
      ts.forEachChild(node, visit);
    }
    visit(source);
    let output = code;
    for (const edit of edits.sort((a, b) => b.start - a.start))
      output = output.slice(0, edit.start) + edit.value + output.slice(edit.end);
    // Give the small model instructions it understands, while explicitly requesting Portuguese output.
    if (file.endsWith('/browser/local-ai.ts'))
      output = output
        .replace(
          'You are an English reading tutor.',
          'You are a Brazilian Portuguese reading tutor.',
        )
        .replace(
          'Answer in simple English using only',
          'Answer only in simple Brazilian Portuguese using only',
        )
        .replace(
          'one or two short sentences. Then ask one short follow-up question.',
          'one or two short Brazilian Portuguese sentences. Then ask one short question in Portuguese.',
        );
    await writeFile(file, output);
  }
  await cp('src/locales/pt-BR/content.ts', path.join(root, 'src/lib/content.ts'));
  await cp('src/locales/pt-BR/daily-words.ts', path.join(root, 'src/lib/daily-words.ts'));
}
