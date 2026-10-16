import explanations from '@/locales/learning/native-explanations.json';
import instructions from '@/locales/learning/native-instructions.json';
import spanishTranslations from '@/locales/learning/native-to-spanish.json';
import classTranslations from '@/locales/learning/class-spanish.json';
import referenceTranslations from '@/locales/learning/reference-spanish.json';
import { isPortuguese } from './workspace';

/** Authored UI copy only: uploaded PDFs and personal writing are not machine translated. */
export const normalizeCopy = (s: string) => s.replace(/\s+/g, ' ').trim();
const copy: Record<string, string[]> = Object.fromEntries(
  [...Object.entries(explanations), ...Object.entries(instructions)].map(([s, v]) => [
    normalizeCopy(s),
    v,
  ]),
);
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const placeholder = /\{\w+\}/g;
const neutral =
  /^(?:(?:[ABC][12])\b|\d+(?:[.,]\d+)?(?:\s*[%/]\s*\d+(?:[.,]\d+)?)?|[\s.,:;!?·/%+—–()]+)/;
const keys = Object.keys(copy)
  .filter((s) => !s.includes('{'))
  .sort((a, b) => b.length - a.length);
const templates = Object.entries(copy)
  // A catch-all template can silently claim that untranslated copy is translated.
  // Require enough authored context, and leave unknown copy visibly unsupported.
  .filter(
    ([s]) => s.includes('{') && s.replace(placeholder, '').replace(/[^\p{L}]/gu, '').length >= 12,
  )
  .map(([source, values]) => {
    const names: string[] = [];
    const parts = source.split(/(\{\w+\})/);
    const pattern = parts
      .map((p) => {
        if (/^\{\w+\}$/.test(p)) {
          names.push(p.slice(1, -1));
          return '(.*?)';
        }
        return escape(p);
      })
      .join('');
    return { pattern: new RegExp('^' + pattern + '$'), names, values, source };
  });

function capturedCopy(value: string, pt: boolean, quoted: boolean, depth: number) {
  // Quoted examples/meanings must keep their source language (e.g. “vaso”).
  if (quoted || !value.trim()) return value;
  const translated = translate(value, pt, depth + 1);
  if (translated === null) return value;
  const left = value.match(/^\s*/)?.[0] || '';
  const right = value.match(/\s*$/)?.[0] || '';
  return left + translated + right;
}
function translate(input: string, pt: boolean, depth = 0): string | null {
  const text = normalizeCopy(input),
    at = pt ? 1 : 0;
  if (!text) return '';
  if (depth > 12) return null;
  if (Object.hasOwn(copy, text)) return copy[text][at];
  for (const t of templates) {
    const match = text.match(t.pattern);
    if (!match) continue;
    const captures = Object.fromEntries(
      t.names.map((name, i) => {
        const position = t.source.indexOf('{' + name + '}');
        const before = t.source[position - 1],
          after = t.source[position + name.length + 2];
        const quoted =
          ['«', '“', '"', '‘'].includes(before) && ['»', '”', '"', '’'].includes(after);
        return [name, capturedCopy(match[i + 1], pt, quoted, depth)];
      }),
    );
    return t.values[at].replace(/\{(\w+)\}/g, (_, name) => captures[name] ?? '');
  }
  // JSX produces combined paragraphs with counters/CEFR bands/punctuation between
  // authored fragments. Translate those fragments, never arbitrary user prose.
  const memo = new Map<number, string | null>();
  function compose(offset: number): string | null {
    if (offset === text.length) return '';
    if (memo.has(offset)) return memo.get(offset)!;
    const remaining = text.slice(offset);
    if (offset > 0) {
      for (const t of templates) {
        const match = remaining.match(t.pattern);
        if (!match) continue;
        const values = Object.fromEntries(
          t.names.map((name, i) => {
            const position = t.source.indexOf('{' + name + '}');
            const before = t.source[position - 1],
              after = t.source[position + name.length + 2];
            const quoted =
              ['«', '“', '\"', '‘'].includes(before) && ['»', '”', '\"', '’'].includes(after);
            return [name, capturedCopy(match[i + 1], pt, quoted, depth)];
          }),
        );
        const result = t.values[at].replace(/\{(\w+)\}/g, (_, name) => values[name] ?? '');
        memo.set(offset, result);
        return result;
      }
    }
    for (const key of keys) {
      if (!remaining.startsWith(key)) continue;
      const last = key.at(-1) || '',
        next = remaining[key.length] || '';
      if (/\p{L}/u.test(last) && /\p{L}/u.test(next)) continue;
      const rest = compose(offset + key.length);
      if (rest !== null) {
        const result = copy[key][at] + rest;
        memo.set(offset, result);
        return result;
      }
    }
    const token = remaining.match(neutral)?.[0];
    if (token) {
      const rest = compose(offset + token.length);
      if (rest !== null) {
        memo.set(offset, token + rest);
        return token + rest;
      }
    }
    memo.set(offset, null);
    return null;
  }
  return compose(0);
}
export function nativeCopy(input: string, pt = isPortuguese): string | null {
  return translate(input, pt);
}
const spanishLookup: Record<string, string> = Object.fromEntries(
  Object.entries({ ...spanishTranslations, ...referenceTranslations, ...classTranslations }).map(
    ([native, es]) => [normalizeCopy(native), es],
  ),
);
export function spanishCopy(input: string, pt = isPortuguese): string | null {
  const text = normalizeCopy(input),
    at = pt ? 1 : 0;
  if (Object.hasOwn(spanishLookup, text)) return spanishLookup[text];
  const found = Object.entries(copy).find(
    ([es, v]) => !es.includes('{') && normalizeCopy(v[at]) === text,
  );
  return found?.[0] || null;
}
