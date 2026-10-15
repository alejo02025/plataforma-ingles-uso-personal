import { test, expect } from '@playwright/test';
for (const pt of [false, true])
  test(`Mobile menu, PDF instructions and next-level progress are clear (${pt ? 'PT' : 'EN'})`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(pt ? './portugues/' : './');
    await expect(page.locator('.today-screen')).toBeVisible();
    await page
      .getByRole('button', { name: pt ? 'Abrir navegação' : 'Open navigation', exact: true })
      .click();
    await expect(page.locator('.nav-more')).not.toHaveAttribute('open', '');
    await expect(page.locator('.nav-primary').getByRole('button')).toHaveCount(5);
    await page.locator('.nav-more summary').click();
    await expect(
      page.locator('.nav-more').getByRole('button', {
        name: pt ? 'Ajuda com o idioma' : 'Language help', exact: true,
      }),
    ).toBeVisible();
    await expect(
      page
        .locator('.nav-more')
        .getByRole('button', { name: pt ? 'Notícias' : 'News', exact: true }),
    ).toBeVisible();
    await page
      .getByRole('button', { name: pt ? 'Fechar menu' : 'Close menu', exact: true })
      .click();
    await page.locator('.mobile-bottom-nav').getByRole('button').nth(3).click();
    await expect(page.locator('.studio-first-steps')).toContainText('Subí un PDF');
    await expect(page.locator('.studio-intro-grid')).toHaveCount(0);
    await page.screenshot({ path: `/tmp/pdf-simple-${pt ? 'pt' : 'en'}.png`, fullPage: true });
    await page.locator('.mobile-bottom-nav').getByRole('button').last().click();
    await expect(page.locator('.progress-path')).toContainText(pt ? 'A1 → A2' : 'A2 → B1');
    await expect(page.locator('.path-bases')).toContainText(
      pt ? 'Distinguir ser/estar' : 'presente simple',
    );
    await page.locator('.path-requirements summary').click();
    await expect(page.locator('.path-requirements')).toContainText('Pendiente:');
    await page
      .locator('.progress-path')
      .getByText(pt ? 'Marcos de prática' : 'Practice milestones', { exact: true })
      .click();
    await expect(page.locator('.progress-path')).toContainText('Todavía no hay un nivel completo');
    await page.screenshot({ path: `/tmp/progress-simple-${pt ? 'pt' : 'en'}.png`, fullPage: true });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page
      .getByRole('button', {
        name: pt ? 'Abrir ajuda com o idioma' : 'Open language help',
        exact: true,
      })
      .click();
    await expect(page.locator('.toolkit-note[lang="es"]')).toBeVisible();
    expect(errors).toEqual([]);
  });
