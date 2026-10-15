import { go, dailyWord, ready } from './navigation';
import { test, expect, type Page } from '@playwright/test';
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { englishClasses, portugueseClasses } from '../../src/locales/lessons/catalog';
import { tables } from '../../src/lib/browser/merge';
import { makePdf } from '../pdf-fixture';

async function enter(page: Page, pt = false) {
  await page.goto(pt ? './portugues/' : './');
  await expect(page.locator('.app-shell')).toBeVisible();
  const popup = page.getByRole('dialog', { name: pt ? 'Palavra do dia' : 'Word of the Day' });
  if (await popup.isVisible())
    await popup
      .getByRole('button', { name: pt ? 'Fechar palavra do dia' : 'Close daily word' })
      .click();
  const tutorial = page.getByRole('button', {
    name: pt ? 'Explorar meu dia' : 'Explore my day',
    exact: true,
  });
  if (await tutorial.isVisible()) await tutorial.click();
}
function nav(page: Page, pt: boolean) {
  return page.getByRole('navigation', { name: pt ? 'Navegação principal' : 'Main navigation' });
}
// A valid SQLite history is seeded only inside a disposable Playwright context.
// It represents prior course checkpoints, never a production unlock mechanism.
async function historyFixture(page: Page, pt: boolean, active: 'A2' | 'B1' | 'B2', errors = false) {
  const bytes = await page.evaluate(
    async (name) => {
      return new Promise<number[]>((resolve, reject) => {
        const opening = indexedDB.open(name, 1);
        opening.onsuccess = () => {
          const db = opening.result;
          const request = db.transaction('values').objectStore('values').get('database');
          request.onsuccess = () => {
            resolve(Array.from(request.result as Uint8Array));
            db.close();
          };
          request.onerror = () => reject(request.error);
        };
        opening.onerror = () => reject(opening.error);
      });
    },
    pt ? 'portuguese-os-private-v1' : 'english-os-private-v1',
  );
  const directory = mkdtempSync(path.join(tmpdir(), 'audit-fixture-'));
  const file = path.join(directory, 'fixture.sqlite');
  writeFileSync(file, Buffer.from(bytes));
  const db = new DatabaseSync(file);
  const now = new Date().toISOString();
  const prior = pt ? ['A1'] : active === 'B2' ? ['A2', 'B1'] : ['A2'];
  for (const level of prior)
    db.prepare('INSERT OR IGNORE INTO course_checkpoints VALUES(?,?,?)').run(
      `level:${level}`,
      level,
      now,
    );
  if (errors) {
    const lesson = (pt ? portugueseClasses : englishClasses).find((l) => l.level === active)!;
    const planId = db.prepare('SELECT id FROM plans ORDER BY created_at DESC LIMIT 1').get()!.id;
    for (let i = 0; i < 2; i++) {
      const id = `class:audit-grammar-${i}`;
      const answers = JSON.stringify({
        lessonId: lesson.id,
        revision: 1,
        responses: lesson.checks.map((q) => (q.answer + 1) % q.options.length),
        feedback: [],
        practice: '',
      });
      db.prepare(
        'INSERT INTO activities(id,plan_id,kind,title,minutes,payload,completed_at) VALUES(?,?,?,?,?,?,?)',
      ).run(id, planId, 'grammar', lesson.title, 5, '{}', now);
      db.prepare(
        'INSERT INTO sessions(id,activity_id,started_at,ended_at,active_seconds) VALUES(?,?,?,?,?)',
      ).run(`session-${i}`, id, now, now, 20);
      db.prepare(
        'INSERT INTO results(id,activity_id,session_id,skill,correct,total,answers,completed_at,day) VALUES(?,?,?,?,?,?,?,?,?)',
      ).run(
        `result-${i}`,
        id,
        `session-${i}`,
        'grammar',
        0,
        lesson.checks.length,
        answers,
        now,
        now.slice(0, 10),
      );
    }
  }
  const manifest = {
    version: 1,
    workspace: pt ? 'pt' : 'en',
    data: Object.fromEntries(tables.map((t) => [t, db.prepare(`SELECT * FROM ${t}`).all()])),
  };
  expect(db.prepare('PRAGMA integrity_check').get()!.integrity_check).toBe('ok');
  db.close();
  const exported = Array.from(readFileSync(file));
  rmSync(directory, { recursive: true });
  await page.evaluate(
    async ({ name, exported, manifest }) => {
      await new Promise<void>((resolve, reject) => {
        const opening = indexedDB.open(name, 1);
        opening.onsuccess = () => {
          const db = opening.result,
            tx = db.transaction('values', 'readwrite');
          tx.objectStore('values').put(new Uint8Array(exported), 'database');
          tx.objectStore('values').put(manifest, 'manifest');
          tx.oncomplete = () => {
            db.close();
            resolve();
          };
          tx.onerror = () => reject(tx.error);
        };
      });
    },
    { name: pt ? 'portuguese-os-private-v1' : 'english-os-private-v1', exported, manifest },
  );
  await page.reload();
  await expect(page.locator('.app-shell')).toBeVisible();
}

