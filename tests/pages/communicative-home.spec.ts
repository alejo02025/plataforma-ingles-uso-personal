import { test, expect } from '@playwright/test';

for (const pt of [false, true]) {
  test(`Dashboard keeps course level separate from diagnostic and offers oral production (${pt ? 'PT' : 'EN'})`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(pt ? './portugues/' : './');
    const daily = page.getByRole('dialog', { name: pt ? 'Palavra do dia' : 'Word of the Day' });
    if (await daily.isVisible()) {
      await daily
        .getByRole('button', { name: pt ? 'Fechar palavra do dia' : 'Close daily word' })
        .click();
    }
    await expect(page.locator('.audit-starting-context')).toContainText(
      pt ? 'Percurso atual: A1' : 'Current course path: A2',
    );
    const oral = page.locator('.audit-speaking-step');
    await expect(oral).toBeVisible();
    await expect(oral.locator('.audit-speaking-copy p')).not.toBeEmpty();
    await expect(oral.locator('small[lang="es"]')).toContainText('pronunciación');
    for (const width of [375, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
        .toBe(true);
      await expect(oral.getByRole('button')).toBeVisible();
    }
    await oral.getByRole('button', {
      name: pt ? 'Praticar fala' : 'Practise speaking',
    }).click();
    await expect(page.locator('.oral-room')).toBeVisible();
    expect(errors).toEqual([]);
  });
}
