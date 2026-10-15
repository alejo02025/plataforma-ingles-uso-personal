import { test, expect } from '@playwright/test';
import { glossary as english } from '../../src/lib/content';
import { glossary as portuguese } from '../../src/locales/pt-BR/content';
for (const pt of [false, true])
  test(`Games persist real results and recall cards work on mobile (${pt ? 'Portuguese' : 'English'})`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(pt ? './portugues/' : './');
    const popup = page.getByRole('dialog', { name: pt ? 'Palavra do dia' : 'Word of the Day' });
    await popup
      .getByRole('button', { name: pt ? 'Salvar esta palavra' : 'Save this word', exact: true })
      .click();
    await popup
      .getByRole('button', { name: pt ? 'Fechar palavra do dia' : 'Close daily word' })
      .click();
    const quick = page.getByRole('navigation', {
      name: pt ? 'Navegação rápida' : 'Quick navigation',
    });
    await expect(page.locator('.guide-closing[lang="es"]')).toContainText('Tip:');
    await quick.getByRole('button', { name: pt ? 'Jogos' : 'Games', exact: true }).click();
    await page.screenshot({ path: `/tmp/playroom-${pt ? 'pt' : 'en'}-mobile.png`, fullPage: true });
    const dictionary = pt ? portuguese : english;
    for (const mode of ['match', 'sentence', 'trail']) {
      await page.locator(`.game-${mode}`).click();
      await page.locator('.game-help summary').click();
      await expect(page.locator('.game-help p')).toBeVisible();
      await page
        .getByRole('button', { name: pt ? 'Ver uma dica' : 'Get a hint', exact: true })
        .click();
      await expect(page.locator('.game-hint')).toBeVisible();
      if (mode === 'match') {
        for (let i = 0; i < 4; i++) {
          const meaning = await page.locator('.game-clue').innerText();
          const word = Object.entries(dictionary).find(
            ([, value]) => value.meaning === meaning,
          )![0];
          await page
            .locator('.game-choices')
            .getByRole('button', { name: word, exact: true })
            .click();
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
      } else if (mode === 'sentence') {
        for (let round = 0; round < 4; round++) {
          const buttons = page.locator('.sentence-pieces button');
          const pieces = await buttons.allTextContents();
          const example = Object.values(dictionary).find(
            (item) =>
              JSON.stringify(item.example.split(/\s+/).sort()) ===
              JSON.stringify([...pieces].sort()),
          )!.example;
          const used = new Set<number>();
          for (const word of example.split(/\s+/)) {
            const index = pieces.findIndex((value, i) => value === word && !used.has(i));
            used.add(index);
            await buttons.nth(index).click();
          }
          await page
            .getByRole('button', { name: pt ? 'Verificar resposta' : 'Check answer', exact: true })
            .click();
          await page
            .getByRole('button', {
              name:
                round === 3
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
      } else {
        const meaning = await page.locator('.game-clue').innerText();
        const word = Object.entries(dictionary).find(
          ([w, value]) => value.meaning === meaning && Array.from(w).length === 5,
        )![0];
        await page.getByLabel(pt ? 'Sua tentativa' : 'Your guess', { exact: true }).fill('a');
        await page
          .getByRole('button', { name: pt ? 'Verificar palavra' : 'Check word', exact: true })
          .click();
        await expect(
          page.getByRole('alert').filter({ hasText: pt ? 'cinco letras' : 'five letters' }),
        ).toBeVisible();
        await page.getByLabel(pt ? 'Sua tentativa' : 'Your guess', { exact: true }).fill(word);
        await page
          .getByRole('button', { name: pt ? 'Verificar palavra' : 'Check word', exact: true })
          .click();
      }
      await expect(
        page.getByText(pt ? 'Prática com dicas' : 'Practised with hints', { exact: true }),
      ).toBeVisible();
      await page.locator('.game-takeaways summary').click();
      await expect(page.locator('.game-takeaways > div')).toHaveCount(mode === 'trail' ? 1 : 4);
      await expect(page.locator('.game-score')).toHaveText(mode === 'trail' ? '1 / 1' : '4 / 4');
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
      await page
        .getByRole('button', {
          name: pt ? 'Escolher outro jogo' : 'Choose another game',
          exact: true,
        })
        .click();
    }
    await expect(page.locator('.game-history-row')).toHaveCount(3);
    await expect(page.locator('.assisted-label')).toHaveCount(3);
    await page.reload();
    await quick.getByRole('button', { name: pt ? 'Jogos' : 'Games', exact: true }).click();
    await expect(page.locator('.game-history-row')).toHaveCount(3);
    await quick.getByRole('button', { name: pt ? 'Revisar' : 'Review', exact: true }).click();
    await expect(page.locator('.recall-weak strong')).toHaveText('1');
    await page
      .getByRole('button', { name: pt ? 'Mostrar significado' : 'Show meaning', exact: true })
      .click();
    await page.getByRole('button', { name: pt ? 'Eu lembrei' : 'I remembered it' }).click();
    await expect(page.locator('.recall-growing strong')).toHaveText('1');
    await expect(page.locator('.recall-weak strong')).toHaveText('0');
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
      .toBe(true);
    await page.screenshot({ path: `/tmp/recall-${pt ? 'pt' : 'en'}-mobile.png`, fullPage: true });
    await quick.getByRole('button', { name: pt ? 'Progresso' : 'Progress', exact: true }).click();
    await expect(
      page.getByText(pt ? 'Palavra e significado' : 'Meaning Match', { exact: true }).first(),
    ).toBeVisible();
    expect(errors).toEqual([]);
  });
