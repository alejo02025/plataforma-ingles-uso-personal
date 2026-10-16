/** Execute real public HTML/assets with TLS-verified relay, using disposable browser data. */
import { chromium } from 'playwright-core';
import { strict as assert } from 'node:assert';
import { mkdir, writeFile } from 'node:fs/promises';
import { englishClasses, portugueseClasses } from '../../src/locales/lessons/catalog';
const base = 'https://alejo02025.github.io/plataforma-ingles-uso-personal/';
const phase = process.argv[2] || 'published';
const output = `artifacts/redesign/${phase}`;
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  executablePath: '/usr/bin/chromium',
  args: ['--no-sandbox'],
});
const evidence: unknown[] = [];
const resources = new Map<
  string,
  { status: number; headers: Record<string, string>; body: Buffer }
>();
try {
  for (const pt of [false, true]) {
    const context = await browser.newContext({
      viewport: { width: pt ? 390 : 1440, height: pt ? 844 : 900 },
      serviceWorkers: 'block',
    });
    await context.route('https://alejo02025.github.io/**', async (route) => {
      const url = route.request().url();
      let value = resources.get(url);
      if (!value) {
        const response = await fetch(url, {
          headers: { 'Cache-Control': 'no-cache', 'Accept-Encoding': 'identity' },
        });
        const headers = Object.fromEntries(response.headers);
        for (const key of ['content-encoding', 'content-length', 'transfer-encoding'])
          delete headers[key];
        value = {
          status: response.status,
          headers,
          body: Buffer.from(await response.arrayBuffer()),
        };
        resources.set(url, value);
      }
      await route.fulfill(value);
    });
    const page = await context.newPage();
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    const nav = () => page.locator('.sidebar .nav-primary:visible, .mobile-bottom-nav:visible');
    const progress = async () => {
      await page
        .locator('.today-completion')
        .filter({ hasText: pt ? '1 de 4' : '1 of 4' })
        .waitFor();
    };
    const lesson = (pt ? portugueseClasses : englishClasses).filter(
      (c) => c.level === (pt ? 'A1' : 'A2'),
    )[0];
    await page.goto(base + (pt ? 'portugues/' : ''), { timeout: 60000 });
    await page
      .locator('.today-completion')
      .filter({ hasText: pt ? '0 de 4' : '0 of 4' })
      .waitFor();
    await page.locator('.start-button').click();
    await page
      .getByRole('button', { name: pt ? 'Começar a prática' : 'Start the practice', exact: true })
      .click();
    for (const [index, question] of lesson.checks.entries()) {
      await page.locator(`.lesson-check input[value="${question.answer}"]`).check();
      await page
        .getByRole('button', {
          name: pt ? 'Conferir esta resposta' : 'Check this answer',
          exact: true,
        })
        .click();
      await page
        .getByRole('button', {
          name:
            index + 1 < lesson.checks.length
              ? pt
                ? 'Próxima pergunta'
                : 'Next question'
              : pt
                ? 'Aplicar à sua vida'
                : 'Apply it to your life',
          exact: true,
        })
        .click();
    }
    await page
      .getByLabel(pt ? 'Sua prática da aula' : 'Your class practice')
      .fill(
        pt
          ? 'Eu estudo de manhã e trabalho à tarde.'
          : 'I study in the morning and work in the afternoon.',
      );
    await page
      .getByRole('button', {
        name: pt ? 'Conferir e salvar minha aula' : 'Check and save my class',
        exact: true,
      })
      .click();
    await page.locator('.lesson-saved').waitFor();
    await nav().getByRole('button').nth(0).click();
    await progress();
    await page.reload();
    await progress();
    await page.screenshot({
      path: `${output}/${pt ? 'pt' : 'en'}-saved-class.png`,
      fullPage: true,
    });
    await page.locator('.language-switcher a:not([aria-current])').click();
    await page
      .locator('.today-completion')
      .filter({ hasText: pt ? '0 of 4' : '0 de 4' })
      .waitFor();
    await page.locator('.language-switcher a:not([aria-current])').click();
    await progress();
    await nav().getByRole('button').nth(1).click();
    await page.locator('.class-card').nth(1).click();
    await page.locator('.lesson-heading h2').waitFor();
    const nextTitle = await page.locator('.lesson-heading h2').textContent();
    assert.notEqual(nextTitle, lesson.title);
    assert.deepEqual(errors, []);
    evidence.push({
      language: pt ? 'pt-BR' : 'en',
      startedFromToday: true,
      completedClass: lesson.id,
      countAfterSave: 1,
      retainedAfterReload: true,
      otherLanguageCount: 0,
      usedVisibleLanguageSelector: true,
      retainedAfterLanguageRoundTrip: true,
      nextClassTitle: nextTitle,
      pageErrors: errors,
    });
    await context.close();
  }
  await writeFile(
    `artifacts/redesign/${phase}-journey.json`,
    JSON.stringify(
      {
        checkedAt: new Date().toISOString(),
        base,
        disposableBrowserProfiles: true,
        serviceWorkers: 'blocked for TLS relay; offline/update verified separately',
        results: evidence,
      },
      null,
      2,
    ) + '\n',
  );
  console.log(JSON.stringify({ publicJourneysPassed: evidence.length }));
} finally {
  await browser.close();
}
