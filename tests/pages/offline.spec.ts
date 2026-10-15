import { go, dailyWord, ready } from './navigation';
import { test, expect } from '@playwright/test';
import { makePdf } from '../pdf-fixture';
test('Both spaces reopen without a signal, retain vocabulary and PDFs, and reject updates without deleting data', async ({
  page,
  context,
}) => {
  test.setTimeout(180000);
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('./');
  await dailyWord(page);
  const popup = page.getByRole('dialog', { name: 'Word of the Day' }),
    word = await popup.getByRole('heading').innerText();
  await popup.getByRole('button', { name: 'Save this word', exact: true }).click();
  await popup.getByRole('button', { name: 'Close daily word' }).click();
  await go(page, 'Settings');
  await expect(page.locator('.offline-status summary')).toContainText('Ready offline', {
    timeout: 90000,
  });
  await go(page, 'PDF Studio');
  await page
    .getByLabel('Upload PDFs')
    .setInputFiles({ name: 'Offline book.pdf', mimeType: 'application/pdf', buffer: makePdf() });
  await expect(page.getByRole('tab', { name: 'Offline book', exact: true })).toBeVisible();
  await page.goto('./portugues/');
  await dailyWord(page);
  const ptPopup = page.getByRole('dialog', { name: 'Palavra do dia' }),
    ptWord = await ptPopup.getByRole('heading').innerText();
  await ptPopup.getByRole('button', { name: 'Salvar esta palavra', exact: true }).click();
  await ptPopup.getByRole('button', { name: 'Fechar palavra do dia' }).click();
  await context.setOffline(true);
  await page.reload();
  await ready(page);
  await go(page, 'Settings');
  await expect(page.locator('.offline-status summary')).toContainText('Sem conexão');
  await go(page, /^Vocabulário/);
  await expect(page.getByRole('heading', { name: ptWord, exact: true }).first()).toBeVisible();
  await page.goto('./');
  await ready(page);
  await go(page, 'Settings');
  await page.getByRole('button', { name: 'Update app', exact: true }).click();
  await expect(
    page.getByRole('alert').filter({ hasText: 'Connect to the internet' }),
  ).toBeVisible();
  await go(page, /^Vocabulary/);
  await expect(page.getByRole('heading', { name: word, exact: true }).first()).toBeVisible();
  await go(page, 'PDF Studio');
  await expect(page.getByRole('tab', { name: 'Offline book', exact: true })).toBeVisible();
  await page.getByLabel('Upload PDFs').setInputFiles({
    name: 'Second offline book.pdf',
    mimeType: 'application/pdf',
    buffer: makePdf([
      'A second book can be added without a network connection.',
      'This text tells a short story about a local museum.',
    ]),
  });
  await expect(page.getByRole('tab', { name: 'Second offline book', exact: true })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Offline book', exact: true })).toBeVisible();
  await context.setOffline(false);
  await go(page, 'Settings');
  await page.getByRole('button', { name: 'Update app', exact: true }).click();
  await expect(page).toHaveURL(/updated=/);
  await go(page, 'PDF Studio');
  await expect(page.getByRole('tab', { name: 'Second offline book', exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});
