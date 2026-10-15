import { test, expect } from '@playwright/test';
import { makeRoutine } from '../../src/lib/routine';
for (const pt of [false, true])
  test(`Contextual routine moves forward, varies retries and preserves separate paused drafts (${pt ? 'PT' : 'EN'})`, async ({
    page,
    context,
  }) => {
    test.setTimeout(120000);
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(pt ? './portugues/' : './');
    const daily = page.getByRole('dialog', { name: pt ? 'Palavra do dia' : 'Word of the Day' });
    await daily
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
    await expect(path.locator('.routine-path > li')).toHaveCount(5);
    await expect(path.locator('.routine-levels button').filter({ hasText: level })).toBeEnabled();
    await expect(path.locator('.routine-levels button').filter({ hasText: 'B1' })).toBeDisabled();
    await expect(path.locator('.routine-purpose.study-native')).toBeVisible();
    await expect(path.locator('.routine-purpose.study-spanish')).toContainText(
      '¿Para qué entrar hoy?',
    );
    const dialog = page.getByRole('dialog', { name: pt ? 'Atividade guiada' : 'Guided activity' });
    const check = () =>
      dialog.getByRole('button', { name: pt ? 'Conferir' : 'Check', exact: true }).click();
    const next = () =>
      dialog.getByRole('button', { name: pt ? 'Continuar' : 'Continue', exact: true }).click();
    const pause = () =>
      dialog
        .getByRole('button', { name: pt ? 'Pausar atividade' : 'Pause activity', exact: true })
        .click();
    const saved = () =>
      expect(dialog.locator('.routine-finish')).toContainText('Guardado en tu progreso.');
    const words = makeRoutine('vocabulary', level, 0, pt);
    await path.locator('.routine-node').nth(0).click();
    await expect(dialog.locator('.picture-choices button')).toHaveCount(4);
    await expect(dialog.locator('svg[viewBox="0 0 480 110"]')).toHaveCount(1);
    await expect(dialog.locator('.routine-reading').first()).toContainText(
      words.rounds[0].context!,
    );
    for (let i = 0; i < words.rounds.length; i++) {
      const q = words.rounds[i],
        choice = i < 2 ? q.choices.find((c) => c !== q.solution)! : q.solution;
      await dialog.getByRole('button', { name: choice, exact: true }).click();
      await check();
      await expect(dialog.locator('.answer-correction p[lang="es"]')).toBeVisible();
      await expect(dialog.locator('.answer-correction p.study-native')).toBeVisible();
      await next();
    }
    await saved();
    await expect(dialog.locator('.routine-score')).toHaveText('4 / 6');
    await dialog
      .getByRole('button', {
        name: pt ? 'Reforçar com outra sequência' : 'Reinforce with a new sequence',
        exact: true,
      })
      .click();
    const varied = makeRoutine('vocabulary', level, 0, pt, { edition: 2, variant: 1 });
    await expect(dialog.locator('.routine-reading').first()).toContainText(
      varied.rounds[0].context!,
    );
    expect(varied.rounds[0].context).not.toBe(words.rounds[0].context);
    for (const q of varied.rounds) {
      await dialog.getByRole('button', { name: q.solution, exact: true }).click();
      await check();
      await next();
    }
    await saved();
    await dialog
      .getByRole('button', {
        name: pt ? 'Próxima etapa: Montar uma frase' : 'Next step: Build a sentence',
        exact: true,
      })
      .click();
    await expect(
      dialog.getByRole('heading', {
        name: pt ? 'Montar uma frase' : 'Build a sentence',
        exact: true,
      }),
    ).toBeVisible();
    await dialog.locator('.routine-tiles button').first().click();
    await expect(dialog.locator('.routine-answer button')).toHaveCount(1);
    await pause();
    await context.setOffline(true);
    await page.reload();
    // Starting reading no longer hijacks the unfinished grammar draft.
    await path.locator('.routine-node').nth(2).click();
    await expect(
      dialog.getByRole('heading', {
        name: pt ? 'Entender uma situação' : 'Understand a situation',
        exact: true,
      }),
    ).toBeVisible();
    await pause();
    await path.locator('.routine-node').nth(1).click();
    await expect(dialog.locator('.routine-answer button')).toHaveCount(1);
    await dialog.locator('.routine-answer button').first().click();
    const grammar = makeRoutine('grammar', level, 0, pt);
    for (const q of grammar.rounds) {
      // Match original tiles with duplicates safely, using the currently enabled piece.
      let remaining = q.solution;
      const available = [...q.choices];
      while (available.length) {
        const token = available
          .filter((t) => remaining === t || remaining.startsWith(`${t} `))
          .sort((a, b) => b.length - a.length)[0];
        expect(token).toBeTruthy();
        await dialog
          .locator('.routine-tiles')
          .getByRole('button', { name: token, exact: true })
          .filter({ visible: true })
          .and(dialog.locator('button:enabled'))
          .first()
          .click();
        available.splice(available.indexOf(token), 1);
        remaining = remaining.slice(token.length).trimStart();
      }
      await check();
      await next();
    }
    await saved();
    await dialog
      .getByRole('button', {
        name: pt ? 'Próxima etapa: Entender uma situação' : 'Next step: Understand a situation',
        exact: true,
      })
      .click();
    const reading = makeRoutine('reading', level, 0, pt);
    for (const q of reading.rounds) {
      await expect(dialog.locator('.routine-reading').first()).toContainText(q.text!);
      await dialog.getByRole('button', { name: q.solution, exact: true }).click();
      await check();
      await next();
    }
    await saved();
    await dialog
      .getByRole('button', {
        name: pt ? 'Próxima etapa: Aprender e aplicar' : 'Next step: Learn and apply',
        exact: true,
      })
      .click();
    await expect(page.locator('.lesson-room')).toBeVisible();
    await page.locator('.mobile-bottom-nav').getByRole('button').first().click();
    await expect(path.locator('.routine-node.done')).toHaveCount(3);
    await page.reload();
    await expect(path.locator('.routine-node.done')).toHaveCount(3);
    await expect(path.locator('.routine-node').nth(0)).toContainText(pt ? 'Revisar' : 'Review');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({
      path: `artifacts/audit/after/routine-mobile-${pt ? 'pt' : 'en'}.png`,
      fullPage: true,
    });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.screenshot({
      path: `artifacts/audit/after/routine-desktop-${pt ? 'pt' : 'en'}.png`,
      fullPage: true,
    });
    expect(errors).toEqual([]);
  });
