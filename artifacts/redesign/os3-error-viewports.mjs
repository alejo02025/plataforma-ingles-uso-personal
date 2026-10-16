/** Real saved error across every requested viewport; no injected learning evidence. */
import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { ready, go, finishRoutine } from '../../tests/pages/navigation.ts';
const origin = process.argv[2] || 'http://127.0.0.1:3312/plataforma-ingles-uso-personal/';
const destination = process.argv[3] || 'artifacts/redesign/os3-qa';
await mkdir(destination, { recursive: true });
const browser = await chromium.launch({
  executablePath: '/usr/bin/chromium',
  args: ['--no-sandbox'],
});
const observations = [],
  resources = new Map();
try {
  for (const pt of [false, true]) {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      serviceWorkers: origin.startsWith('https:') ? 'block' : 'allow',
    });
    if (origin.startsWith('https:'))
      await context.route('https://alejo02025.github.io/**', async (route) => {
        const url = route.request().url();
        let response = resources.get(url);
        if (!response) {
          const r = await fetch(url, {
            headers: { 'Cache-Control': 'no-cache', 'Accept-Encoding': 'identity' },
          });
          const headers = Object.fromEntries(r.headers);
          for (const name of ['content-encoding', 'content-length', 'transfer-encoding'])
            delete headers[name];
          response = { status: r.status, headers, body: Buffer.from(await r.arrayBuffer()) };
          resources.set(url, response);
        }
        await route.fulfill(response);
      });
    const page = await context.newPage(),
      errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (e) => {
      if (e.type() === 'error') errors.push(e.text());
    });
    await page.goto(origin + (pt ? 'portugues/' : ''));
    await ready(page);
    await go(page, 'Practice');
    await page.locator('.review-practice .practice-options .activity-row').nth(1).click();
    await finishRoutine(page, pt, 'grammar', 0, 2);
    await page
      .locator('.routine-session')
      .getByRole('button', { name: pt ? 'Voltar ao percurso' : 'Back to the path', exact: true })
      .click();
    await go(page, 'Errors');
    await page.locator('.mistake-entry > summary').first().click();
    for (const [width, height] of [
      [320, 700],
      [375, 812],
      [390, 844],
      [768, 1024],
      [1024, 768],
      [1280, 800],
      [1440, 900],
    ]) {
      await page.setViewportSize({ width, height });
      await page.evaluate(async () => {
        await document.fonts.ready;
        document.activeElement?.blur();
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
      await page.screenshot({
        path: `${destination}/${pt ? 'pt' : 'en'}-errors-${width}.png`,
        fullPage: true,
      });
      observations.push({
        language: pt ? 'pt-BR' : 'en',
        width,
        height,
        overflow,
        errors: [...errors],
      });
      if (overflow || errors.length) throw Error('Error notebook viewport failed');
    }
    await context.close();
  }
  await writeFile(
    `${destination}/errors-viewports.json`,
    JSON.stringify(
      {
        checkedAt: new Date().toISOString(),
        origin,
        method:
          'Actual grammar submission with one wrong gap response; saved error opened through Review. Disposable data; no student history modified. Public TLS relay does not disable verification; public SW blocked and tested separately locally.',
        observations,
      },
      null,
      2,
    ) + '\n',
  );
  console.log(
    JSON.stringify({ screens: observations.length, errors: observations.flatMap((r) => r.errors) }),
  );
} finally {
  await browser.close();
}
