import { test, expect, type Page } from '@playwright/test';
import { makeRoutine } from '../../src/lib/routine';

async function enter(page: Page, pt: boolean) {
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
async function time(page: Page, _pt: boolean, minutes: number) {
  await page.locator('.today-duration select').selectOption(String(minutes));
}
for (const pt of [false, true])
  test(`Today's time changes the recommendation, preserves a paused exercise offline and isolates profiles (${pt ? 'PT' : 'EN'})`, async ({
    page,
    context,
  }) => {
    test.setTimeout(120000);
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.setViewportSize({ width: 390, height: 844 });
    await enter(page, pt);
    const main = page.locator('.audit-continue');
    await expect(main.locator('.today-focus-meta span:last-child')).toContainText('8 min');
    await time(page, pt, 5);
    await expect(main.locator('h2')).toHaveText(
      pt ? 'Descubra palavras em contexto' : 'Discover words in context',
    );
    await expect(main.locator('p')).toContainText(pt ? 'pausa curta' : 'short break');
    await expect(main.locator('.today-focus-meta span:last-child')).toContainText('5 min');
    await page.locator('.today-duration select').blur();
    await page.evaluate(() => {
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
      window.scrollTo(0, 0);
    });
    await page.screenshot({
      path: `artifacts/audit/after/time-${pt ? 'pt' : 'en'}-390.png`,
      fullPage: true,
    });
    await expect(page.locator('.today-duration select')).toHaveValue('5');
    await main
      .getByRole('button', { name: pt ? 'Começar' : 'Start', exact: true })
      .click();
    const dialog = page.getByRole('dialog', { name: pt ? 'Atividade guiada' : 'Guided activity' });
    const rounds = makeRoutine('vocabulary', pt ? 'A1' : 'A2', 0, pt).rounds;
    const respond = async (index: number) => {
      await dialog.getByRole('button', { name: rounds[index].solution, exact: true }).click();
      await dialog.getByRole('button', { name: pt ? 'Conferir' : 'Check', exact: true }).click();
      await dialog
        .getByRole('button', { name: pt ? 'Continuar' : 'Continue', exact: true })
        .click();
    };
    const pause = () =>
      dialog
        .getByRole('button', { name: pt ? 'Pausar atividade' : 'Pause activity', exact: true })
        .click();
    await respond(0);
    await pause();
    await expect(main).toContainText(pt ? 'Você pausou' : 'You paused');
    await time(page, pt, 20);
    await expect(main).toContainText(pt ? 'Você pausou' : 'You paused');
    await enter(page, !pt);
    await time(page, !pt, 40);
    await enter(page, pt);
    await expect(page.locator('.today-duration select')).toHaveValue('20');
    await expect(main).toContainText(pt ? 'Você pausou' : 'You paused');
    await expect(page.locator('.offline-status summary')).toContainText(
      pt ? 'Pronto sem conexão' : 'Ready offline',
      { timeout: 90000 },
    );
    await context.setOffline(true);
    await page.reload();
    await expect(main).toContainText(pt ? 'Você pausou' : 'You paused');
    await expect(page.locator('.today-duration select')).toHaveValue('20');
    await main
      .getByRole('button', { name: pt ? 'Começar' : 'Start', exact: true })
      .click();
    await expect(dialog.locator('.routine-reading').first()).toContainText(rounds[1].context!);
    for (let index = 1; index < rounds.length; index++) await respond(index);
    await expect(dialog.locator('.routine-finish')).toContainText('Guardado en tu progreso.');
    await expect(dialog.locator('.routine-score')).toHaveText('6 / 6');
    await dialog
      .getByRole('button', { name: pt ? 'Voltar ao percurso' : 'Back to the path', exact: true })
      .click();
    await expect(main).not.toContainText(pt ? 'Você pausou' : 'You paused');
    await expect(main.locator('.today-focus-meta span:last-child')).toContainText('8 min');
    await main
      .getByRole('button', { name: pt ? 'Começar' : 'Start', exact: true })
      .click();
    await expect(page.locator('.lesson-room')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    expect(errors).toEqual([]);
  });

test('a malformed daily preference falls back safely; a failed write shows feedback without disabling Start', async ({
  page,
}) => {
  await enter(page, false);
  // Create the daily preference first so the corrupted value belongs to the actual study day.
  await time(page, false, 5);
  await page.evaluate(() => {
    const key = Object.keys(localStorage).find((key) => key.startsWith('study-budget:v1:'))!;
    localStorage.setItem(key, '{bad json');
  });
  await page.reload();
  await expect(page.locator('.today-duration select')).toHaveValue('20');
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key.startsWith('study-budget:')) throw new DOMException('Full', 'QuotaExceededError');
      return original.call(this, key, value);
    };
  });
  await time(page, false, 5);
  await expect(page.locator('.today-screen')).toContainText(
    'Your time choice could not be saved',
  );
  await expect(page.locator('.audit-continue h2')).toHaveText('Discover words in context');
  await expect(
    page.locator('.audit-continue').getByRole('button', { name: 'Start', exact: true }),
  ).toBeEnabled();
});

test('the daily time override expires on the next study day without changing the usual study time', async ({
  page,
}) => {
  await page.clock.install({ time: new Date('2026-10-15T18:00:00Z') });
  await enter(page, false);
  await time(page, false, 5);
  await expect(page.locator('.today-duration select')).toHaveValue('5');
  const previous = await page.evaluate(() => localStorage.getItem('study-budget:v1:2026-10-15'));
  expect(previous).toBe('5');
  await page.clock.setSystemTime(new Date('2026-10-16T18:00:00Z'));
  await page.reload();
  await expect(page.locator('.today-duration select')).toHaveValue('20');
  // A new day can bring the previous plan's unfinished reading to the front.
  // Time expiry must preserve that backlog, rather than force a new class.
  await expect(page.locator('.audit-continue')).toContainText('Pick up where you stopped');
  expect(await page.evaluate(() => localStorage.getItem('study-budget:v1:2026-10-15'))).toBe('5');
});
