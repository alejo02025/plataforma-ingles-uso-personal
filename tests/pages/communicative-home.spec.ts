import { test, expect } from '@playwright/test';

for (const pt of [false, true]) {
  test(`Today presents oral practice as an optional follow-up, not a scoring claim (${pt ? 'PT' : 'EN'})`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(pt ? './portugues/' : './');
    await expect(page.locator('.today-head h1')).toHaveText(pt ? 'Hoje' : 'Today');
    await expect(page.locator('.today-first-check')).toBeVisible();
    await expect(page.locator('.audit-starting-context')).toHaveCount(0);
    await page.locator('.today-duration select').selectOption('20');
    const oral = page.locator('.today-task').filter({ hasText: pt ? 'Praticar a fala' : 'Speaking practice' });
    await expect(oral).toBeVisible();
    for (const width of [375, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await oral.click();
    await expect(page.locator('.oral-room')).toBeVisible();
    expect(errors).toEqual([]);
  });
}
