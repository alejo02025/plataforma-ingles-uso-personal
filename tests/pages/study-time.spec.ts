import { test, expect, type Page } from '@playwright/test';
import { go, ready, offlineReady, manifest, finishRoutine } from './navigation';
import { makeRoutine } from '../../src/lib/routine';
for (const pt of [false, true])
  test(`Today's time fits real tasks, preserves a paused exercise offline and isolates profiles (${pt ? 'PT' : 'EN'})`, async ({
    page,
    context,
  }) => {
    test.setTimeout(180000);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(pt ? './portugues/' : './');
    await ready(page);
    await offlineReady(page);
    await go(page, 'Home');
    await page.locator('.today-duration select').selectOption('15');
    await expect(page.locator('.today-duration select')).toHaveValue('15');
    await expect(page.locator('.today-task')).toHaveCount(2);
    await page.locator('.today-task').first().click();
    const modal = page.locator('.routine-session');
    const q = makeRoutine('vocabulary', pt ? 'A1' : 'A2', 0, pt).rounds[0];
    await modal.getByRole('button', { name: q.solution, exact: true }).click();
    await modal.getByRole('button', { name: pt ? 'Conferir' : 'Check', exact: true }).click();
    await modal.getByRole('button', { name: pt ? 'Continuar' : 'Continue', exact: true }).click();
    await modal
      .getByRole('button', { name: pt ? 'Pausar atividade' : 'Pause activity', exact: true })
      .click();
    await expect(page.locator('.today-focus h2')).toHaveText(
      pt ? 'Palavras em contexto' : 'Words in context',
    );
    await page.locator('.today-duration select').selectOption('30');
    await expect(page.locator('.today-duration select')).toHaveValue('30');
    await page.goto(pt ? './' : './portugues/');
    await ready(page);
    await page.locator('.today-duration select').selectOption('45');
    await expect(page.locator('.today-duration select')).toHaveValue('45');
    await page.goto(pt ? './portugues/' : './');
    await ready(page);
    await expect(page.locator('.today-duration select')).toHaveValue('30');
    await context.setOffline(true);
    await page.reload();
    await ready(page);
    await page.locator('.start-button').click();
    await expect(modal.locator('.routine-reading').first()).toContainText(
      makeRoutine('vocabulary', pt ? 'A1' : 'A2', 0, pt).rounds[1].context!,
    );
    await finishRoutine(page, pt, 'vocabulary', 0, 0, 1);
    await modal
      .getByRole('button', { name: pt ? 'Voltar a hoje' : 'Back to today', exact: true })
      .click();
    await expect(page.locator('.today-completion')).toContainText('1');
    await expect(page.locator('.today-focus h2')).not.toContainText(
      pt ? 'Palavras em contexto' : 'Words in context',
    );
  });
test('legacy malformed preference is harmless and a failed agenda transaction retains the old plan and usable Start', async ({
  page,
}) => {
  await page.goto('./');
  await ready(page);
  await page.evaluate(() => localStorage.setItem('study-budget:v1:bad', '{bad json'));
  await page.reload();
  await ready(page);
  await expect(page.locator('.today-duration select')).toHaveValue('20');
  const before = (await manifest(page)).data.activities.find((a: any) =>
    a.id.startsWith('study-day:'),
  ).payload;
  await page.evaluate(() => {
    const original = IDBObjectStore.prototype.put;
    let armed = true;
    IDBObjectStore.prototype.put = function (value, key) {
      if (key === 'manifest' && armed) {
        armed = false;
        IDBObjectStore.prototype.put = original;
        const request = original.call(this, value, key);
        this.transaction.abort();
        return request;
      }
      return original.call(this, value, key);
    };
  });
  await page.locator('.today-duration select').selectOption('30');
  await expect(page.locator('.today-screen [role="alert"]')).toBeVisible();
  await expect(page.locator('.start-button')).toBeEnabled();
  expect(
    (await manifest(page)).data.activities.find((a: any) => a.id.startsWith('study-day:')).payload,
  ).toBe(before);
  await page.reload();
  await ready(page);
  await expect(page.locator('.today-duration select')).toHaveValue('20');
});
test('available time resets next day while the previous daily agenda remains in saved history', async ({
  page,
}) => {
  await page.clock.install({ time: new Date('2026-10-15T18:00:00Z') });
  await page.goto('./');
  await ready(page);
  await page.locator('.today-duration select').selectOption('15');
  await expect(page.locator('.today-duration select')).toHaveValue('15');
  await page.clock.setSystemTime(new Date('2026-10-16T18:00:00Z'));
  await page.reload();
  await ready(page);
  await expect(page.locator('.today-duration select')).toHaveValue('20');
  const saved = await manifest(page);
  expect(saved.data.activities.filter((a: any) => a.id.startsWith('study-day:'))).toHaveLength(2);
  expect(saved.data.profile[0].daily_minutes).toBe(20);
});
