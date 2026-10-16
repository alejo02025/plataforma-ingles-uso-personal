import { go, dailyWord, ready, offlineReady, finishRoutine } from './navigation';
import { test, expect } from '@playwright/test';
import { makeRoutine } from '../../src/lib/routine';

for (const pt of [false, true])
  test(`Daily streak and achievements use saved practice, persist offline and stay separate (${pt ? 'PT' : 'EN'})`, async ({
    page,
    context,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(pt ? './portugues/' : './');

    await offlineReady(page);
    const progress = async () => {
      await go(page, 'Progress');
      await page.locator('.progress-milestones > summary').click();
    };
    await progress();
    const rewards = page.locator('.daily-rewards');
    await expect(rewards.locator('.streak-stat strong')).toHaveText('0');
    await expect(rewards.locator('.star-stat strong')).toHaveText('0 / 12');
    await rewards.locator('.star-stat').click();
    await expect(rewards.locator('#achievement-details')).toBeVisible();
    await expect(rewards.locator('.reward-badges li')).toHaveCount(12);
    await expect(rewards.locator('.reward-badges li.earned')).toHaveCount(0);
    await expect(rewards.locator('#achievement-details')).toContainText(
      'Cada perfil tiene sus propios logros.',
    );
    await expect(rewards.locator('.reward-badges h4').first()).toHaveText(
      pt ? 'Primeiro passo' : 'First step',
    );
    await rewards.locator('.streak-stat').click();
    await expect(rewards.locator('#achievement-details')).toBeHidden();
    await expect(rewards.locator('.streak-week li')).toHaveCount(7);
    await expect(rewards.locator('.streak-week .practised')).toHaveCount(0);
    await rewards.locator('.streak-stat').click();
    await go(page, 'Practice');
    await page.locator('.review-practice .practice-options .activity-row').first().click();
    const dialog = page.getByRole('dialog', { name: pt ? 'Atividade guiada' : 'Guided activity' });
    // Incorrect choices and unverified recalls record study without inventing mastery/errors.
    await finishRoutine(page, pt, 'vocabulary', 0, 6);
    await expect(dialog.locator('.routine-score')).toContainText('0 / 3');
    await expect(dialog.locator('.routine-finish')).toContainText('3 respuestas abiertas');
    await expect(dialog.locator('.routine-finish')).toContainText('Guardado en tu progreso.');
    await dialog
      .getByRole('button', { name: pt ? 'Pausar atividade' : 'Pause activity', exact: true })
      .click();
    await progress();
    await expect(rewards.locator('.streak-stat')).toHaveClass(/is-lit/);
    await expect(rewards.locator('.streak-stat strong')).toHaveText('1');
    await expect(rewards.locator('.star-stat strong')).toHaveText('2 / 12');
    await rewards.locator('.streak-stat').click();
    await expect(rewards.locator('.streak-week .practised')).toHaveCount(1);
    await expect(rewards.locator('#streak-details')).toContainText(
      'Hoy tenés 1 práctica guardada.',
    );
    await rewards.scrollIntoViewIfNeeded();
    await page.screenshot({ path: `/tmp/daily-streak-${pt ? 'pt' : 'en'}.png`, fullPage: true });
    await rewards.locator('.star-stat').click();
    await expect(rewards.locator('.reward-badges li.earned')).toHaveCount(2);
    await page.screenshot({
      path: `/tmp/daily-achievements-${pt ? 'pt' : 'en'}.png`,
      fullPage: true,
    });
    await context.setOffline(true);
    await page.reload();
    await progress();
    await expect(rewards.locator('.streak-stat strong')).toHaveText('1');
    await expect(rewards.locator('.star-stat strong')).toHaveText('2 / 12');
    await rewards.locator('.star-stat').click();
    await page.setViewportSize({ width: 320, height: 740 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await rewards
      .locator('.daily-rewards-bar')
      .screenshot({ path: `/tmp/daily-rewards-small-${pt ? 'pt' : 'en'}.png` });
    await page.setViewportSize({ width: 1280, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({
      path: `/tmp/daily-rewards-desktop-${pt ? 'pt' : 'en'}.png`,
      fullPage: true,
    });
    await go(page, 'Settings');
    await page.getByLabel(pt ? 'Aparência' : 'Appearance', { exact: true }).selectOption('dark');
    await page
      .getByRole('button', { name: pt ? 'Salvar preferências' : 'Save preferences', exact: true })
      .click();
    await progress();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await rewards
      .locator('.daily-rewards-bar')
      .screenshot({ path: `/tmp/daily-rewards-dark-${pt ? 'pt' : 'en'}.png` });
    await context.setOffline(false);
    await page.goto(pt ? './' : './portugues/');

    await progress();
    await expect(rewards.locator('.streak-stat strong')).toHaveText('0');
    await expect(rewards.locator('.star-stat strong')).toHaveText('0 / 12');
    expect(errors).toEqual([]);
  });
