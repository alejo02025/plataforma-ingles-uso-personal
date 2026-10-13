import { test, expect } from '@playwright/test';
import { makePdf } from '../pdf-fixture';
test('PDF Studio, daily words, real local AI, responsive views and update banner', async ({
  page,
  browser,
}) => {
  test.setTimeout(180000);
  const errors: string[] = [],
    external: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => {
    if (!request.url().startsWith('http://127.0.0.1:3200') && !request.url().startsWith('blob:'))
      external.push(request.url());
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('./');
  await expect(
    page.getByRole('heading', { name: /Good (morning|afternoon|evening), Alejo\./ }),
  ).toBeVisible();
  await expect(page.getByRole('dialog', { name: 'Word of the Day' })).toBeVisible();
  await page.screenshot({ path: '/tmp/english-os-home-desktop.png', fullPage: true });
  const daily = page.getByRole('dialog', { name: 'Word of the Day' });
  const word = await daily.getByRole('heading').innerText();
  const usage = (await daily.locator('blockquote').innerText()).replace(/[“”]/g, '');
  await daily.getByRole('button', { name: 'Save this word' }).click();
  await expect(daily.getByRole('button', { name: 'Saved to vocabulary' })).toBeVisible();
  await daily.getByRole('button', { name: 'My vocabulary' }).click();
  await expect(page.getByRole('heading', { name: word, exact: true }).first()).toBeVisible();
  await page.getByRole('button', { name: 'Everyday sentences', exact: true }).click();
  await expect(page.locator('.word-library h3').filter({ hasText: usage })).toBeVisible();
  await page.getByRole('navigation').getByRole('button', { name: 'Home', exact: true }).click();
  await page
    .getByRole('group', { name: 'Interactive practice momentum chart' })
    .getByRole('button', { name: /View practice on/ })
    .first()
    .click();
  await expect(page.getByText('No practice saved on this day. Momentum eased down.')).toBeVisible();
  await page
    .getByRole('group', { name: 'Interactive practice momentum chart' })
    .getByRole('button', { name: /View practice on/ })
    .last()
    .click();
  await expect(page.locator('.momentum-records')).toContainText('Words saved:');
  await page.setViewportSize({ width: 390, height: 844 });
  await expect
    .poll(() =>
      page.locator('.sidebar').evaluate((element) => element.getBoundingClientRect().right),
    )
    .toBeLessThanOrEqual(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.screenshot({ path: '/tmp/english-os-home-mobile.png', fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.getByRole('navigation').getByRole('button', { name: 'PDF Studio' }).click();
  await page
    .getByLabel('Upload PDFs')
    .setInputFiles({ name: 'Journey.pdf', mimeType: 'application/pdf', buffer: makePdf() });
  await expect(page.locator('.studio-passage')).toContainText('Last summer I travelled');
  await expect(page.getByText('Page 1 · Section 1', { exact: true })).toBeVisible();
  await page.locator('.studio-tabs').getByRole('button', { name: 'Practice', exact: true }).click();
  const first = page.locator('.studio-question').first();
  await first.locator('input[type=radio]').first().check();
  await first.getByRole('button', { name: 'Check and save' }).click();
  await expect(first.getByRole('status')).toBeVisible();
  await page
    .locator('.studio-question textarea')
    .fill('The writer travelled to a small town and learned about local history.');
  await page
    .locator('.studio-question')
    .last()
    .getByRole('button', { name: 'Check and save' })
    .click();
  await expect(page.getByText(/open answer has not been automatically graded/)).toBeVisible();
  await page.getByRole('button', { name: 'Chat', exact: true }).click();
  await page.getByLabel('Message your PDF tutor').fill('What does the museum show?');
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.locator('.studio-message.assistant').last()).toContainText(
    'The local museum showed',
  );
  await page.getByRole('button', { name: 'Enable local AI', exact: true }).click();
  await expect(page.locator('.studio-ai-state')).toHaveText('Local AI', { timeout: 90000 });
  await page.getByLabel('Message your PDF tutor').fill('Where is the town in this passage?');
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.getByRole('button', { name: 'Stop response' })).toBeVisible();
  const addPdf = page.getByRole('button', { name: 'Add PDF', exact: true });
  await expect(addPdf).toBeEnabled();
  const chooser = page.waitForEvent('filechooser');
  await addPdf.click();
  await (
    await chooser
  ).setFiles({
    name: 'Timetable.pdf',
    mimeType: 'application/pdf',
    buffer: makePdf([
      'The train leaves at nine in the morning.',
      'Passengers check the timetable before travelling.',
      'They buy tickets at the railway station.',
    ]),
  });
  await expect(page.getByRole('tab', { name: 'Timetable', exact: true })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await expect(page.locator('.studio-passage')).toContainText('The train leaves');
  await page.getByRole('tab', { name: 'Journey', exact: true }).click();
  await expect(page.locator('.studio-message.assistant')).toHaveCount(2, { timeout: 90000 });
  await expect(page.locator('.studio-ai-state')).toHaveClass(/enabled/, { timeout: 90000 });
  const answer = page.locator('.studio-message.assistant').last();
  await expect(answer.locator('span').first()).toHaveText(/Local AI tutor|Reading guide/);
  const answerText = await answer.locator('p').innerText();
  expect(answerText).toMatch(/river/i);
  expect(answerText).not.toMatch(/Ashwood|England/);
  console.log('Actual local model response:', answerText);
  await expect(answer.locator('.studio-citations button').first()).toContainText('Page 1');
  expect(external).toEqual([]);
  await page.screenshot({ path: '/tmp/english-os-studio-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await expect
    .poll(() =>
      page.locator('.sidebar').evaluate((element) => element.getBoundingClientRect().right),
    )
    .toBeLessThanOrEqual(1);
  await page.screenshot({ path: '/tmp/english-os-studio-mobile.png', fullPage: true });
  await page.reload();
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.getByRole('navigation').getByRole('button', { name: 'PDF Studio' }).click();
  await page.locator('.studio-tabs').getByRole('button', { name: 'Practice', exact: true }).click();
  await expect(page.getByText(/open answer has not been automatically graded/)).toBeVisible();
  await expect(page.locator('.studio-question textarea')).toHaveValue(
    'The writer travelled to a small town and learned about local history.',
  );
  await page.getByRole('button', { name: 'Chat', exact: true }).click();
  await expect(page.locator('.studio-message.assistant').last().locator('p')).toHaveText(
    answerText,
  );
  await page.route('**/assets/version.json?*', (route) =>
    route.fulfill({ json: { build: 'a-future-test-build' } }),
  );
  await page.reload();
  await expect(page.locator('.app-update-banner')).toContainText(
    'A new version of the app is available.',
  );
  await page
    .locator('.app-update-banner')
    .getByRole('button', { name: 'Update', exact: true })
    .click();
  await expect(page).toHaveURL(/updated=/);
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.getByRole('navigation').getByRole('button', { name: 'PDF Studio' }).click();
  await page.getByRole('button', { name: 'Chat', exact: true }).click();
  await expect(page.locator('.studio-message.assistant').last().locator('p')).toHaveText(
    answerText,
  );
  expect(errors).toEqual([]);
});

test('local AI compatibility engine stays on this site when JSPI is unavailable', async ({
  page,
}) => {
  test.setTimeout(180000);
  await page.addInitScript(() =>
    Object.defineProperty(WebAssembly, 'Suspending', { value: undefined, configurable: true }),
  );
  const fetched: string[] = [];
  page.on('request', (request) => fetched.push(request.url()));
  await page.goto('./');
  await page
    .getByRole('dialog', { name: 'Word of the Day' })
    .getByRole('button', { name: 'Close daily word' })
    .click();
  await page.getByRole('navigation').getByRole('button', { name: 'PDF Studio' }).click();
  await page
    .getByLabel('Upload PDFs')
    .setInputFiles({ name: 'Journey.pdf', mimeType: 'application/pdf', buffer: makePdf() });
  await expect(page.locator('.studio-passage')).toContainText('Last summer I travelled');
  await page.getByRole('button', { name: 'Chat', exact: true }).click();
  await page.getByRole('button', { name: 'Enable local AI', exact: true }).click();
  await expect(page.locator('.studio-ai-state')).toHaveText('Local AI', { timeout: 90000 });
  await page.getByLabel('Message your PDF tutor').fill('Where is the town?');
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.getByRole('button', { name: 'Send message' })).toBeVisible({ timeout: 90000 });
  await expect(page.locator('.studio-message.assistant').last()).toContainText('river');
  expect(fetched.some((url) => url.endsWith('/local-ai/compat.wasm'))).toBe(true);
  expect(fetched.some((url) => url.endsWith('/local-ai/compat.js'))).toBe(true);
  expect(
    fetched.filter((url) => !url.startsWith('http://127.0.0.1:3200') && !url.startsWith('blob:')),
  ).toEqual([]);
});
