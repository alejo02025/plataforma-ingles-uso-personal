import { test, expect } from '@playwright/test';
import { go, ready } from './navigation';
for (const pt of [false, true])
  test(`Oral practice is grouped in Review without pronunciation scoring (${pt ? 'PT' : 'EN'})`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(pt ? './portugues/' : './');
    await ready(page);
    await expect(
      page.locator(
        '.today-first-check,.audit-skills,.audit-starting-context,.daily-guide,.home-routine',
      ),
    ).toHaveCount(0);
    await expect(page.locator('.today-task')).toHaveCount(3);
    await go(page, 'Oral practice');
    await expect(page.locator('.oral-room')).toBeVisible();
    await expect(page.locator('.oral-room')).toContainText(pt ? 'não' : 'not');
    for (const width of [375, 390, 768, 1280, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    }
    expect(errors).toEqual([]);
  });
