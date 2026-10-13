import { test, expect } from '@playwright/test';
test('Jazmín starts at A1, practices the MCER path, advances to A2 and keeps the route after reload', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./portugues/');
  await page
    .getByRole('dialog', { name: 'Palavra do dia' })
    .getByRole('button', { name: 'Fechar palavra do dia' })
    .click();
  await expect(page.locator('.cefr-home')).toContainText('A1');
  await page.getByRole('button', { name: 'Continuar meu percurso', exact: true }).click();
  await expect(page.getByText('Nível de estudo: A1', { exact: true })).toBeVisible();
  await expect(page.locator('.cefr-levels button')).toHaveCount(6);
  await expect(page.getByRole('button', { name: 'Experimentar A2' })).toBeDisabled();
  await page.getByLabel('Em Buenos Aires', { exact: true }).check();
  await page.getByRole('button', { name: 'Salvar prática', exact: true }).click();
  await page.locator('.cefr-tasks').getByRole('button', { name: 'Gramática', exact: true }).click();
  await page.getByLabel('sou', { exact: true }).check();
  await page.getByRole('button', { name: 'Salvar prática', exact: true }).click();
  await page.locator('.cefr-tasks').getByRole('button', { name: 'Escrita', exact: true }).click();
  await page
    .getByRole('textbox', { name: 'Resposta da prática' })
    .fill('Meu nome é Jazmín. Eu moro na Argentina.');
  await page.getByRole('button', { name: 'Salvar prática', exact: true }).click();
  await page.locator('.cefr-tasks').getByRole('button', { name: 'Fala', exact: true }).click();
  await page
    .getByRole('textbox', { name: 'Resposta da prática' })
    .fill('Falei meu nome, minha cidade e sobre música.');
  await page.getByRole('button', { name: 'Salvar prática', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Experimentar A2' })).toBeEnabled();
  await page.getByRole('button', { name: 'Experimentar A2' }).click();
  await expect(page.getByText('Nível de estudo: A2', { exact: true })).toBeVisible();
  await page.reload();
  await page.getByRole('button', { name: 'Continuar meu percurso', exact: true }).click();
  await expect(page.getByText('Nível de estudo: A2', { exact: true })).toBeVisible();
  await page.locator('.cefr-levels').getByRole('button', { name: /C2/ }).click();
  await expect(
    page.getByRole('heading', { name: 'A delicadeza da discordância', exact: true }),
  ).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    .toBe(true);
  await page.screenshot({ path: '/tmp/cefr-jazmin-mobile.png', fullPage: true });
  expect(errors).toEqual([]);
});
