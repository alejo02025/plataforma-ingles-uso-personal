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

test('Updating one space refreshes an idle second space and keeps both vocabularies separate', async ({
  page,
  context,
}) => {
  await page.goto('./');
  const englishPopup = page.getByRole('dialog', { name: 'Word of the Day' });
  const englishWord = await englishPopup.getByRole('heading').innerText();
  await englishPopup.getByRole('button', { name: 'Save this word', exact: true }).click();
  await englishPopup.getByRole('button', { name: 'Close daily word' }).click();
  const pt = await context.newPage();
  await pt.goto('./portugues/');
  const ptPopup = pt.getByRole('dialog', { name: 'Palavra do dia' });
  const portugueseWord = await ptPopup.getByRole('heading').innerText();
  await ptPopup.getByRole('button', { name: 'Salvar esta palavra', exact: true }).click();
  await ptPopup.getByRole('button', { name: 'Fechar palavra do dia' }).click();
  await pt.getByRole('button', { name: 'Abrir preferências', exact: true }).click();
  await pt.getByLabel('Seu nome', { exact: true }).fill('Unsaved Jazmín');
  await page.bringToFront();
  await page.getByRole('button', { name: 'Update app', exact: true }).click();
  await expect(page).toHaveURL(/updated=/);
  const token = new URL(page.url()).searchParams.get('updated');
  await pt.bringToFront();
  // Do not discard a preference draft to apply another space's update.
  await expect(pt.getByLabel('Seu nome', { exact: true })).toHaveValue('Unsaved Jazmín');
  expect(new URL(pt.url()).searchParams.get('updated')).toBeNull();
  await pt.getByRole('button', { name: 'Fechar preferências', exact: true }).click();
  await expect
    .poll(() => new URL(pt.url()).searchParams.get('updated'), { timeout: 15000 })
    .toBe(token);
  await expect(
    pt.getByRole('heading', { name: /(Bom dia|Boa tarde|Boa noite), Jazmín\./ }),
  ).toBeVisible();
  await pt
    .getByRole('navigation', { name: 'Navegação principal' })
    .getByRole('button', { name: /^Vocabulário/ })
    .click();
  await expect(
    pt.getByRole('heading', { name: portugueseWord, exact: true }).first(),
  ).toBeVisible();
  await expect(pt.getByRole('heading', { name: englishWord, exact: true })).toHaveCount(0);
  await page.bringToFront();
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('button', { name: /^Vocabulary/ })
    .click();
  await expect(page.getByRole('heading', { name: englishWord, exact: true }).first()).toBeVisible();
  await page.getByRole('link').filter({ hasText: 'Jazmín' }).first().click();
  await expect(page).toHaveURL(/portugues\/\?updated=.+opened=/);
  expect(new URL(page.url()).searchParams.get('updated')).toBe(token);
  await expect(
    page.getByRole('heading', { name: /(Bom dia|Boa tarde|Boa noite), Jazmín\./ }),
  ).toBeVisible();
});

test('a fresh explicit link does not replay an older refresh request', async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem('/plataforma-ingles-uso-personal:app-refresh', 'old-request'),
  );
  await page.goto('./?updated=fresh-link');
  await page
    .getByRole('dialog', { name: 'Word of the Day' })
    .getByRole('button', { name: 'Close daily word' })
    .click();
  await page.waitForTimeout(5500);
  expect(new URL(page.url()).searchParams.get('updated')).toBe('fresh-link');
});


test('online update is not blocked by a stalled offline pre-cache', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('dialog', { name: 'Word of the Day' })
    .getByRole('button', { name: 'Close daily word' })
    .click();
  // Mimic a slow or unresponsive service-worker update. The online app should
  // still reload while the offline cache catches up independently.
  await page.evaluate(() => {
    ServiceWorkerRegistration.prototype.update = () => new Promise<ServiceWorkerRegistration>(() => {});
  });
  await page.getByRole('button', { name: 'Update app', exact: true }).click();
  await expect(page).toHaveURL(/updated=/, { timeout: 12000 });
  await expect(page.locator('.audit-continue > .button')).toBeVisible();
});
