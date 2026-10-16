/** Unretouched exercise evidence from the built application, using disposable data. */
import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { makeRoutine } from '../src/lib/routine';
import { ready, go } from '../tests/pages/navigation';
const base = process.argv[2] || 'http://127.0.0.1:3312/plataforma-ingles-uso-personal/';
const destination = 'artifacts/redesign/os3-qa';
await mkdir(destination, { recursive: true });
const browser = await chromium.launch({
  executablePath: '/usr/bin/chromium',
  args: ['--no-sandbox'],
});
const observations: unknown[] = [];
try {
  for (const pt of [false, true])
    for (const [width, height] of [
      [1440, 900],
      [390, 844],
    ]) {
      const context = await browser.newContext({ viewport: { width, height } }),
        page = await context.newPage();
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));
      await page.goto(base + (pt ? 'portugues/' : ''));
      await ready(page);
      await go(page, 'Practice');
      await page.locator('.review-practice .practice-options .activity-row').nth(1).click();
      const room = page.locator('.routine-session');
      const set = makeRoutine('grammar', pt ? 'A1' : 'A2', 0, pt, { edition: 3, variant: 0 });
      const snap = async (name: string) => {
        await page.evaluate(() => document.fonts.ready);
        await page.screenshot({
          path: `${destination}/${pt ? 'pt' : 'en'}-${name}-${width}.png`,
          fullPage: true,
        });
        observations.push({
          language: pt ? 'pt-BR' : 'en',
          screen: name,
          width,
          height,
          overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        });
      };
      for (const [i, q] of set.rounds.entries()) {
        if (q.format === 'tiles') {
          let remainder = q.solution;
          const tokens = [...q.choices];
          while (tokens.length) {
            const token = tokens
              .filter((t) => remainder === t || remainder.startsWith(t + ' '))
              .sort((a, b) => b.length - a.length)[0];
            if (!token) throw Error('No matching token for authored model');
            await room
              .locator('.routine-tiles')
              .getByRole('button', { name: token, exact: true })
              .and(room.locator('button:enabled'))
              .first()
              .click();
            remainder = remainder.slice(token.length).trim();
            tokens.splice(tokens.indexOf(token), 1);
          }
        } else if (q.format === 'choice') {
          await room.getByRole('radio', { name: q.solution, exact: true }).check();
        } else
          await room
            .locator('.exercise-text-answer input')
            .fill(q.format === 'correct' ? q.source! : q.solution);
        await snap(`${i + 1}-${q.format}`);
        await room.getByRole('button', { name: pt ? 'Conferir' : 'Check', exact: true }).click();
        if (q.format === 'correct') await snap('insight-error');
        await room
          .getByRole('button', { name: pt ? 'Continuar' : 'Continue', exact: true })
          .click();
      }
      await room.locator('.routine-finish').waitFor();
      await snap('exercise-summary');
      await room
        .getByRole('button', { name: pt ? 'Voltar ao percurso' : 'Back to the path', exact: true })
        .click();
      await go(page, 'Errors');
      await page.locator('.mistake-entry > summary').first().click();
      await snap('mistake-history');
      if (errors.length) throw Error(errors.join('\n'));
      await context.close();
    }
  await writeFile(
    `${destination}/exercises.json`,
    JSON.stringify(
      {
        checkedAt: new Date().toISOString(),
        origin: base,
        scope:
          'Local Chromium, real UI interactions, disposable profiles; one intentionally incorrect first response, no student data.',
        observations,
      },
      null,
      2,
    ) + '\n',
  );
  console.log(JSON.stringify({ screens: observations.length }));
} finally {
  await browser.close();
}
