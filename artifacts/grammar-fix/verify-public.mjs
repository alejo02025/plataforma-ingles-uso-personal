import { chromium, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
const base = 'https://alejo02025.github.io/plataforma-ingles-uso-personal/';
const prior = '2026-10-16T17:15:32.067Z';
const output = 'artifacts/grammar-fix';
await mkdir(output, { recursive: true });
const versionResponse = await fetch(base + 'assets/version.json', { cache: 'no-store' });
if (!versionResponse.ok) throw new Error('Cannot read public release');
const version = await versionResponse.json();
if (version.build === prior) throw new Error('The old release is still published');
const resources = new Map();
const browser = await chromium.launch({
  executablePath: '/usr/bin/chromium',
  args: ['--no-sandbox'],
});
const evidence = [];
try {
  for (const pt of [false, true]) {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      serviceWorkers: 'block',
    });
    // Relay original public responses through the environment's TLS-verified fetch.
    await context.route('https://alejo02025.github.io/**', async (route) => {
      const url = route.request().url();
      if (!resources.has(url)) {
        const response = await fetch(url, {
          headers: { 'Cache-Control': 'no-cache', 'Accept-Encoding': 'identity' },
        });
        if (!response.ok) throw new Error(`Public resource failed: ${response.status} ${url}`);
        const headers = Object.fromEntries(response.headers);
        for (const key of ['content-encoding', 'content-length', 'transfer-encoding'])
          delete headers[key];
        resources.set(url, {
          status: response.status,
          headers,
          body: Buffer.from(await response.arrayBuffer()),
        });
      }
      await route.fulfill(resources.get(url));
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    const guide = async () => {
      await page.locator('.today-focus .start-button, .today-finished').waitFor();
      await page
        .locator('.sidebar .nav-primary:visible button, .mobile-bottom-nav:visible button')
        .nth(1)
        .click();
      await page
        .locator('.section-tabs')
        .getByRole('button', { name: pt ? 'Guia de idioma' : 'Language reference', exact: true })
        .click();
    };
    await page.goto(base + (pt ? 'portugues/' : ''));
    await guide();
    await expect(page.locator('.builder-label-es').first()).toHaveText('Tiempo verbal');
    await expect(page.locator('.builder-label-es').nth(1)).toHaveText(
      'Afirmativa, negativa o pregunta',
    );
    const time = page.getByLabel(pt ? 'Escolher um tempo' : 'Choose a time');
    const kind = page.getByLabel(pt ? 'Escolher um tipo de frase' : 'Choose a sentence type');
    const verb = page.getByLabel(pt ? 'Escolher um verbo' : 'Choose a verb');
    const subject = page.getByLabel(pt ? 'Escolher um sujeito' : 'Choose a subject');
    await time.selectOption('past');
    await kind.selectOption('negative');
    await verb.selectOption(pt ? 'pagar' : 'study');
    await subject.selectOption(pt ? 'eu' : 'she');
    await expect(page.locator('.foundation-model h3')).toHaveText(
      pt ? 'Eu não paguei a conta.' : 'She did not study English.',
    );
    const past = await page.locator('.foundation-model h3').innerText();
    if (pt) {
      await kind.selectOption('statement');
      await expect(page.locator('.foundation-model h3')).toHaveText('Eu paguei a conta.');
      await page.locator('.foundation-model').scrollIntoViewIfNeeded();
      await page.screenshot({ path: `${output}/public-after-pt-past-390.png` });
    }
    await kind.selectOption('question');
    if (pt) {
      await verb.selectOption('construir');
      await time.selectOption('imperfect');
      await subject.selectOption('nos');
      await expect(page.locator('.foundation-model h3')).toHaveText('Nós construíamos uma casa?');
    } else {
      await time.selectOption('present-perfect');
      await expect(page.locator('.foundation-model h3')).toHaveText('Has she studied English?');
      await expect(page.locator('.builder-structure > p[lang="en"]')).toHaveText(
        'has + subject + past participle + complement + ?',
      );
      await time.selectOption('imperative');
      await subject.selectOption('we');
      await kind.selectOption('negative');
      await expect(page.locator('.foundation-model h3')).toHaveText("Let's not study English.");
      await expect(page.locator('.builder-structure > p[lang="en"]')).toHaveText(
        "let's + not + base verb + complement",
      );
      await page.locator('.foundation-model').scrollIntoViewIfNeeded();
      await page.screenshot({ path: `${output}/public-after-en-imperative-390.png` });
      await time.selectOption('present-perfect');
      await subject.selectOption('she');
      await kind.selectOption('question');
    }
    const model = await page.locator('.foundation-model h3').innerText();
    await page.reload();
    await guide();
    await expect(page.locator('.foundation-model h3')).toHaveText(model);
    for (const width of [375, 390, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      await page.evaluate(() => {
        document.activeElement?.blur();
        window.scrollTo({ top: 0, behavior: 'instant' });
      });
      await page.screenshot({
        path: `${output}/public-${pt ? 'pt' : 'en'}-${width}.png`,
        fullPage: true,
      });
    }
    expect(errors).toEqual([]);
    evidence.push({
      language: pt ? 'pt-BR' : 'en',
      past,
      savedModel: model,
      reloadPreserved: true,
      widths: [375, 390, 1440],
      errors,
    });
    await context.close();
  }
} finally {
  await browser.close();
}
const result = {
  checkedAt: new Date().toISOString(),
  base,
  priorBuild: prior,
  publicBuild: version.build,
  method:
    'Original public HTML/assets relayed through TLS-verified fetch; disposable Chromium profiles; public workers blocked. Offline/update behavior tested separately by local Playwright.',
  evidence,
};
await writeFile(`${output}/public-verification.json`, JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result));
