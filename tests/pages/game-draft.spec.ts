import { go, dailyWord, ready } from './navigation';
import { test, expect } from '@playwright/test';
import { glossary as en } from '../../src/lib/content';
import { glossary as ptGlossary } from '../../src/locales/pt-BR/content';
for (const pt of [false, true])
  test(`Updating preserves an unfinished game without crediting or duplicating it (${pt ? 'PT' : 'EN'})`, async ({
    page,
  }) => {
    await page.goto(pt ? './portugues/' : './');

    const games = () => go(page, 'Games');
    await games();
    await page.locator('.game-match').click();
    await page
      .getByRole('button', { name: pt ? 'Ver uma dica' : 'Get a hint', exact: true })
      .click();
    const clue = await page.locator('.game-clue').innerText(),
      dictionary = pt ? ptGlossary : en;
    const correct = Object.entries(dictionary).find(([, value]) => value.meaning === clue)![0];
    await page.locator('.game-choices').getByRole('button', { name: correct, exact: true }).click();
    await page
      .getByRole('button', { name: pt ? 'Verificar resposta' : 'Check answer', exact: true })
      .click();
    await go(page, 'Settings');
    await page
      .getByRole('button', { name: pt ? 'Atualizar aplicativo' : 'Update app', exact: true })
      .click();
    await expect(page).toHaveURL(/updated=/);
    await games();
    await expect(page.locator('.game-match')).toContainText(pt ? 'Retomar jogo' : 'Resume game');
    await expect(page.locator('.game-history')).toContainText(
      pt ? '0 jogos salvos' : '0 games saved',
    );
    await page.locator('.game-match').click();
    await expect(page.locator('.game-clue')).toHaveText(clue);
    await expect(page.locator('.game-choices button.selected')).toHaveText(correct);
    await expect(page.locator('.game-feedback')).toBeVisible();
    await expect(page.locator('.game-hint')).toBeVisible();
    await page
      .getByRole('button', { name: pt ? 'Próxima rodada' : 'Next round', exact: true })
      .click();
    for (let i = 1; i < 4; i++) {
      const meaning = await page.locator('.game-clue').innerText(),
        word = Object.entries(dictionary).find(([, value]) => value.meaning === meaning)![0];
      await page.locator('.game-choices').getByRole('button', { name: word, exact: true }).click();
      await page
        .getByRole('button', { name: pt ? 'Verificar resposta' : 'Check answer', exact: true })
        .click();
      await page
        .getByRole('button', {
          name:
            i === 3
              ? pt
                ? 'Ver meu resultado'
                : 'See my result'
              : pt
                ? 'Próxima rodada'
                : 'Next round',
          exact: true,
        })
        .click();
    }
    await page
      .getByRole('button', {
        name: pt ? 'Salvar resultado do jogo' : 'Save game result',
        exact: true,
      })
      .click();
    await expect(
      page.getByRole('button', {
        name: pt ? 'Salvo no seu progresso' : 'Saved to your progress',
        exact: true,
      }),
    ).toBeDisabled();
    await page.reload();
    await games();
    await expect(page.locator('.game-history')).toContainText(
      pt ? '1 jogos salvos' : '1 games saved',
    );
    await page.locator('.game-match').click();
    await expect(page.locator('.game-round-heading')).toContainText('1 / 4');
  });
