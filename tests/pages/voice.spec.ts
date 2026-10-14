import { test, expect } from '@playwright/test';
for (const pt of [false, true])
  test(`Classes have no oral AI conversation controls (${pt ? 'PT' : 'EN'})`, async ({ page }) => {
    await page.goto(pt ? './portugues/' : './');
    await page
      .getByRole('dialog', { name: pt ? 'Palavra do dia' : 'Word of the Day' })
      .getByRole('button', { name: pt ? 'Fechar palavra do dia' : 'Close daily word' })
      .click();
    await page
      .getByRole('button', { name: pt ? 'Abrir aulas' : 'Open classes', exact: true })
      .click();
    await expect(
      page
        .locator('.foundation-tabs')
        .getByRole('button', { name: pt ? 'Aplicar' : 'Use it', exact: true }),
    ).toHaveCount(0);
    await expect(page.locator('.voice-room')).toHaveCount(0);
    await expect(
      page.getByRole('button', { name: pt ? 'Começar a falar' : 'Start speaking', exact: true }),
    ).toHaveCount(0);
  });