for (const pt of [false, true])
  test(`Integral: new ${pt ? 'Portuguese A1' : 'English A2'} across four screen widths`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await enter(page, pt);
    for (const width of [375, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('[data-study-copy="missing"]:visible')).toHaveCount(0);
      const unnamed = await page
        .locator('button:visible')
        .evaluateAll(
          (buttons) =>
            buttons.filter(
              (b) =>
                !b.textContent?.trim() && !b.getAttribute('aria-label') && !b.getAttribute('title'),
            ).length,
        );
      expect(unnamed).toBe(0);
      await page.evaluate(() => {
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
      });
      await page.screenshot({
        path: `artifacts/redesign/qa/${pt ? 'pt' : 'en'}-${width}.png`,
        fullPage: true,
      });
    }
    await page.keyboard.press('Tab');
    expect(await page.evaluate(() => document.activeElement !== document.body)).toBe(true);
    await go(page, pt ? 'Aulas' : 'Classes');
    await expect(
      page.getByLabel(pt ? 'Nível de estudo' : 'Study level', { exact: true }),
    ).toHaveValue(pt ? 'A1' : 'A2');
    expect(errors).toEqual([]);
  });

for (const [pt, active, errors] of [
  [false, 'B1', true],
  [false, 'B2', false],
  [true, 'A2', false],
] as const)
  test(`Integral: ${pt ? 'Portuguese' : 'English'} ${active}${errors ? ' with repeated grammar errors' : ' preserves prior checkpoints'}`, async ({
    page,
  }) => {
    await enter(page, pt);
    await historyFixture(page, pt, active, errors);
    await go(page, pt ? 'Aulas' : 'Classes');
    await expect(
      page.getByLabel(pt ? 'Nível de estudo' : 'Study level', { exact: true }),
    ).toHaveValue(active);
    if (errors) {
      await page.locator('.course-requirements > summary').click();
      await expect(page.locator('[data-requirement="reinforce:grammar"]').first()).toBeVisible();
    }
    await page.reload();
    await go(page, pt ? 'Aulas' : 'Classes');
    await expect(
      page.getByLabel(pt ? 'Nível de estudo' : 'Study level', { exact: true }),
    ).toHaveValue(active);
  });

test('Integral: multiple PDFs, deletion, restoration and language isolation', async ({ page }) => {
  await enter(page);
  await go(page, 'PDF Studio');
  await page.getByLabel('Upload PDFs').setInputFiles([
    {
      name: 'Audit travel.pdf',
      mimeType: 'application/pdf',
      buffer: makePdf([
        'Passengers check the timetable before buying a train ticket. They arrive early because the next train leaves at nine.',
      ]),
    },
    {
      name: 'Audit coffee.pdf',
      mimeType: 'application/pdf',
      buffer: makePdf([
        'Maria orders a coffee and asks for the receipt at the cafe. She pays with a card before leaving for work.',
      ]),
    },
  ]);
  await expect(page.getByRole('tablist', { name: 'Saved PDFs' }).getByRole('tab')).toHaveCount(2);
  await page.getByRole('button', { name: 'Move Audit coffee to Trash', exact: true }).click();
  await expect(page.getByRole('tablist', { name: 'Saved PDFs' }).getByRole('tab')).toHaveCount(1);
  await page.locator('.studio-trash summary').click();
  await page
    .locator('.studio-trash-row')
    .filter({ hasText: 'Audit coffee' })
    .getByRole('button', { name: 'Restore', exact: true })
    .click();

  await expect(page.getByRole('tablist', { name: 'Saved PDFs' }).getByRole('tab')).toHaveCount(2);
  await enter(page, true);
  await go(page, 'Estúdio de PDFs');
  await expect(page.getByRole('tab', { name: /Audit/ })).toHaveCount(0);
  await page.goto('./');
  await go(page, 'PDF Studio');
  await expect(page.getByRole('tablist', { name: 'Saved PDFs' }).getByRole('tab')).toHaveCount(2);
});

