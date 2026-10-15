import { test, expect } from '@playwright/test';
import { go, ready } from './navigation';
test('The Portuguese course retains A1 and future levels remain locked', async ({ page }) => {
  await page.goto('./portugues/');
  await ready(page);
  await go(page, 'Classes');
  const level = page.getByLabel('Nível de estudo', { exact: true });
  await expect(level).toHaveValue('A1');
  await expect(level.locator('option[value="A2"]')).toHaveAttribute('disabled', '');
  await expect(page.locator('.class-card')).toHaveCount(4);
  await page.locator('.class-card').nth(1).click();
  await expect(page.locator('.course-locked')).toBeVisible();
  await expect(page.locator('.lesson-room')).toHaveCount(0);
  await expect(
    page.locator('.course-locked .study-spanish').filter({ hasText: 'Primero completá' }),
  ).toContainText('Primero completá');
  await page.reload();
  await go(page, 'Classes');
  await expect(page.getByLabel('Nível de estudo', { exact: true })).toHaveValue('A1');
});
