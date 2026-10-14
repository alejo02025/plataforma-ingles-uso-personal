import { test, expect } from '@playwright/test';
import { englishClasses, portugueseClasses } from '../../src/locales/lessons/catalog';
import { glossary as enWords, readings as enReadings } from '../../src/lib/content';
import { glossary as ptWords, readings as ptReadings } from '../../src/locales/pt-BR/content';
import { englishCourseReadings } from '../../src/locales/learning/course-readings';
import { cefrReadings } from '../../src/lib/cefr-curriculum';
for (const pt of [false, true])
  test(`Connected course starts at ${pt ? 'A1' : 'A2'}, retains attempts and requires cross-section evidence (${pt ? 'PT' : 'EN'})`, async ({
    page,
  }) => {
    test.setTimeout(60000);
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    const catalog = pt ? portugueseClasses : englishClasses,
      level = pt ? 'A1' : 'A2',
      items = catalog.filter((l) => l.level === level);
    await page.goto(pt ? './portugues/' : './');
    await page
      .getByRole('dialog', { name: pt ? 'Palavra do dia' : 'Word of the Day' })
      .getByRole('button', { name: pt ? 'Fechar palavra do dia' : 'Close daily word' })
      .click();
    const classes = async () => {
      await page
        .getByRole('navigation', { name: pt ? 'Navegação principal' : 'Main navigation' })
        .getByRole('button', { name: pt ? 'Aulas' : 'Classes', exact: true })
        .click();
    };
    await classes();
    await expect(page.locator('.class-levels [aria-pressed="true"]')).toContainText(level);
    await page.locator('.class-levels').getByRole('button', { name: 'C2', exact: false }).click();
    await page.locator('.class-card').first().click();
    await expect(page.locator('.course-locked')).toContainText('nivel activo');
    await expect(page.locator('.lesson-room')).toHaveCount(0);
    await page
      .getByRole('button', { name: pt ? 'Voltar às aulas' : 'Back to classes', exact: true })
      .click();
    await page.locator('.class-levels').getByRole('button', { name: level, exact: true }).click();
    await page.locator('.class-card').nth(1).click();
    await expect(page.locator('.course-locked')).toContainText('Primero completá');
    await page
      .getByRole('button', { name: pt ? 'Voltar às aulas' : 'Back to classes', exact: true })
      .click();
    const practice = pt
      ? 'Eu estudo português e quero falar sobre minha rotina.'
      : 'I study English and want to talk about my daily routine.';
    for (let i = 0; i < 4; i++) {
      await page.locator('.class-card').nth(i).click();
      await expect(page.locator('.lesson-step > p[lang="es"]').first()).toBeVisible();
      for (const [j, q] of items[i].checks.entries())
        await page.locator('.lesson-check').nth(j).getByRole('radio').nth(q.answer).check();
      await page.getByLabel(pt ? 'Sua prática da aula' : 'Your class practice').fill(practice);
      if (i === 0) {
        await page.reload();
        await classes();
        await page.locator('.class-card').first().click();
        await expect(
          page.getByLabel(pt ? 'Sua prática da aula' : 'Your class practice'),
        ).toHaveValue(practice);
      }
      await page
        .getByRole('button', {
          name: pt ? 'Conferir e salvar minha aula' : 'Check and save my class',
          exact: true,
        })
        .click();
      await expect(page.locator('.lesson-saved > p')).toContainText('2 / 2');
      await page
        .getByRole('button', { name: pt ? 'Voltar às aulas' : 'Back to classes', exact: true })
        .click();
    }
    await page.locator('.class-card').nth(4).click();
    await expect(page.locator('.course-locked')).toContainText('lectura de tu nivel');
    await expect(page.locator('.course-locked [data-requirement="reading"]')).not.toHaveClass(
      /done/,
    );
    await page
      .getByRole('button', { name: pt ? 'Voltar às aulas' : 'Back to classes', exact: true })
      .click();
    await page.locator('.course-connected [data-requirement="writing"] button').click();
    await page
      .getByLabel(pt ? 'Sua resposta em português' : 'Your answer in English')
      .fill(practice);
    await page
      .getByRole('button', { name: pt ? 'Salvar e concluir' : 'Save and complete', exact: true })
      .click();
    await classes();
    await expect(page.locator('.course-connected [data-requirement="writing"]')).toHaveClass(
      /done/,
    );
    await page.locator('.course-connected [data-requirement="reading"] button').click();
    const title = await page.locator('.document-card h2').first().innerText();
    const reading = [
      ...(pt ? ptReadings : enReadings),
      ...(pt ? cefrReadings : englishCourseReadings),
    ].find((d) => d.title === title)!;
    await page.locator('.document-card').first().click();
    for (const q of reading.questions)
      await page.getByLabel(q.options[q.answer], { exact: true }).check();
    await page
      .getByRole('button', { name: pt ? 'Concluir leitura' : 'Complete reading', exact: true })
      .click();
    await classes();
    await expect(page.locator('.course-connected [data-requirement="reading"]')).toHaveClass(
      /done/,
    );
    await page
      .locator('.course-connected')
      .getByRole('button', { name: pt ? 'Jogos' : 'Games', exact: true })
      .click();
    await page.locator('.game-match').click();
    const dictionary = pt ? ptWords : enWords;
    for (let i = 0; i < 4; i++) {
      const meaning = await page.locator('.game-clue').innerText(),
        word = Object.entries(dictionary).find(([, v]) => v.meaning === meaning)![0];
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
    await expect(page.locator('.game-score')).toContainText('4 / 4');
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
    await classes();
    await expect(page.locator('.class-card').nth(4)).not.toHaveClass(/is-locked/);
    await page.locator('.class-card').nth(4).click();
    await expect(page.locator('.lesson-room')).toBeVisible();
    await page.reload();
    await classes();
    await page.locator('.class-card').nth(4).click();
    await expect(page.locator('.lesson-room')).toBeVisible();
    await page.setViewportSize({ width: 390, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({ path: `/tmp/connected-${pt ? 'pt' : 'en'}.png`, fullPage: true });
    expect(errors).toEqual([]);
  });