test('Integral: failed GitHub authorization retains local data and forgets credentials', async ({
  page,
}) => {
  await page.route('https://api.github.com/**', (route) =>
    route.fulfill({ status: 401, json: { message: 'Bad credentials' } }),
  );
  await enter(page);
  await go(page, 'Settings');
  await page.getByLabel('GitHub token').fill('audit-fake-token-never-real');
  await page.getByRole('button', { name: 'Connect GitHub', exact: true }).click();
  await expect(page.locator('p[role="alert"]')).toContainText(/Authorization|authorization/);
  await page.reload();
  await go(page, 'Settings');
  await expect(page.getByLabel('GitHub token')).toHaveValue('');
  expect(
    await page.evaluate(() => JSON.stringify(localStorage).includes('audit-fake-token-never-real')),
  ).toBe(false);
});

for (const pt of [false, true])
  test(`Integral: unfinished ${pt ? 'PT' : 'EN'} sentence resumes offline without losing its tiles`, async ({
    page,
    context,
  }) => {
    test.setTimeout(180000);
    await enter(page, pt);
    await go(page, 'Settings');
    await expect(page.locator('.offline-status summary')).toContainText(
      pt ? 'Pronto sem conexão' : 'Ready offline',
      { timeout: 90000 },
    );
    await go(page, 'Practice');
    await page.locator('.review-practice .activity-row').nth(1).click();
    const modal = page.locator('.routine-session');
    await modal.locator('.routine-tiles button').first().click();
    await expect(modal.locator('.routine-answer button')).toHaveCount(1);
    await modal
      .getByRole('button', { name: pt ? 'Pausar atividade' : 'Pause activity', exact: true })
      .click();
    await context.setOffline(true);
    await page.reload();
    await go(page, 'Practice');
    await page.locator('.review-practice .activity-row').nth(1).click();
    await expect(modal.locator('.routine-answer button')).toHaveCount(1);
    await page
      .locator('.routine-session')
      .getByRole('button', { name: pt ? 'Pausar atividade' : 'Pause activity', exact: true })
      .click();
    await go(page, 'Settings');
    await expect(page.locator('.offline-status summary')).toContainText(
      pt ? 'Sem conexão' : 'Offline',
    );
  });

for (const pt of [false, true])
  test(`Integral: ${pt ? 'PT' : 'EN'} light and dark text tokens meet normal-text contrast`, async ({
    page,
  }) => {
    await enter(page, pt);
    expect(
      await page
        .locator('html')
        .evaluate((el) => getComputedStyle(el).getPropertyValue('--bg').trim()),
    ).toBe('#f6f7f9');
    const measure = () =>
      page.evaluate(() => {
        const style = getComputedStyle(document.documentElement);
        function luminance(hex: string) {
          let cleaned = hex.trim().replace('#', '');
          if (cleaned.length === 3) cleaned = [...cleaned].map((c) => c + c).join('');
          const rgb = [0, 2, 4]
            .map((i) => parseInt(cleaned.slice(i, i + 2), 16) / 255)
            .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
          return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
        }
        const surface = luminance(style.getPropertyValue('--surface'));
        return ['--text', '--muted'].map((token) => {
          const foreground = luminance(style.getPropertyValue(token));
          return {
            token,
            ratio: (Math.max(surface, foreground) + 0.05) / (Math.min(surface, foreground) + 0.05),
          };
        });
      });
    for (const result of await measure())
      expect(result.ratio, result.token).toBeGreaterThanOrEqual(4.5);
    await go(page, 'Settings');
    await page.getByLabel(pt ? 'Aparência' : 'Appearance', { exact: true }).selectOption('dark');
    await page
      .getByRole('button', { name: pt ? 'Salvar preferências' : 'Save preferences', exact: true })
      .click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    for (const result of await measure())
      expect(result.ratio, result.token).toBeGreaterThanOrEqual(4.5);
    await page.screenshot({
      path: `artifacts/redesign/qa/${pt ? 'pt' : 'en'}-dark-1440.png`,
      fullPage: true,
    });
  });
