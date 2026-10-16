import { chromium } from 'playwright-core';
import { mkdir, writeFile } from 'node:fs/promises';
const phase = process.argv[2] || 'before';
const origin = process.argv[3] || 'https://alejo02025.github.io/plataforma-ingles-uso-personal/';
const destination = `artifacts/redesign/${phase}`;
await mkdir(destination, { recursive: true });
const live = origin.startsWith('https:');
const cache = new Map();
const browser = await chromium.launch({
  executablePath: '/usr/bin/chromium',
  args: ['--no-sandbox'],
});
const sizes = [
  [1440, 900],
  [1280, 800],
  [1024, 768],
  [768, 1024],
  [390, 844],
  [375, 812],
  [320, 700],
];
const results = [];
const labels = {
  en: [
    'Home',
    'Classes',
    'Vocabulary',
    'PDF Studio',
    'Progress',
    'My Day',
    'Library',
    'Practice',
    'Games',
    'Calendar',
    'News',
    'Language help',
    'Oral practice',
  ],
  pt: [
    'Início',
    'Aulas',
    'Vocabulário',
    'PDF Studio',
    'Progresso',
    'Meu dia',
    'Biblioteca',
    'Praticar',
    'Jogos',
    'Calendário',
    'Notícias',
    'Ajuda com o idioma',
    'Prática oral',
  ],
};
async function capture(page, name, pt, width, height) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    document.activeElement?.blur();
    window.scrollTo(0, 0);
  });
  const measurements = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth > innerWidth,
    documentHeight: document.documentElement.scrollHeight,
    paints: performance
      .getEntriesByType('paint')
      .map((p) => ({ name: p.name, milliseconds: Math.round(p.startTime) })),
    h1: [...document.querySelectorAll('h1')].map((e) => e.textContent),
    visibleButtons: [...document.querySelectorAll('button')].filter(
      (e) => e.getBoundingClientRect().width && e.getBoundingClientRect().height,
    ).length,
  }));
  await page.screenshot({
    path: `${destination}/${pt ? 'pt' : 'en'}-${name}-${width}.png`,
    fullPage: true,
  });
  results.push({ language: pt ? 'pt-BR' : 'en', screen: name, width, height, ...measurements });
}
try {
  for (const pt of [false, true])
    for (const [width, height] of sizes) {
      const context = await browser.newContext({
        viewport: { width, height },
        serviceWorkers: live ? 'block' : 'allow',
      });
      if (live)
        await context.route('https://alejo02025.github.io/**', async (route) => {
          const url = route.request().url();
          let value = cache.get(url);
          if (!value) {
            const response = await fetch(url, {
              headers: { 'Accept-Encoding': 'identity', 'Cache-Control': 'no-cache' },
            });
            const headers = Object.fromEntries(response.headers);
            for (const key of ['content-encoding', 'transfer-encoding', 'content-length'])
              delete headers[key];
            value = {
              status: response.status,
              headers,
              body: Buffer.from(await response.arrayBuffer()),
            };
            cache.set(url, value);
          }
          await route.fulfill(value);
        });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', (e) => errors.push(e.message));
      page.on('console', (message) => {
        if (message.type() === 'error') errors.push(`Console: ${message.text()}`);
      });
      await page.goto(origin + (pt ? 'portugues/' : ''), { timeout: 60000 });
      await page.locator('.app-shell').waitFor({ timeout: 60000 });
      const popup = page.locator('.daily-word-popup');
      if (await popup.isVisible()) await popup.locator('.daily-word-top button').click();
      if (phase === 'before') {
        const names = [
          'today',
          'classes',
          'review',
          'library',
          'progress',
          'activities',
          'readings',
          'practice',
          'games',
          'calendar',
          'news',
          'reference',
          'oral',
        ];
        for (let i = 0; i < labels.en.length; i++) {
          if (i > 4 && ![1440, 390].includes(width)) continue;
          const nav = page.locator('.sidebar nav');
          if (
            (await page.locator('.mobile-menu').isVisible()) &&
            !(await page.locator('.sidebar').getAttribute('class')).includes('mobile-open')
          )
            await page.locator('.mobile-menu').click();
          const extra = nav.locator('.nav-more');
          if (i > 4 && (await extra.getAttribute('open')) === null)
            await extra.locator('summary').click();
          if (i < 5) await nav.locator('.nav-primary button').nth(i).click();
          else
            await nav
              .getByRole('button', { name: (pt ? labels.pt : labels.en)[i], exact: true })
              .click();
          await capture(page, names[i], pt, width, height);
        }
        await page
          .locator('.topbar')
          .getByRole('button', {
            name: pt ? 'Ajuda e preferências' : 'Help and preferences',
            exact: true,
          })
          .click();
        await capture(page, 'settings', pt, width, height);
      } else {
        for (const [i, name] of ['today', 'classes', 'review', 'library', 'progress'].entries()) {
          await page
            .getByRole('navigation', { name: pt ? 'Navegação principal' : 'Main navigation' })
            .filter({ visible: true })
            .getByRole('button')
            .nth(i)
            .click();
          await page
            .locator(
              {
                today: '.today-focus .start-button, .today-finished',
                classes: '.course-toolbar, .course-level-bar',
                review: 'main .empty, .review-card',
                library: '.studio-drop',
                progress: '.progress-week',
              }[name],
            )
            .first()
            .waitFor();
          await capture(page, name, pt, width, height);
        }
        if (phase.startsWith('os3-') || [1440, 390].includes(width)) {
          const visit = async (index, tab) => {
            await page
              .getByRole('navigation', { name: pt ? 'Navegação principal' : 'Main navigation' })
              .filter({ visible: true })
              .getByRole('button')
              .nth(index)
              .click();
            if (tab)
              await page
                .locator('.section-tabs')
                .getByRole('button', { name: tab, exact: true })
                .click();
          };
          const tools = [
            ['readings', 3, pt ? 'Leituras' : 'Readings'],
            ['practice', 2, pt ? 'Prática' : 'Practice'],
            ['games', 2, pt ? 'Jogos' : 'Games'],
            ['calendar', 4, pt ? 'Calendário' : 'Calendar'],
            ['news', 3, pt ? 'Notícias' : 'News'],
            ['reference', 1, pt ? 'Guia de idioma' : 'Language reference'],
            ['oral', 2, pt ? 'Ouvir e gravar' : 'Listen & record'],
          ];
          for (const [name, index, tab] of tools) {
            await visit(index, tab);
            await capture(page, name, pt, width, height);
            if (name === 'reference' && phase.startsWith('os3-')) {
              await page.locator('.toolkit-tabs button').nth(1).click();
              await page.locator('.tense-card').first().locator('summary').click();
              await capture(page, 'reference-tenses', pt, width, height);
              await page.locator('.toolkit-tabs button').nth(2).click();
              await page.locator('.catalog-count').waitFor();
              await page.locator('.verb-entry').first().waitFor();
              await page.locator('.verb-entry').first().locator('summary').first().click();
              await capture(page, 'reference-verbs', pt, width, height);
              const extra = page.locator('.toolkit-extra');
              if ((await extra.getAttribute('open')) === null)
                await extra.locator(':scope > summary').click();
              const quick = extra.getByRole('button', { name: /Quick reference|Consulta rápida/ });
              if (await quick.count()) {
                await quick.click();
                await page.locator('.grammar-reference-entry').first().locator('summary').click();
                await capture(page, 'reference-patterns', pt, width, height);
              } else {
                await page.locator('.toolkit-tabs button').nth(1).click();
                await page.locator('.grammar-reference-entry').first().locator('summary').click();
                await capture(page, 'reference-patterns', pt, width, height);
              }
              await extra
                .getByRole('button', {
                  name: /Study notes|Notes by level|Notas de estudo|Notas por nível/,
                })
                .click();
              await page.locator('.study-notes select').selectOption('C2');
              await page
                .locator('.study-notes .grammar-reference-entry')
                .first()
                .locator('summary')
                .click();
              await capture(page, 'reference-notes', pt, width, height);
            }
          }
          await visit(1);
          await page.locator('.class-card').first().click();
          await page.locator('.lesson-room').waitFor();
          await capture(page, 'lesson', pt, width, height);
        }
        await page
          .getByRole('button', { name: pt ? 'Ajustes' : 'Settings', exact: true })
          .filter({ visible: true })
          .click();
        await capture(page, 'settings', pt, width, height);
      }
      results.push({ language: pt ? 'pt-BR' : 'en', width, errors });
      await context.close();
    }
  await writeFile(
    `${destination}/observations.json`,
    JSON.stringify(
      {
        phase,
        origin,
        live,
        tlsRelay: live
          ? 'Requests retrieved with Node fetch and existing trusted proxy CA; no TLS verification disabled. Browser executes actual public HTML/assets.'
          : null,
        capturedAt: new Date().toISOString(),
        results,
      },
      null,
      2,
    ) + '\n',
  );
  console.log(
    JSON.stringify({
      phase,
      screens: results.filter((r) => r.screen).length,
      errors: results.flatMap((r) => r.errors || []),
      overflows: results.filter((r) => r.overflow).length,
    }),
  );
} finally {
  await browser.close();
}
