import { test, expect } from '@playwright/test';
import { go, ready } from './navigation';
for (const pt of [false, true])
  test(`Compact mobile navigation, PDF instructions and next-level requirements are clear (${pt ? 'PT' : 'EN'})`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(pt ? './portugues/' : './');
    await ready(page);
    await expect(page.locator('.mobile-menu,.nav-more')).toHaveCount(0);
    await expect(page.locator('nav:visible')).toHaveCount(1);
    await expect(page.locator('.mobile-bottom-nav button')).toHaveCount(5);
    await go(page, 'PDF Studio');
    await expect(page.locator('.studio-first-steps')).toContainText(
      pt ? 'Cada um guarda' : 'Each keeps',
    );
    await expect(page.locator('.studio-intro-grid')).toHaveCount(0);
    await go(page, 'Progress');
    await page.locator('.progress-path-panel > summary').click();
    await expect(page.locator('.progress-path')).toContainText(pt ? 'A1 → A2' : 'A2 → B1');
    await expect(page.locator('.path-bases')).toContainText(
      pt ? 'Distinguir ser/estar' : 'presente simple',
    );
    await page.locator('.path-requirements > summary').click();
    await expect(page.locator('.path-requirements')).toContainText('Pendiente:');
    await go(page, 'Language help');
    await expect(page.locator('.toolkit-note[lang="es"]')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    expect(errors).toEqual([]);
  });
