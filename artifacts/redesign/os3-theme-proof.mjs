import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import { go, ready } from '../../tests/pages/navigation.ts';
const origin = 'http://127.0.0.1:3312/plataforma-ingles-uso-personal/';
const browser = await chromium.launch({
  executablePath: '/usr/bin/chromium',
  args: ['--no-sandbox'],
});
const records = [];
try {
  for (const pt of [false, true])
    for (const [width, height] of [
      [1440, 900],
      [390, 844],
    ]) {
      const context = await browser.newContext({ viewport: { width, height } }),
        page = await context.newPage();
      const errors = [];
      page.on('pageerror', (e) => errors.push(e.message));
      page.on('console', (e) => {
        if (e.type() === 'error') errors.push(e.text());
      });
      await page.goto(origin + (pt ? 'portugues/' : ''));
      await ready(page);
      await go(page, 'Settings');
      await page.getByLabel(pt ? 'Aparência' : 'Appearance', { exact: true }).selectOption('dark');
      await page
        .getByRole('button', { name: pt ? 'Salvar preferências' : 'Save preferences', exact: true })
        .click();
      await page.locator('html[data-theme="dark"]').waitFor();
      await go(page, 'Home');
      await ready(page);
      await page.evaluate(async () => {
        await document.fonts.ready;
        document.activeElement?.blur();
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      });
      await page.screenshot({
        path: `artifacts/redesign/os3-qa/${pt ? 'pt' : 'en'}-today-dark-${width}.png`,
        fullPage: true,
      });
      records.push({
        language: pt ? 'pt-BR' : 'en',
        width,
        height,
        theme: 'dark',
        savedThroughSettings: true,
        errors,
      });
      if (errors.length) throw Error(errors.join('\n'));
      await context.close();
    }
  await writeFile(
    'artifacts/redesign/os3-qa/themes.json',
    JSON.stringify(
      {
        checkedAt: new Date().toISOString(),
        origin,
        method:
          'Real Settings form and saved profile, disposable Chromium contexts; unretouched screenshots.',
        records,
      },
      null,
      2,
    ) + '\n',
  );
  console.log(
    JSON.stringify({ screens: records.length, errors: records.flatMap((r) => r.errors) }),
  );
} finally {
  await browser.close();
}
