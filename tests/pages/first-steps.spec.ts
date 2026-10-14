import { test, expect } from '@playwright/test';
import { diagnosticQuestions as en } from '../../src/lib/content';
import { diagnosticQuestions as ptQuestions } from '../../src/locales/pt-BR/content';
for (const pt of [false, true])
  test(`First tutorial explains the day and placement resumes without changing the course (${pt ? 'PT' : 'EN'})`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(pt ? './portugues/' : './');
    await page
      .getByRole('dialog', { name: pt ? 'Palavra do dia' : 'Word of the Day' })
      .getByRole('button', { name: pt ? 'Fechar palavra do dia' : 'Close daily word' })
      .click();
    const welcome = page.getByRole('region', {
      name: pt ? 'Tutorial inicial' : 'First steps tutorial',
    });
    await expect(welcome).toContainText('Primero, encontrá');
    await welcome
      .getByRole('button', { name: pt ? 'Próxima dica' : 'Next tip', exact: true })
      .click();
    await expect(welcome).toContainText('sugerencia del día');
    await welcome
      .getByRole('button', { name: pt ? 'Próxima dica' : 'Next tip', exact: true })
      .click();
    await expect(welcome).toContainText('Verbos, tiempos');
    await welcome
      .getByRole('button', {
        name: pt ? 'Começar avaliação inicial' : 'Start the level check',
        exact: true,
      })
      .click();
    const questions = pt ? ptQuestions : en;
    await page
      .getByRole('radio', { name: questions[0].options[questions[0].answer], exact: true })
      .check();
    await page
      .getByRole('button', { name: pt ? 'Salvar resposta' : 'Save answer', exact: true })
      .click();
    await page
      .getByRole('button', { name: pt ? 'Salvar e sair' : 'Save and leave', exact: true })
      .click();
    await page.reload();
    await expect(page.locator('.welcome-guide')).toHaveCount(0);
    await page
      .getByRole('button', {
        name: pt ? 'Descobrir meu ponto de partida' : 'Find my starting point',
        exact: true,
      })
      .click();
    await expect(page.locator('.diagnostic-card')).toContainText('1 / 12');
    for (const q of questions.slice(1)) {
      // A1 correct; harder questions deliberately unknown: an honest beginner reference.
      const option = q.band === 'A1' ? q.options[q.answer] : q.options.at(-1)!;
      await page.getByRole('radio', { name: option, exact: true }).check();
      await page
        .getByRole('button', { name: pt ? 'Salvar resposta' : 'Save answer', exact: true })
        .click();
      await page.getByRole('button', { name: pt ? 'Próxima' : 'Next', exact: true }).click();
    }
    await expect(page.locator('.placement-result h2')).toHaveText('A1');
    await expect(page.locator('.placement-result')).toContainText('3 / 12');
    await expect(page.locator('.placement-result')).toContainText(
      pt ? 'recorrido de clases sigue en A1' : 'recorrido de clases sigue en A2',
    );
    await page.reload();
    await page
      .getByRole('button', {
        name: pt ? 'Descobrir meu ponto de partida' : 'Find my starting point',
        exact: true,
      })
      .click();
    await expect(page.locator('.placement-result h2')).toHaveText('A1');
    await expect(page.getByRole('radio')).toHaveCount(0);
    await page
      .getByRole('button', { name: pt ? 'Ver meu percurso' : 'Go to my journey', exact: true })
      .click();
    await page
      .locator('.home-small-links')
      .getByRole('button', { name: pt ? 'Como começar' : 'How to start', exact: true })
      .click();
    await expect(welcome).toBeVisible();
    await welcome
      .getByRole('button', { name: pt ? 'Explorar meu dia' : 'Explore my day', exact: true })
      .click();
    await expect(welcome).toHaveCount(0);
    expect(errors).toEqual([]);
  });
