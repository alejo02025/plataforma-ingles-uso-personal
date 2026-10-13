import { test, expect } from '@playwright/test';
import { makePdf } from '../pdf-fixture';

test('PDF tabs preserve each document, reading position, answers and chat drafts across uploads and reloads', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('./');
  const base = '/plataforma-ingles-uso-personal';
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute(
    'href',
    `${base}/assets/app/apple-touch-icon-v1.png`,
  );
  await expect(page.locator('meta[name="apple-mobile-web-app-title"]')).toHaveAttribute(
    'content',
    'English OS',
  );
  const manifestResponse = await page.request.get(`${base}/manifest.webmanifest`);
  expect(manifestResponse.ok()).toBe(true);
  const manifest = await manifestResponse.json();
  expect(manifest.start_url).toBe(`${base}/`);
  expect(manifest.scope).toBe(`${base}/`);
  expect(manifest.display).toBe('standalone');
  expect(
    manifest.icons.some(
      (icon: { purpose: string; sizes: string }) =>
        icon.purpose === 'maskable' && icon.sizes === '512x512',
    ),
  ).toBe(true);
  const appleResponse = await page.request.get(`${base}/assets/app/apple-touch-icon-v1.png`);
  expect(appleResponse.headers()['content-type']).toBe('image/png');
  const appleIcon = await appleResponse.body();
  expect(appleIcon.readUInt32BE(16)).toBe(180);
  expect(appleIcon.readUInt32BE(20)).toBe(180);
  await page
    .getByRole('dialog', { name: 'Word of the Day' })
    .getByRole('button', { name: 'Close daily word' })
    .click();
  await page.getByRole('navigation').getByRole('button', { name: 'PDF Studio' }).click();
  await page.getByLabel('Upload PDFs').setInputFiles({
    name: 'Railway notebook.pdf',
    mimeType: 'application/pdf',
    buffer: makePdf(
      Array.from(
        { length: 18 },
        (_, i) =>
          `Note ${i + 1}: Railway passengers check the timetable and buy tickets before their journey.`,
      ),
    ),
  });
  const railway = page.getByRole('tab', { name: 'Railway notebook', exact: true });
  await expect(railway).toHaveAttribute('aria-selected', 'true');
  await page
    .locator('.studio-reading-actions')
    .getByRole('button', { name: 'Next', exact: true })
    .click();
  await expect(page.getByText('Page 1 · Section 2', { exact: true })).toBeVisible();
  await page.locator('.studio-tabs').getByRole('button', { name: 'Practice', exact: true }).click();
  const firstQuestion = page.locator('.studio-question').first();
  await firstQuestion.locator('input[type=radio]').first().check();
  await firstQuestion.getByRole('button', { name: 'Check and save' }).click();
  await expect(firstQuestion.getByRole('status')).toBeVisible();
  const feedback = await firstQuestion.getByRole('status').innerText();
  await page
    .locator('.studio-question textarea')
    .fill('Passengers use a timetable to plan their railway journey.');
  await page.getByRole('button', { name: 'Chat', exact: true }).click();
  await page.getByLabel('Message your PDF tutor').fill('What do the passengers check?');
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.locator('.studio-message.assistant')).toHaveCount(1);
  await page
    .getByLabel('Message your PDF tutor')
    .fill('My unfinished question about railway tickets.');

  const chooser = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: 'Add PDF', exact: true }).click();
  await (
    await chooser
  ).setFiles([
    {
      name: 'Everyday finance.pdf',
      mimeType: 'application/pdf',
      buffer: makePdf([
        'A household budget helps people track their income and expenses.',
        'Regular savings can help pay for unexpected repairs.',
        'Bank fees reduce the money available for everyday purchases.',
      ]),
    },
    {
      name: 'Weekend travel notes and things I want to learn.pdf',
      mimeType: 'application/pdf',
      buffer: makePdf([
        'We visited a museum during our weekend trip.',
        'The tour guide explained the history of the city.',
        'We bought a map before exploring the neighbourhood.',
      ]),
    },
  ]);
  const tabs = page.getByRole('tablist', { name: 'Saved PDFs' });
  await expect(tabs.getByRole('tab')).toHaveCount(3);
  await expect(
    page.getByRole('tab', { name: 'Weekend travel notes and things I want to learn', exact: true }),
  ).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('.studio-passage')).toContainText('We visited a museum');

  const finance = page.getByRole('tab', { name: 'Everyday finance', exact: true });
  await finance.click();
  await expect(page.getByText('Page 1 · Section 1', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Chat', exact: true }).click();
  await expect(page.locator('.studio-message')).toHaveCount(0);
  await expect(page.getByLabel('Message your PDF tutor')).toHaveValue('');
  await page.getByLabel('Message your PDF tutor').fill('My unfinished question about savings.');
  await railway.click();
  await expect(page.getByLabel('Message your PDF tutor')).toHaveValue(
    'My unfinished question about railway tickets.',
  );
  await expect(page.locator('.studio-message.assistant')).toHaveCount(1);
  await page.locator('.studio-tabs').getByRole('button', { name: 'Read', exact: true }).click();
  await expect(page.getByText('Page 1 · Section 2', { exact: true })).toBeVisible();
  await page.locator('.studio-tabs').getByRole('button', { name: 'Practice', exact: true }).click();
  await expect(page.locator('.studio-question').first().getByRole('status')).toHaveText(feedback);
  await expect(page.locator('.studio-question textarea')).toHaveValue(
    'Passengers use a timetable to plan their railway journey.',
  );
  await finance.click();
  await expect(page.getByLabel('Message your PDF tutor')).toHaveValue(
    'My unfinished question about savings.',
  );
  await page.reload();
  await page.getByRole('navigation').getByRole('button', { name: 'PDF Studio' }).click();
  await expect(finance).toHaveAttribute('aria-selected', 'true');
  await expect(tabs.getByRole('tab')).toHaveCount(3);
  await expect(page.getByLabel('Message your PDF tutor')).toHaveValue(
    'My unfinished question about savings.',
  );
  await railway.click();
  await expect(page.locator('.studio-question textarea')).toHaveValue(
    'Passengers use a timetable to plan their railway journey.',
  );
  await expect(page.getByText('Page 1 · Section 2', { exact: true })).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  await expect
    .poll(() =>
      page.locator('.sidebar').evaluate((element) => element.getBoundingClientRect().right),
    )
    .toBeLessThanOrEqual(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  expect(await tabs.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true);
  await expect(page.getByRole('button', { name: 'Add PDF', exact: true })).toBeVisible();
  await railway.focus();
  await railway.press('End');
  await expect(tabs.getByRole('tab').last()).toHaveAttribute('aria-selected', 'true');
  await tabs.getByRole('tab').last().press('Home');
  await expect(railway).toHaveAttribute('aria-selected', 'true');
  await page.screenshot({ path: '/tmp/english-os-pdf-tabs-mobile.png', fullPage: true });
  await page.getByRole('button', { name: 'Move Railway notebook to Trash', exact: true }).click();
  await expect(tabs.getByRole('tab')).toHaveCount(2);
  await expect(railway).toHaveCount(0);
  await page.locator('.studio-trash summary').click();
  await expect(page.locator('.studio-trash-row')).toContainText('Railway notebook');
  await page.reload();
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.getByRole('navigation').getByRole('button', { name: 'PDF Studio' }).click();
  await expect(tabs.getByRole('tab')).toHaveCount(2);
  await page.locator('.studio-trash summary').click();
  await page
    .locator('.studio-trash-row')
    .filter({ hasText: 'Railway notebook' })
    .getByRole('button', { name: 'Restore', exact: true })
    .click();
  await expect(railway).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('.studio-question textarea')).toHaveValue(
    'Passengers use a timetable to plan their railway journey.',
  );
  await expect(page.getByText('Page 1 · Section 2', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Chat', exact: true }).click();
  await expect(page.locator('.studio-message.assistant')).toHaveCount(1);
  await expect(page.getByLabel('Message your PDF tutor')).toHaveValue(
    'My unfinished question about railway tickets.',
  );
  await page.getByRole('button', { name: 'Move Everyday finance to Trash', exact: true }).click();
  await expect(railway).toHaveAttribute('aria-selected', 'true');
  await page
    .locator('.studio-trash-notice')
    .getByRole('button', { name: 'Undo', exact: true })
    .click();
  await expect(finance).toHaveAttribute('aria-selected', 'true');
  await expect(tabs.getByRole('tab')).toHaveCount(3);
  for (const name of [
    'Railway notebook',
    'Everyday finance',
    'Weekend travel notes and things I want to learn',
  ]) {
    await page.getByRole('button', { name: `Move ${name} to Trash`, exact: true }).click();
  }
  await expect(tabs).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Choose PDFs', exact: true })).toBeEnabled();
  await page.locator('.studio-trash summary').click();
  await expect(page.locator('.studio-trash-row')).toHaveCount(3);
  await page
    .locator('.studio-trash-row')
    .filter({ hasText: 'Railway notebook' })
    .getByRole('button', { name: 'Restore', exact: true })
    .click();
  await expect(railway).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('.studio-message.assistant')).toHaveCount(1);
  await expect(page.getByLabel('Message your PDF tutor')).toHaveValue(
    'My unfinished question about railway tickets.',
  );
  expect(errors).toEqual([]);
});
