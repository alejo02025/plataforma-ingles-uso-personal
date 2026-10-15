import { test, expect } from '@playwright/test';

for (const pt of [false, true]) {
  test(`Today-first navigation and a single clear primary action (${pt ? 'PT' : 'EN'})`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(pt ? './portugues/' : './');
    await expect(page.locator('.today-screen')).toBeVisible();
    await expect(page.getByRole('dialog', { name: pt ? 'Palavra do dia' : 'Word of the Day' })).toHaveCount(0);
    const nav = page.locator('.sidebar .nav-primary');
    const names = pt
      ? ['Hoje', 'Aulas', 'Revisão', 'Biblioteca', 'Progresso']
      : ['Today', 'Classes', 'Review', 'Library', 'Progress'];
    await expect(nav.getByRole('button')).toHaveCount(5);
    for (let i = 0; i < names.length; i++) {
      await expect(nav.getByRole('button').nth(i)).toContainText(names[i]);
    }
    await expect(page.locator('.today-focus > .button')).toBeVisible();
    await expect(page.locator('.today-plan')).toBeVisible();
    await expect(page.locator('.audit-skills')).toHaveCount(0);
    for (const width of [375, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 860 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      await expect(page.locator('.today-focus > .button')).toBeVisible();
    }
    await page.setViewportSize({ width: 390, height: 860 });
    const mobile = page.locator('.mobile-bottom-nav');
    await expect(mobile.getByRole('button').first()).toContainText(pt ? 'Hoje' : 'Today');
    await expect(mobile.getByRole('button').last()).toContainText(pt ? 'Progresso' : 'Progress');
    await mobile.getByRole('button').nth(1).click();
    await expect(page.locator('.today-screen')).toHaveCount(0);
    await mobile.getByRole('button').first().click();
    await expect(page.locator('.today-screen')).toBeVisible();
  });
}
