import { test, expect } from '@playwright/test';
import { ready } from './navigation';

for (const pt of [false, true]) {
  test(`Lingua interface: language identity, daily Spanish, grammar guide and sections (${pt ? 'PT' : 'EN'})`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(pt ? './portugues/' : './');
    await ready(page);

    // The current language has its own flag; both languages are available.
    const selector = page.locator('.mobile-language-switch');
    await expect(selector.getByRole('link')).toHaveCount(2);
    await expect(selector.locator('a[aria-current="page"]')).toContainText(pt ? '🇧🇷' : '🇬🇧');
    await expect(selector.getByRole('link', { name: '🇬🇧 English' })).toBeVisible();
    await expect(selector.getByRole('link', { name: '🇧🇷 Português brasileiro' })).toBeVisible();

    // Today's activity always has a native-language explanation followed by Spanish.
    await expect(page.locator('.today-primary-spanish[lang="es"]')).toBeVisible();
    await expect(page.locator('.today-focus p[lang="' + (pt ? 'pt-BR' : 'en') + '"]')).toBeVisible();
    await expect(page.locator('.today-journey-bar[role="progressbar"]')).toBeVisible();
    await expect(page.locator('.mobile-bottom-nav .bottom-emoji')).toHaveCount(5);
    await page.screenshot({ path: `artifacts/redesign/qa/lingua-today-${pt ? 'pt' : 'en'}-390.png`, fullPage: true });

    await page.locator('.mobile-bottom-nav').getByRole('button').nth(1).click();
    await expect(page.locator('.course-guide-shortcut')).toBeVisible();
    await expect(page.locator('.course-guide-copy p[lang="es"]')).toBeVisible();
    await expect(page.locator('.class-node-art')).toHaveCount(4);
    await page.locator('.course-guide-action').click();
    await expect(page.locator('.language-desk')).toBeVisible();
    await expect(page.locator('.sentence-shape')).toBeVisible();
    await expect(page.locator('.builder-label-es[lang="es"]')).toHaveCount(4);
    await expect(page.locator('.foundation-model > p[lang="es"]')).toBeVisible();
    await page.screenshot({ path: `artifacts/redesign/qa/lingua-sentences-${pt ? 'pt' : 'en'}-390.png`, fullPage: true });

    await page.locator('.mobile-bottom-nav').getByRole('button').nth(2).click();
    await expect(page.locator('.recall-grid')).toBeVisible();
    await page.locator('.mobile-bottom-nav').getByRole('button').nth(3).click();
    await expect(page.locator('.studio-drop')).toBeVisible();
    await page.locator('.mobile-bottom-nav').getByRole('button').nth(4).click();
    await expect(page.locator('.progress-overview')).toBeVisible();

    for (const width of [375, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    }
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(page.locator('.sidebar .nav-emoji')).toHaveCount(5);
    await expect(page.locator('.sidebar .language-pair a')).toHaveCount(2);
    await page.locator('.sidebar .nav-primary').getByRole('button').first().click();
    await expect(page.locator('.today-primary-spanish[lang="es"]')).toBeVisible();
    await page.screenshot({ path: `artifacts/redesign/qa/lingua-today-${pt ? 'pt' : 'en'}-1440.png`, fullPage: true });
    expect(errors).toEqual([]);
  });
}
