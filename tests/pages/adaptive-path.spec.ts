import { go, dailyWord, ready } from './navigation';
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
      await go(page, pt ? 'Biblioteca' : 'Library');
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
    await go(page, pt ? 'Início' : 'Home');
    await classes();
    await page.locator('.course-requirements > summary').click();
    await expect(page.locator('[data-requirement="reinforce:reading"]')).toContainText(
      'Necesitás reforzar lectura',
    );
    await page.locator('.class-card').nth(1).click();
    await expect(page.locator('.course-locked')).toContainText('Necesitás reforzar lectura');
    await expect(page.locator('.lesson-room')).toHaveCount(0);
    await read(true);
    await classes();
    await expect(
      page.locator('.course-requirements [data-requirement="reinforce:reading"]'),
    ).toHaveCount(0);
    await page.locator('.class-card').nth(1).click();
    await expect(page.locator('.lesson-room')).toBeVisible();
    await page.reload();
    await classes();
    await page.locator('.class-card').nth(1).click();
    await expect(page.locator('.lesson-room')).toBeVisible();
    expect(errors).toEqual([]);
  });
