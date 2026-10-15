import { go, dailyWord, ready } from './navigation';
import { test, expect, type Page, type BrowserContext } from '@playwright/test';
import { makePdf } from '../pdf-fixture';
async function preferences(page: Page) {
  await go(page, 'Settings');
}
async function authorize(page: Page) {
  await preferences(page);
  await page.getByLabel('GitHub token').fill('github-test-fixture-never-real');
  await page.getByRole('button', { name: 'Connect GitHub', exact: true }).click();
  await expect(page.locator('.github-sync [role="status"]')).toContainText('Synced with GitHub');
}
test('Pages: SQLite en navegador, persistencia, PDF y sincronización privada entre dos dispositivos', async ({
  page,
  browser,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  let remote: { sha: string; content: string } | undefined;
  let counter = 0,
    conflictOnce = false,
    remotePublic = false,
    blockNetwork = false;
  const files = new Map<string, { sha: string; content: string }>();
  const mock = async (context: BrowserContext) =>
    context.route('https://api.github.com/**', async (route) => {
      const request = route.request(),
        url = new URL(request.url());
      expect(request.headers().authorization).toBe('Bearer github-test-fixture-never-real');
      if (blockNetwork) {
        await route.abort();
        return;
      }
      if (url.pathname === '/repos/alejo02025/english-os-datos') {
        await route.fulfill({ json: { private: !remotePublic, permissions: { push: true } } });
        return;
      }
      const filename = url.pathname.split('/contents/english-os/')[1];
      let current = filename === 'state.json' ? remote : files.get(filename);
      if (request.method() === 'GET') {
        await route.fulfill(
          current
            ? {
                json: {
                  ...current,
                  size: Buffer.from(current.content, 'base64').length,
                  type: 'file',
                  encoding: 'base64',
                },
              }
            : { status: 404, json: { message: 'Not Found' } },
        );
        return;
      }
      const input = request.postDataJSON();
      if (conflictOnce || input.sha !== current?.sha) {
        conflictOnce = false;
        await route.fulfill({ status: 409, json: { message: 'Conflict' } });
        return;
      }
      current = { sha: `revision-${++counter}`, content: input.content };
      if (filename === 'state.json') remote = current;
      else files.set(filename, current);
      await route.fulfill({ json: { content: { sha: current.sha } } });
    });
  await mock(page.context());
  await page.goto('./');
  await ready(page);
  await go(page, 'Assessment');
  await page.getByText('am', { exact: true }).click();
  await page.getByRole('button', { name: 'Save answer', exact: true }).click();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.getByRole('button', { name: 'Save and leave', exact: true }).click();
  await page.reload();
  await go(page, 'Assessment');
  await expect(page.getByText('1 / 24 · answers saved', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Save and leave', exact: true }).click();
  await authorize(page);
  await go(page, 'Home');
  await go(page, 'PDF Studio');
  await page
    .getByLabel('Upload PDFs')
    .setInputFiles({
      name: 'Private travel PDF.pdf',
      mimeType: 'application/pdf',
      buffer: makePdf(),
    });
  await page.getByRole('tab', { name: /Private travel PDF/ }).click();
  await page.locator('.studio-outline summary').click();
  await page.getByRole('button', { name: 'Open full reader', exact: true }).click();
  await expect(page.getByText(/Last summer I travelled/)).toBeVisible();
  await preferences(page);
  await page.getByRole('button', { name: 'Sync now' }).click();
  await expect(page.locator('.github-sync [role="status"]')).toContainText('Synced with GitHub');
  expect(files.size).toBe(1);
  await go(page, 'Home');
  const phoneContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await mock(phoneContext);
  const phone = await phoneContext.newPage();
  phone.on('pageerror', (error) => errors.push(error.message));
  await phone.goto('http://127.0.0.1:3200/plataforma-ingles-uso-personal/');
  await authorize(phone);
  await phone.getByLabel('Your name').fill('Alejo sincronizado');
  conflictOnce = true;
  await phone.getByRole('button', { name: 'Save preferences', exact: true }).click();
  await preferences(phone);
  await expect(phone.getByLabel('Your name', { exact: true })).toHaveValue('Alejo sincronizado');
  await preferences(phone);
  await phone.getByRole('button', { name: 'Sync now' }).click();
  await expect(phone.locator('.github-sync [role="status"]')).toContainText('Synced with GitHub');
  await go(phone, 'Home');
  await preferences(page);
  await page.getByRole('button', { name: 'Sync now' }).click();
  await expect(page.locator('.github-sync [role="status"]')).toContainText('Synced with GitHub');
  await go(page, 'Home');
  await go(page, 'Home');
  await preferences(page);
  await expect(page.getByLabel('Your name', { exact: true })).toHaveValue('Alejo sincronizado');
  await go(phone, 'Library');
  await go(phone, 'PDF Studio');
  await phone.getByRole('tab', { name: /Private travel PDF/ }).click();
  await phone.locator('.studio-outline summary').click();
  await phone.getByRole('button', { name: 'Open full reader', exact: true }).click();
  await expect(phone.getByText(/Last summer I travelled/)).toBeVisible();
  const download = phone.waitForEvent('download');
  await phone.getByRole('link', { name: 'Download original PDF' }).click();
  expect((await download).suggestedFilename()).toBe('document.pdf');
  // Remote failure keeps local preferences; closing/reloading never retains the token.
  blockNetwork = true;
  await preferences(phone);
  await phone.getByLabel('Your name').fill('Alejo offline');
  await phone.getByRole('button', { name: 'Save preferences', exact: true }).click();
  await phone.reload();
  await preferences(phone);
  await expect(phone.getByLabel('Your name', { exact: true })).toHaveValue('Alejo offline');
  await preferences(phone);
  await expect(phone.getByLabel('GitHub token')).toHaveValue('');
  expect(await phone.evaluate(() => JSON.stringify(localStorage))).not.toContain(
    'github-test-fixture-never-real',
  );
  blockNetwork = false;
  const originalRemote = remote!;
  const corrupted = JSON.parse(Buffer.from(originalRemote.content, 'base64').toString('utf8'));
  const activity = corrupted.data.activities[0];
  activity.plan_id = 'missing-parent-plan';
  corrupted.clocks[`activities/${activity.id}`].plan_id = '9999999999999999:invalid-fixture';
  remote = {
    sha: 'corrupted-fixture',
    content: Buffer.from(JSON.stringify(corrupted)).toString('base64'),
  };
  const writesBefore = counter;
  await phone.getByLabel('GitHub token').fill('github-test-fixture-never-real');
  await phone.getByRole('button', { name: 'Connect GitHub', exact: true }).click();
  await expect(phone.getByRole('status')).toContainText('The GitHub history is invalid');
  expect(counter).toBe(writesBefore);
  await phone.getByRole('button', { name: 'Disconnect', exact: true }).click();
  remote = originalRemote;
  remotePublic = true;
  await phone.getByLabel('GitHub token').fill('github-test-fixture-never-real');
  await phone.getByRole('button', { name: 'Connect GitHub', exact: true }).click();
  await expect(phone.locator('p[role=alert]')).toContainText('private repository');
  expect(errors).toEqual([]);
  await phoneContext.close();
});
