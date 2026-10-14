import { test, expect } from '@playwright/test';
test('The Portuguese MCER entry opens the same connected route; future levels remain locked', async ({
  page,
}) => {
  await page.goto('./portugues/');
  await page
    .getByRole('dialog', { name: 'Palavra do dia' })
    .getByRole('button', { name: 'Fechar palavra do dia' })
    .click();
  await expect(page.locator('.course-dashboard')).toContainText('A1');
  await page
    .locator('.course-dashboard')
    .getByRole('button', { name: 'Continuar meu percurso', exact: true })
    .click();
  await expect(page.locator('.course-connected')).toContainText('A1');
  await page.locator('.class-levels').getByRole('button', { name: /A2/ }).click();
  await page.locator('.class-card').first().click();
  await expect(page.locator('.course-locked')).toContainText('nivel activo es A1');
  await expect(page.locator('.lesson-room')).toHaveCount(0);
  await page.reload();
  await expect(page.locator('.course-dashboard')).toContainText('A1');
});
