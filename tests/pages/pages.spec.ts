import { test, expect } from '@playwright/test';
import { go, ready } from './navigation';
import { makePdf } from '../pdf-fixture';
import { readFile } from 'node:fs/promises';
for (const pt of [false, true])
  test(`Local-only backup restores history and PDFs on another device (${pt ? 'PT' : 'EN'})`, async ({
    page,
    browser,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const external: string[] = [];
    page.on('request', (r) => {
      if (!new URL(r.url()).hostname.match(/^(127\.0\.0\.1|localhost)$/)) external.push(r.url());
    });
    await page.goto(pt ? './portugues/' : './');
    await ready(page);
    await go(page, 'PDF Studio');
    await page
      .getByLabel(pt ? 'Enviar PDFs' : 'Upload PDFs')
      .setInputFiles({ name: 'Personal-test.pdf', mimeType: 'application/pdf', buffer: makePdf() });
    await expect(page.getByRole('tab', { name: /Personal-test/ })).toBeVisible();
    await go(page, 'Settings');
    const name = pt ? 'Seu nome' : 'Your name';
    await page.getByLabel(name, { exact: true }).fill('Backup fixture');
    await page
      .getByRole('button', { name: pt ? 'Salvar preferências' : 'Save preferences', exact: true })
      .click();
    const download = page.waitForEvent('download');
    await page
      .getByRole('button', {
        name: pt ? 'Exportar cópia completa' : 'Export full backup',
        exact: true,
      })
      .click();
    const backup = await download;
    const path = await backup.path();
    expect(path).toBeTruthy();
    const data = JSON.parse(await readFile(path!, 'utf8'));
    expect(data.workspace).toBe(pt ? 'pt' : 'en');
    expect(data.attachments.some((a: { key: string }) => a.key.startsWith('file:'))).toBe(true);
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const phone = await context.newPage();
    await phone.goto(
      `http://127.0.0.1:3200/plataforma-ingles-uso-personal/${pt ? 'portugues/' : ''}`,
    );
    await ready(phone);
    await go(phone, 'Settings');
    await phone
      .getByLabel(pt ? 'Restaurar cópia' : 'Restore backup', { exact: true })
      .setInputFiles(path!);
    await expect(phone.getByRole('dialog')).toBeVisible();
    // No replacement happens until explicit confirmation.
    await expect(phone.getByLabel(name, { exact: true })).not.toHaveValue('Backup fixture');
    await phone
      .getByRole('dialog')
      .getByRole('button', {
        name: pt ? 'Salvar cópia atual e substituir' : 'Back up current data & replace',
        exact: true,
      })
      .click();
    await expect(phone.getByRole('dialog')).toHaveCount(0);
    await expect(phone.getByLabel(name, { exact: true })).toHaveValue('Backup fixture');
    await phone.reload();
    await ready(phone);
    await go(phone, 'Settings');
    await expect(phone.getByLabel(name, { exact: true })).toHaveValue('Backup fixture');
    await expect(phone.locator('input[type="password"]')).toHaveCount(0);
    await go(phone, 'PDF Studio');
    await phone.getByRole('tab', { name: /Personal-test/ }).click();
    await phone.locator('.studio-outline summary').click();
    await phone
      .getByRole('button', { name: pt ? 'Abrir leitor completo' : 'Open full reader', exact: true })
      .click();
    await expect(phone.getByText(/Last summer I travelled/)).toBeVisible();
    for (const target of ['Home', 'Classes', 'Practice', 'PDF Studio', 'Progress']) {
      await go(phone, target);
      expect(await phone.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    }
    await phone.screenshot({
      path: `artifacts/redesign/qa/lingua-${pt ? 'pt' : 'en'}-mobile.png`,
      fullPage: true,
    });
    await go(page, 'Home');
    await page.screenshot({
      path: `artifacts/redesign/qa/lingua-${pt ? 'pt' : 'en'}-desktop.png`,
      fullPage: true,
    });
    expect(external).toEqual([]);
    await context.close();
  });
