import { test, expect } from '@playwright/test';

test('an older home page can update when its unloaded AI bundle is unavailable, preserving saved words', async ({
  page,
}) => {
  await page.goto('./');
  const popup = page.getByRole('dialog', { name: 'Word of the Day' });
  const word = await popup.getByRole('heading').innerText();
  await popup.getByRole('button', { name: 'Save this word' }).click();
  await expect(popup.getByRole('button', { name: 'Saved to vocabulary' })).toBeVisible();
  await popup.getByRole('button', { name: 'Close daily word' }).click();
  let missing = 0;
  await page.route('**/_next/static/chunks/*.js', async (route) => {
    if (new URL(page.url()).searchParams.has('updated')) await route.continue();
    else {
      missing++;
      await route.fulfill({ status: 404, body: 'Old bundle no longer available' });
    }
  });
  await page.getByRole('button', { name: 'Update app', exact: true }).click();
  await expect(page).toHaveURL(/updated=/);
  expect(missing).toBeGreaterThan(0);
  await expect(
    page.getByRole('heading', { name: /Good (morning|afternoon|evening), Alejo\./ }),
  ).toBeVisible();
  await page
    .getByRole('navigation')
    .getByRole('button', { name: /^Vocabulary/ })
    .click();
  await expect(page.getByRole('heading', { name: word, exact: true }).first()).toBeVisible();
});
