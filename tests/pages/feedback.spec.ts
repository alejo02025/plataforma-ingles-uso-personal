import { test, expect } from '@playwright/test';
import { glossary as english } from '../../src/lib/content';
import { glossary as portuguese } from '../../src/locales/pt-BR/content';
import { makePdf } from '../pdf-fixture';
for (const pt of [false, true])
  test(`Incorrect answers explain why in Spanish before the target-language correction (${pt ? 'Portuguese' : 'English'})`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(pt ? './portugues/' : './');
    await page
      .getByRole('dialog', { name: pt ? 'Palavra do dia' : 'Word of the Day' })
      .getByRole('button', { name: pt ? 'Fechar palavra do dia' : 'Close daily word' })
      .click();
    await page
      .getByRole('navigation')
      .getByRole('button', { name: pt ? 'Jogos' : 'Games', exact: true })
      .click();
    const dictionary = pt ? portuguese : english;
    const lang = pt ? 'pt-BR' : 'en';
    for (const mode of ['match', 'sentence', 'trail']) {
      await page.locator(`.game-${mode}`).click();
      if (mode === 'match') {
        const clue = await page.locator('.game-clue').innerText();
        const solution = Object.entries(dictionary).find(([, item]) => item.meaning === clue)![0];
        const choices = page.locator('.game-choices button');
        const texts = await choices.allTextContents();
        await choices.nth(texts.findIndex((t) => t !== solution)).click();
        await page
          .getByRole('button', { name: pt ? 'Verificar resposta' : 'Check answer', exact: true })
          .click();
        await expect(page.locator('.game-feedback [lang="es"]')).toContainText(
          'La definición corresponde',
        );
        await expect(page.locator('.game-feedback .answer-correction-model')).toContainText(
          solution,
        );
      } else if (mode === 'sentence') {
        const buttons = page.locator('.sentence-pieces button');
        const pieces = await buttons.allTextContents();
        const example = Object.values(dictionary).find(
          (item) =>
            JSON.stringify(item.example.split(/\s+/).sort()) === JSON.stringify([...pieces].sort()),
        )!.example;
        const used = new Set<number>();
        for (const piece of example.split(/\s+/).reverse()) {
          const index = pieces.findIndex((p, i) => p === piece && !used.has(i));
          used.add(index);
          await buttons.nth(index).click();
        }
        await page
          .getByRole('button', { name: pt ? 'Verificar resposta' : 'Check answer', exact: true })
          .click();
        await expect(page.locator('.game-feedback [lang="es"]')).toContainText(
          'El orden no coincide',
        );
        await expect(page.locator('.game-feedback .answer-correction-model')).toContainText(
          example,
        );
      } else {
        const clue = await page.locator('.game-clue').innerText();
        const solution = Object.entries(dictionary).find(([, item]) => item.meaning === clue)![0];
        for (let i = 0; i < 6; i++) {
          await page.getByLabel(pt ? 'Sua tentativa' : 'Your guess', { exact: true }).fill('aaaaa');
          await page
            .getByRole('button', { name: pt ? 'Verificar palavra' : 'Check word', exact: true })
            .click();
          if (i === 0) {
            await expect(page.locator('.game-session [lang="es"]')).toContainText(
              'Todavía no es la palabra',
            );
            await expect(page.locator('.game-session .answer-correction')).toHaveCount(0);
          }
        }
        await expect(page.locator('.game-finish [lang="es"]')).toContainText(
          'Se terminaron los seis intentos',
        );
        await expect(page.locator('.game-finish .answer-correction-model')).toContainText(solution);
      }
      await expect(page.locator('.answer-correction-model')).toHaveAttribute('lang', lang);
      await page
        .getByRole('button', { name: pt ? 'Voltar aos jogos' : 'Back to games', exact: true })
        .click();
    }
    await page.goto(pt ? './portugues/' : './');
    await page
      .getByRole('button', {
        name: pt ? 'Descobrir meu ponto de partida' : 'Find my starting point',
        exact: true,
      })
      .click();
    await page.getByRole('radio').first().check();
    await page
      .getByRole('button', { name: pt ? 'Salvar resposta' : 'Save answer', exact: true })
      .click();
    await expect(page.locator('.feedback [lang="es"]')).toContainText(
      pt ? '“Ontem”' : '“Yesterday”',
    );
    await expect(page.locator('.feedback .answer-correction-model')).toContainText(
      pt ? 'fui' : 'took',
    );
    if (pt) {
      await page.goto('./portugues/');
      await page.getByRole('button', { name: 'Abrir aulas', exact: true }).click();
      await page.locator('.class-card').first().click();
      await page.locator('.lesson-check').first().getByRole('radio').first().check();
      await page.locator('.lesson-check').last().getByRole('radio').last().check();
      await page.getByRole('button', { name: 'Conferir e salvar minha aula', exact: true }).click();
      await expect(page.locator('.lesson-check').first().locator('[lang="es"]')).toContainText(
        'Con “eu”',
      );
      await expect(
        page.locator('.lesson-check').first().locator('.answer-correction-model'),
      ).toContainText('sou');
    }
    await page.goto(pt ? './portugues/' : './');
    await page
      .getByRole('navigation')
      .getByRole('button', { name: pt ? 'Estúdio de PDFs' : 'PDF Studio', exact: true })
      .click();
    const lines = pt
      ? [
          'Uma viagem curta pode ensinar muitas coisas sobre uma cidade.',
          'Jazmín visita uma livraria perto da praça para comprar livros.',
          'Ela conversa com uma amiga depois do passeio pelo bairro.',
        ]
      : [
          'A small journey can teach us something new about the world.',
          'The local museum showed how people lived a hundred years ago.',
          'I walked through the market and spoke to the friendly shop owners.',
        ];
    await page
      .getByLabel(pt ? 'Enviar PDFs' : 'Upload PDFs')
      .setInputFiles({ name: 'Practice.pdf', mimeType: 'application/pdf', buffer: makePdf(lines) });
    await expect(page.getByRole('tab', { name: 'Practice', exact: true })).toBeVisible();
    await page
      .getByRole('button', { name: pt ? 'Praticar' : 'Practice', exact: true })
      .last()
      .click();
    const q = page.locator('.studio-question').first();
    const radios = q.getByRole('radio');
    const all = await q.locator('.options label').allTextContents();
    // The exercise asks for the original word; select a distractor absent from the quoted sentence.
    const quoted = (await q.locator('h3').innerText()).split('“')[1]?.split('”')[0] || '';
    const original =
      lines.find((line) => line.includes(quoted.split('_____')[0])) || lines.join(' ');
    const correct = all.findIndex((option) =>
      new RegExp(`\\b${option.trim()}\\b`, 'iu').test(original),
    );
    await radios.nth(correct === 0 ? 1 : 0).check();
    await q
      .getByRole('button', { name: pt ? 'Conferir e salvar' : 'Check and save', exact: true })
      .click();
    await expect(q.locator('[lang="es"]')).toContainText('La consigna pide la palabra exacta');
    await expect(q.locator('.answer-correction-model')).toHaveAttribute('lang', lang);
    const correction = await q.locator('.answer-correction-model').innerText();
    await page.reload();
    await page
      .getByRole('navigation')
      .getByRole('button', { name: pt ? 'Estúdio de PDFs' : 'PDF Studio', exact: true })
      .click();
    await expect(
      page.locator('.studio-question').first().locator('.answer-correction-model'),
    ).toHaveText(correction);
    await page.setViewportSize({ width: 390, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    expect(errors).toEqual([]);
  });
