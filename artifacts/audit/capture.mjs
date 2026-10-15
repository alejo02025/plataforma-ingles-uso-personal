import { chromium } from 'playwright-core';
import { writeFile } from 'node:fs/promises';
const browser = await chromium.launch({
  executablePath: '/usr/bin/chromium',
  args: ['--no-sandbox'],
});
const phase = process.argv[2] || 'after';
if (!['before', 'after'].includes(phase)) throw new Error('Expected before or after');
const origin = process.argv[3] || 'http://127.0.0.1:3201';
const results = [];
for (const pt of [false, true])
  for (const width of [375, 390, 768, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await context.newPage();
    let errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    const start = Date.now();
    await page.goto(`${origin}/plataforma-ingles-uso-personal/${pt ? 'portugues/' : ''}`);
    await page.locator('.app-shell').waitFor({ timeout: 60000 });
    const daily = page.getByRole('dialog', { name: pt ? 'Palavra do dia' : 'Word of the Day' });
    if (await daily.isVisible())
      await daily
        .getByRole('button', {
          name: pt ? 'Fechar palavra do dia' : 'Close daily word',
          exact: true,
        })
        .click();
    const tutorial = page.getByRole('button', {
      name: pt ? 'Explorar meu dia' : 'Explore my day',
      exact: true,
    });
    if (await tutorial.isVisible()) await tutorial.click();
    await page.evaluate(() => {
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    });
    await page.screenshot({
      path: `artifacts/audit/${phase}/${pt ? 'pt' : 'en'}-${width}.png`,
      fullPage: true,
    });
    results.push({
      language: pt ? 'pt' : 'en',
      width,
      readyMs: Date.now() - start,
      errors,
      ...(await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth,
        headingCount: document.querySelectorAll('h1').length,
        buttonsWithoutName: [...document.querySelectorAll('button')].filter(
          (e) =>
            !e.textContent?.trim() && !e.getAttribute('aria-label') && !e.getAttribute('title'),
        ).length,
        resources: performance.getEntriesByType('resource').map((e) => ({
          name: e.name.split('/').slice(-1)[0],
          durationMs: Math.round(e.duration),
          transferSize: e.transferSize,
        })),
        navigation: performance.getEntriesByType('navigation').map((e) => ({
          domContentLoadedMs: Math.round(e.domContentLoadedEventEnd),
          loadMs: Math.round(e.loadEventEnd),
        })),
      }))),
    });
    await context.close();
  }
await writeFile(`artifacts/audit/${phase}/measurements.json`, JSON.stringify(results, null, 2));
await browser.close();
console.log(
  JSON.stringify(
    results.map(({ resources, ...r }) => r),
    null,
    2,
  ),
);
