import { chromium } from 'playwright-core';
import { writeFile } from 'node:fs/promises';
const base = process.argv[2] || 'http://127.0.0.1:3300/plataforma-ingles-uso-personal/';
const destination = process.argv[3] || 'artifacts/redesign/interaction-metrics.json';
const browser = await chromium.launch({
  executablePath: '/usr/bin/chromium',
  args: ['--no-sandbox'],
});
const results = [];
try {
  for (const pt of [false, true])
    for (const [width, height] of [
      [1440, 900],
      [1280, 800],
      [768, 1024],
      [390, 844],
      [375, 812],
    ]) {
      const context = await browser.newContext({ viewport: { width, height } }),
        page = await context.newPage();
      const errors = [];
      page.on('pageerror', (e) => errors.push(e.message));
      await page.goto(base + (pt ? 'portugues/' : ''));
      await page.locator('.today-focus .start-button').waitFor();
      const metrics = await page.evaluate(() => {
        const b = document.querySelector('.start-button').getBoundingClientRect(),
          n = document.querySelector('.mobile-bottom-nav').getBoundingClientRect();
        return {
          readyMs: Math.round(performance.now()),
          paint: performance
            .getEntriesByType('paint')
            .map((p) => ({ name: p.name, ms: Math.round(p.startTime) })),
          button: { top: b.top, bottom: b.bottom },
          navTop: n.height ? n.top : innerHeight,
          startAboveFold: b.top >= 0 && b.bottom <= (n.height ? n.top : innerHeight),
          overflow: document.documentElement.scrollWidth > innerWidth,
        };
      });
      // Explicit instant scrolling avoids measuring halfway through a smooth animation.
      await page
        .locator('.today-completion')
        .evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
      const countClear = await page.evaluate(() => {
        const c = document.querySelector('.today-completion').getBoundingClientRect(),
          n = document.querySelector('.mobile-bottom-nav').getBoundingClientRect();
        return c.bottom <= (n.height ? n.top : innerHeight);
      });
      results.push({
        language: pt ? 'pt-BR' : 'en',
        width,
        height,
        ...metrics,
        countClearAfterScroll: countClear,
        errors,
      });
      await context.close();
    }
  await writeFile(
    destination,
    JSON.stringify(
      {
        checkedAt: new Date().toISOString(),
        scope:
          'Local Chromium, no throttling, temporary profiles. Not hardware mobile or production latency. Start measured at entry; completion text checked after instant scrolling, clear of fixed navigation.',
        results,
      },
      null,
      2,
    ) + '\n',
  );
  const summary = {
    screens: results.length,
    startAboveFold: results.every((r) => r.startAboveFold),
    completionClear: results.every((r) => r.countClearAfterScroll),
    overflows: results.filter((r) => r.overflow).length,
    errors: results.flatMap((r) => r.errors),
  };
  console.log(JSON.stringify(summary));
  if (
    !summary.startAboveFold ||
    !summary.completionClear ||
    summary.overflows ||
    summary.errors.length
  )
    process.exitCode = 1;
} finally {
  await browser.close();
}
