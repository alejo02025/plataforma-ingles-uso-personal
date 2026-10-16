import { test, expect } from '@playwright/test';
import { go, ready } from './navigation';

for (const width of [390, 1440]) {
  test(`Language spaces are visible from Today and Classes, and retain separate study time (${width}px)`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await page.goto('./');
    await ready(page);
    const switcher = page.locator('.language-switcher');
    await expect(switcher).toBeInViewport();
    await expect(switcher.locator('.language-current')).toContainText('English');
    await page.locator('.today-duration select').selectOption('15');
    await expect(page.locator('.today-duration select')).toHaveValue('15');
    await go(page, 'Classes');
    await expect(switcher).toBeInViewport();
    await switcher.getByRole('link', { name: /Português OS/ }).click();
    await ready(page);
    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
    await expect(switcher.locator('.language-current')).toContainText('Português');
    await expect(page.locator('.today-duration select')).toHaveValue('20');
    await go(page, 'Classes');
    await expect(page.getByLabel('Nível de estudo', { exact: true })).toHaveValue('A1');
    await expect(switcher).toBeInViewport();
    await switcher.getByRole('link', { name: /English OS/ }).click();
    await ready(page);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('.today-duration select')).toHaveValue('15');
    await page.reload();
    await ready(page);
    await expect(page.locator('.today-duration select')).toHaveValue('15');
  });
}
