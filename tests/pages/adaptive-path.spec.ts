import { test, expect } from '@playwright/test';
import { englishClasses, portugueseClasses } from '../../src/locales/lessons/catalog';
import { readings as enReadings } from '../../src/lib/content';
import { readings as ptReadings } from '../../src/locales/pt-BR/content';
import { englishCourseReadings } from '../../src/locales/learning/course-readings';
import { cefrReadings } from '../../src/lib/cefr-curriculum';
for (const pt of [false, true])
  test(`The flag, home and classroom share a reading reinforcement gate; Speaking is removed (${pt ? 'PT' : 'EN'})`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(pt ? './portugues/' : './');
    await page
      .getByRole('dialog', { name: pt ? 'Palavra do dia' : 'Word of the Day' })
      .getByRole('button', { name: pt ? 'Fechar palavra do dia' : 'Close daily word' })
      .click();
    const nav = page.getByRole('navigation', {
      name: pt ? 'Navegação principal' : 'Main navigation',
    });
    await expect(
      nav.getByRole('button', { name: pt ? 'Conversação' : 'Speaking', exact: true }),
    ).toHaveCount(0);
    const classes = () =>
      nav.getByRole('button', { name: pt ? 'Aulas' : 'Classes', exact: true }).click();
    await classes();
    await page.locator('.class-card').first().click();
    const first = (pt ? portugueseClasses : englishClasses).find(
      (l) => l.level === (pt ? 'A1' : 'A2'),
    )!;
    await page
      .getByRole('button', { name: pt ? 'Começar a prática' : 'Start the practice', exact: true })
      .click();
    for (const [i, q] of first.checks.entries()) {
      await page.locator(`.lesson-check input[value="${q.answer}"]`).check();
      await page
        .getByRole('button', {
          name: pt ? 'Conferir esta resposta' : 'Check this answer',
          exact: true,
        })
        .click();
      await page
        .getByRole('button', {
          name:
            i + 1 < first.checks.length
              ? pt
                ? 'Próxima pergunta'
                : 'Next question'
              : pt
                ? 'Aplicar à sua vida'
                : 'Apply it to your life',
          exact: true,
        })
        .click();
    }
    await page
      .getByRole('button', {
        name: pt ? 'Conferir e salvar minha aula' : 'Check and save my class',
        exact: true,
      })
      .click();
    async function read(correct: boolean) {
      await nav.getByRole('button', { name: pt ? 'Biblioteca' : 'Library', exact: true }).click();
      const title = await page.locator('.document-card h2').first().innerText();
      const doc = [
        ...(pt ? ptReadings : enReadings),
        ...(pt ? cefrReadings : englishCourseReadings),
      ].find((d) => d.title === title)!;
      await page.locator('.document-card').first().click();
      for (const q of doc.questions)
        await page
          .getByLabel(q.options[correct ? q.answer : (q.answer + 1) % q.options.length], {
            exact: true,
          })
          .check();
      await page
        .getByRole('button', { name: pt ? 'Concluir leitura' : 'Complete reading', exact: true })
        .click();
    }
    await read(false);
    await read(false);
    await nav.getByRole('button', { name: pt ? 'Início' : 'Home', exact: true }).click();
    await page.locator('.audit-explore-day > summary').click();
    await expect(page.locator('.daily-guide')).toContainText('Hoy conviene reforzar');
    await expect(page.locator('.home-routine')).toContainText('Necesitás reforzar lectura');
    await page
      .getByRole('button', {
        name: pt ? 'Escolher uma seção de estudo' : 'Choose a learning section',
        exact: true,
      })
      .click();
    const menu = page.getByRole('dialog', { name: pt ? 'Seções de estudo' : 'Learning sections' });
    await expect(menu.locator('.flag-next-step')).toContainText('Necesitás reforzar lectura');
    await expect(
      menu
        .locator('.course-category')
        .filter({ hasText: pt ? 'Leitura para a vida real' : 'Reading for real life' }),
    ).toContainText(pt ? 'Reforçar primeiro' : 'Reinforce first');
    await expect(menu.getByRole('button', { name: /Speaking|Fala e pronúncia/ })).toHaveCount(0);
    await menu
      .getByRole('button', {
        name: pt ? 'Abrir meu percurso' : 'Open my learning path',
        exact: true,
      })
      .click();
    await page.locator('.class-card').nth(1).click();
    await expect(page.locator('.course-locked')).toContainText('Necesitás reforzar lectura');
    await expect(page.locator('.lesson-room')).toHaveCount(0);
    await read(true);
    await classes();
    await expect(
      page.locator('.course-connected [data-requirement="reinforce:reading"]'),
    ).toHaveCount(0);
    await page.locator('.class-card').nth(1).click();
    await expect(page.locator('.lesson-room')).toBeVisible();
    await page.reload();
    await classes();
    await page.locator('.class-card').nth(1).click();
    await expect(page.locator('.lesson-room')).toBeVisible();
    expect(errors).toEqual([]);
  });
