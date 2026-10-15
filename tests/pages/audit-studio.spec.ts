import { go, dailyWord, ready } from './navigation';
import { test, expect } from '@playwright/test';
import { makePdf } from '../pdf-fixture';

for (const pt of [false, true]) {
  test(`PDF reading/tools panels retain drafts through section navigation and responsive layouts (${pt ? 'PT' : 'EN'})`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(pt ? './portugues/' : './');

    await go(page, pt ? 'Estúdio de PDFs' : 'PDF Studio');
    await page.getByLabel(pt ? 'Enviar PDFs' : 'Upload PDFs').setInputFiles({
      name: 'Context notebook.pdf',
      mimeType: 'application/pdf',
      buffer: makePdf(
        Array.from({ length: 18 }, (_, i) =>
          pt
            ? `Nota ${i + 1}: Os passageiros verificam os horários e compram passagens antes da viagem para a cidade.`
            : `Note ${i + 1}: Railway passengers check the timetable and buy tickets before their journey to the city.`,
        ),
      ),
    });
    await expect(page.locator('.studio-reading-pane')).toBeVisible();
    await expect(page.locator('.studio-tools-pane')).toBeVisible();
    const reading = await page.locator('.studio-reading-pane').boundingBox();
    const tools = await page.locator('.studio-tools-pane').boundingBox();
    expect(reading!.x + reading!.width).toBeLessThan(tools!.x);
    const practice = () =>
      page
        .locator('.studio-tabs')
        .getByRole('button', { name: pt ? 'Praticar' : 'Practice', exact: true })
        .click();
    const read = () =>
      page
        .locator('.studio-tabs')
        .getByRole('button', { name: pt ? 'Ler' : 'Read', exact: true })
        .click();
    await practice();
    const draft = pt
      ? 'Os passageiros compram as passagens antes de viajar.'
      : 'Passengers buy their tickets before travelling.';
    await page.locator('.studio-question textarea').fill(draft);
    await read();
    await page.locator('.studio-outline summary').click();
    await page.locator('.studio-sections button').nth(1).click();
    await practice();
    await expect(page.locator('.studio-question textarea')).toHaveValue('');
    await read();
    await page.locator('.studio-sections button').first().click();
    await practice();
    await expect(page.locator('.studio-question textarea')).toHaveValue(draft);
    await page.reload();
    await go(page, pt ? 'Estúdio de PDFs' : 'PDF Studio');
    await expect(page.locator('.studio-question textarea')).toHaveValue(draft);
    for (const width of [375, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 950 });
      await read();
      await expect(page.locator('.studio-reading-pane')).toBeVisible();
      if (width <= 980) await expect(page.locator('.studio-tools-pane')).toBeHidden();
      else await expect(page.locator('.studio-tools-pane')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      await page.screenshot({
        path: `artifacts/redesign/qa/studio-${pt ? 'pt' : 'en'}-${width}.png`,
        fullPage: true,
      });
      await practice();
      await expect(page.locator('.studio-tools-pane')).toBeVisible();
      if (width <= 980) await expect(page.locator('.studio-reading-pane')).toBeHidden();
      await expect(page.locator('.studio-question textarea')).toHaveValue(draft);
    }
    expect(errors).toEqual([]);
  });
}
