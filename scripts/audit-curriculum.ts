import { writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { englishClasses, portugueseClasses } from '../src/locales/lessons/catalog';
const issues: string[] = [];
const languages = Object.entries({ en: englishClasses, 'pt-BR': portugueseClasses }).map(
  ([language, lessons]) => {
    const ids = new Set<string>();
    for (const lesson of lessons) {
      if (ids.has(lesson.id)) issues.push(`${language}: duplicate ${lesson.id}`);
      ids.add(lesson.id);
      if (
        !lesson.goal.trim() ||
        !lesson.explanation.trim() ||
        !lesson.pattern.trim() ||
        !lesson.practice.trim() ||
        !lesson.examples.length
      )
        issues.push(`${language}: incomplete lesson ${lesson.id}`);
      for (const [i, q] of lesson.checks.entries()) {
        if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.options.length)
          issues.push(`${language}: invalid answer ${lesson.id}:${i}`);
        if (new Set(q.options).size !== q.options.length)
          issues.push(`${language}: duplicate options ${lesson.id}:${i}`);
        if (!q.why.trim() || !q.correction.trim() || !q.prompt.trim())
          issues.push(`${language}: missing feedback ${lesson.id}:${i}`);
      }
    }
    return {
      language,
      classes: lessons.length,
      checks: lessons.reduce((n, l) => n + l.checks.length, 0),
      levels: Object.fromEntries(
        ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((band) => [
          band,
          lessons.filter((l) => l.level === band).length,
        ]),
      ),
      manuallyInspected: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(
        (band) => lessons.find((l) => l.level === band)!.id,
      ),
    };
  },
);
const report = {
  checkedAt: new Date().toISOString(),
  scope:
    'Structural checks on every class; manual review limited to the twelve listed samples. This is not complete semantic validation or CEFR course accreditation.',
  languages,
  issues,
};
const destination = process.argv[2] || 'artifacts/redesign/pedagogy.json';
await mkdir(dirname(destination), { recursive: true });
await writeFile(destination, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report));
if (issues.length) process.exitCode = 1;
