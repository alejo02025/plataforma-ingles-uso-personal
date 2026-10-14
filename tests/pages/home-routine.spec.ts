import { test, expect } from '@playwright/test';
import { makeRoutine } from '../../src/lib/routine';
import { routineSentences } from '../../src/locales/learning/routine-content';
for (const pt of [false, true])
  test(`Home starters auto-save, resume offline and share the real CEFR journey (${pt ? 'PT' : 'EN'})`, async ({
    page,
    context,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(pt ? './portugues/' : './');
    await page
      .getByRole('dialog', { name: pt ? 'Palavra do dia' : 'Word of the Day' })
      .getByRole('button', { name: pt ? 'Fechar palavra do dia' : 'Close daily word' })
      .click();
    await page
      .getByRole('button', { name: pt ? 'Explorar meu dia' : 'Explore my day', exact: true })
      .click();
    await expect(page.locator('.offline-status summary')).toContainText(
      pt ? 'Pronto sem conexão' : 'Ready offline',
      { timeout: 90000 },
    );
    const path = page.locator('.home-routine'),
      level = pt ? 'A1' : 'A2';
    await expect(path).toContainText('¿Para qué entrar hoy?');
    await expect(page.locator('.daily-guide')).toContainText(
      'no necesitás empezar leyendo un artículo',
    );
    await expect(path.locator('.routine-path > li')).toHaveCount(5);
    await expect(path.locator('.routine-levels button').filter({ hasText: level })).toBeEnabled();
    await expect(path.locator('.routine-levels button').filter({ hasText: 'B1' })).toBeDisabled();
    expect(
      await page.evaluate(() =>
        Boolean(
          document
            .querySelector('.daily-guide')!
            .compareDocumentPosition(document.querySelector('.home-routine')!) &
            Node.DOCUMENT_POSITION_FOLLOWING,
        ),
      ),
    ).toBe(true);
    const dialog = page.getByRole('dialog', { name: pt ? 'Atividade guiada' : 'Guided activity' });
    const check = () =>
      dialog.getByRole('button', { name: pt ? 'Conferir' : 'Check', exact: true }).click();
    const next = () =>
      dialog.getByRole('button', { name: pt ? 'Continuar' : 'Continue', exact: true }).click();
    const back = () =>
      dialog
        .getByRole('button', { name: pt ? 'Voltar ao percurso' : 'Back to the path', exact: true })
        .click();
    const words = makeRoutine('vocabulary', level, 0, pt);
    await page.locator('.word-help-toggle').click();
    await path.locator('.routine-node').nth(0).locator('.routine-node-icon').click();
    await expect(dialog.locator('.picture-choices button')).toHaveCount(4);
    await page.screenshot({
      path: `/tmp/routine-pictures-${pt ? 'pt' : 'en'}.png`,
      fullPage: true,
    });
    for (let i = 0; i < words.rounds.length; i++) {
      const q = words.rounds[i];
      const choice = i === 0 ? q.choices.find((c) => c !== q.solution)! : q.solution;
      await dialog.getByRole('button', { name: choice, exact: true }).click();
      await check();
      await expect(dialog.locator('.answer-correction p[lang="es"]')).toBeVisible();
      await expect(dialog.locator('.answer-correction-model')).toContainText(q.solution);
      await next();
    }
    await expect(dialog.locator('.routine-finish')).toContainText('Guardado en tu progreso.');
    await expect(dialog.locator('.routine-score')).toHaveText('2 / 3');
    await back();
    if (await page.locator('.word-help-toggle').evaluate((e) => e.classList.contains('active')))
      await page.locator('.word-help-toggle').click();
    await expect(path.locator('.routine-node').nth(0)).not.toHaveClass(/done/);
    await path.locator('.routine-node').nth(0).click();
    for (const q of words.rounds) {
      await dialog.getByRole('button', { name: q.solution, exact: true }).click();
      await check();
      await next();
    }
    await expect(dialog.locator('.routine-finish')).toContainText('Guardado en tu progreso.');
    await back();
    await expect(path.locator('.routine-node').nth(0)).toHaveClass(/done/);
    await path.locator('.routine-node').nth(1).click();
    await dialog.locator('.routine-tiles button').first().click();
    await expect(dialog.locator('.routine-answer button')).toHaveCount(1);
    await dialog
      .getByRole('button', { name: pt ? 'Pausar atividade' : 'Pause activity', exact: true })
      .click();
    await context.setOffline(true);
    await page.reload();
    await path.locator('.routine-node').nth(2).click(); // An unfinished exercise is resumed before opening another.
    await expect(
      dialog.getByRole('heading', {
        name: pt ? 'Montar uma frase' : 'Build a sentence',
        exact: true,
      }),
    ).toBeVisible();
    await expect(dialog.locator('.routine-answer button')).toHaveCount(1);
    await dialog.locator('.routine-answer button').first().click();
    for (let i = 0; i < 3; i++) {
      const pieces = pt ? routineSentences[level][i].pt : routineSentences[level][i].en;
      for (const token of pieces)
        await dialog
          .locator('.routine-tiles')
          .getByRole('button', { name: token, exact: true })
          .click();
      await check();
      await next();
    }
    await expect(dialog.locator('.routine-finish')).toContainText('Guardado en tu progreso.');
    await back();
    await expect(path.locator('.routine-node').nth(1)).toHaveClass(/done/);
    const reading = makeRoutine('reading', level, 0, pt);
    await path.locator('.routine-node').nth(2).click();
    await expect(dialog.locator('.routine-reading')).toContainText(reading.text!);
    for (const q of reading.rounds) {
      await dialog.getByRole('button', { name: q.solution, exact: true }).click();
      await check();
      await next();
    }
    await expect(dialog.locator('.routine-finish')).toContainText('Guardado en tu progreso.');
    await back();
    await expect(path.locator('.routine-node').nth(2)).toHaveClass(/done/);
    await page.reload();
    await expect(path.locator('.routine-node.done')).toHaveCount(3);
    await expect(path.locator('.routine-levels button').filter({ hasText: 'B1' })).toBeDisabled();
    await path.locator('.routine-node').nth(3).click();
    await expect(page.locator('.lesson-room')).toBeVisible();
    await page.locator('.mobile-bottom-nav').getByRole('button').first().click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({ path: `/tmp/routine-home-${pt ? 'pt' : 'en'}.png`, fullPage: true });
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.screenshot({ path: `/tmp/routine-desktop-${pt ? 'pt' : 'en'}.png`, fullPage: true });
    expect(errors).toEqual([]);
  });
