import { test, expect } from '@playwright/test';

for (const pt of [false, true]) {
  test(`Learning-first navigation and primary action remain usable (${pt ? 'PT' : 'EN'})`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(pt ? './portugues/' : './');
    const daily = page.getByRole('dialog', { name: pt ? 'Palavra do dia' : 'Word of the Day' });
    if (await daily.isVisible()) {
      await daily.getByRole('button', { name: pt ? 'Fechar palavra do dia' : 'Close daily word' }).click();
    }
    const nav = page.locator('.sidebar .nav-primary');
    await expect(nav.getByRole('button').nth(0)).toContainText(pt ? 'Início' : 'Home');
    await expect(nav.getByRole('button').nth(1)).toContainText(pt ? 'Meu dia' : 'My Day');
    await expect(nav.getByRole('button').nth(2)).toContainText(pt ? 'Aulas' : 'Classes');
    await expect(nav.getByRole('button').nth(3)).toContainText(pt ? 'Estúdio de PDFs' : 'PDF Studio');
    await expect(page.locator('.audit-continue > .button')).toBeVisible();
    expect(await nav.evaluate((el) => getComputedStyle(el).flexDirection)).toBe('column');

    for (const width of [375, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 860 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      await expect(page.locator('.audit-continue > .button')).toBeVisible();
    }
    await page.setViewportSize({ width: 390, height: 860 });
    const mobile = page.locator('.mobile-bottom-nav');
    await expect(mobile.getByRole('button').nth(1)).toContainText(pt ? 'Ler' : 'Read');
    await expect(mobile.getByRole('button').last()).toContainText(pt ? 'Progresso' : 'Progress');
  });
}
