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
    await page
      .getByRole('dialog', { name: pt ? 'Palavra do dia' : 'Word of the Day' })
      .getByRole('button', { name: pt ? 'Fechar palavra do dia' : 'Close daily word' })
      .click();
    await page
      .getByRole('button', { name: pt ? 'Explorar meu dia' : 'Explore my day', exact: true })
      .click();
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
    await page.locator('.home-routine .routine-node').first().click();
    const dialog = page.getByRole('dialog', { name: pt ? 'Atividade guiada' : 'Guided activity' });
    for (const q of makeRoutine('vocabulary', pt ? 'A1' : 'A2', 0, pt).rounds) {
      // A saved incorrect answer still represents practice and counts toward a daily streak.
      await dialog
        .getByRole('button', { name: q.choices.find((c) => c !== q.solution)!, exact: true })
        .click();
      await dialog.getByRole('button', { name: pt ? 'Conferir' : 'Check', exact: true }).click();
      await dialog
        .getByRole('button', { name: pt ? 'Continuar' : 'Continue', exact: true })
        .click();
    }
    await expect(dialog.locator('.routine-finish')).toContainText('Guardado en tu progreso.');
    await dialog
      .getByRole('button', { name: pt ? 'Voltar ao percurso' : 'Back to the path', exact: true })
      .click();
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
    await expect(page.locator('.offline-status summary')).toContainText(
      pt ? 'Pronto sem conexão' : 'Ready offline',
      { timeout: 90000 },
    );
    await context.setOffline(true);
    await page.reload();
    await expect(rewards.locator('.streak-stat strong')).toHaveText('1');
    await expect(rewards.locator('.star-stat strong')).toHaveText('2 / 12');
    await page.locator('.mobile-menu').click();
    await page
      .locator('.sidebar')
      .getByRole('button', { name: pt ? 'Meu dia' : 'My Day', exact: true })
      .click();
    await expect(rewards.locator('.streak-stat strong')).toHaveText('1');
    await expect(rewards.locator('.star-stat strong')).toHaveText('2 / 12');
    await page.locator('.mobile-bottom-nav').getByRole('button').first().click();
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
    await page
      .getByRole('button', {
        name: pt ? 'Mudar para aparência escura' : 'Switch to dark mode',
        exact: true,
      })
      .click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await rewards
      .locator('.daily-rewards-bar')
      .screenshot({ path: `/tmp/daily-rewards-dark-${pt ? 'pt' : 'en'}.png` });
    await context.setOffline(false);
    await page.goto(pt ? './' : './portugues/');
    await page
      .getByRole('dialog', { name: pt ? 'Word of the Day' : 'Palavra do dia' })
      .getByRole('button', { name: pt ? 'Close daily word' : 'Fechar palavra do dia' })
      .click();
    await expect(rewards.locator('.streak-stat strong')).toHaveText('0');
    await expect(rewards.locator('.star-stat strong')).toHaveText('0 / 12');
    expect(errors).toEqual([]);
  });
