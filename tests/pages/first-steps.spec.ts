import { go, dailyWord, ready } from './navigation';
import { test, expect } from '@playwright/test';
import { diagnosticQuestions as en } from '../../src/lib/content';
import { diagnosticQuestions as ptQuestions } from '../../src/locales/pt-BR/content';
for (const pt of [false, true])
  test(`Today needs no tutorial and optional placement resumes without changing the course (${pt ? 'PT' : 'EN'})`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(pt ? './portugues/' : './');

    await ready(page);
    await expect(page.locator('.welcome-guide')).toHaveCount(0);
    await expect(page.locator('.today-focus .start-button')).toBeVisible();
    await go(page, 'Assessment');
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
    await go(page, 'Assessment');
    await expect(page.locator('.diagnostic-card')).toContainText(`1 / ${questions.length}`);
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
    await expect(page.locator('.placement-result')).toContainText(
      `${questions.filter((q) => q.band === 'A1').length} / ${questions.length}`,
    );
    await expect(page.locator('.placement-result')).toContainText(
      pt ? 'recorrido de clases sigue en A1' : 'recorrido de clases sigue en A2',
    );
    await page.reload();
    await go(page, 'Assessment');
    await expect(page.locator('.placement-result h2')).toHaveText('A1');
    await expect(page.getByRole('radio')).toHaveCount(0);
    await page
      .getByRole('button', { name: pt ? 'Ver meu percurso' : 'Go to my journey', exact: true })
      .click();
    await go(page, 'Home');
    await expect(page.locator('.welcome-guide')).toHaveCount(0);
    await ready(page);
    expect(errors).toEqual([]);
  });
