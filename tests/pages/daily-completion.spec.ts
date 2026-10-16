import { test, expect } from '@playwright/test';
import { go, ready, finishRoutine, manifest } from './navigation';
import { englishClasses, portugueseClasses } from '../../src/locales/lessons/catalog';
for (const pt of [false, true])
  test(`A real daily sequence finishes once, survives reload and keeps course requirements (${pt ? 'PT' : 'EN'})`, async ({
    page,
  }) => {
    test.setTimeout(120000);
    await page.goto(pt ? './portugues/' : './');
    await ready(page);
    await expect(page.locator('.today-completion')).toContainText(pt ? '0 de 4' : '0 of 4');
    await page.locator('.start-button').click();
    const lesson = (pt ? portugueseClasses : englishClasses).find(
      (l) => l.level === (pt ? 'A1' : 'A2'),
    )!;
    await page
      .getByRole('button', { name: pt ? 'Começar a prática' : 'Start the practice', exact: true })
      .click();
    for (const [i, q] of lesson.checks.entries()) {
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
            i + 1 < lesson.checks.length
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
      .getByLabel(pt ? 'Sua prática da aula' : 'Your class practice')
      .fill(
        pt
          ? 'Eu estudo de manhã e trabalho à tarde.'
          : 'I study in the morning and work in the afternoon.',
      );
    await page
      .getByRole('button', {
        name: pt ? 'Conferir e salvar minha aula' : 'Check and save my class',
        exact: true,
      })
      .click();
    await expect(page.locator('.lesson-saved')).toBeVisible();
    await go(page, 'Home');
    await expect(page.locator('.today-completion')).toContainText(pt ? '1 de 4' : '1 of 4');
    const agenda = JSON.parse(
      (await manifest(page, pt)).data.activities.find((a: any) => a.id.startsWith('study-day:'))
        .payload,
    ).studyDay;
    for (const [i, task] of agenda.tasks.slice(1).entries()) {
      await page.locator('.start-button').click();
      if (task.action.kind === 'routine' && task.action.mode === 'writing') {
        await page
          .locator('.writing-box textarea')
          .fill(
            pt
              ? 'Eu estudo de manhã. Ontem li um livro. Amanhã vou trabalhar. Você estuda à noite?'
              : 'I study in the morning. Yesterday I read a book. Tomorrow I will work. Do you study at night?',
          );
        await page
          .getByRole('button', {
            name: pt ? 'Salvar e concluir' : 'Save and complete',
            exact: true,
          })
          .click();
        await expect(page.locator('.practice-card .feedback')).toBeVisible();
        await go(page, 'Home');
      } else if (task.action.kind === 'routine') {
        const dialog = await finishRoutine(page, pt, task.action.mode);
        await dialog
          .getByRole('button', { name: pt ? 'Voltar a hoje' : 'Back to today', exact: true })
          .click();
      } else
        throw new Error(`Unexpected task without a tested runner: ${JSON.stringify(task.action)}`);
      await expect(page.locator('.today-completion')).toContainText(
        pt ? `${i + 2} de 4` : `${i + 2} of 4`,
      );
    }
    await expect(page.locator('.today-finished h2')).toHaveText(
      pt ? 'Você terminou por hoje.' : "You're done for today.",
    );
    await expect(page.locator('.today-finished button')).toHaveCount(2);
    await expect(page.locator('.start-button')).toHaveCount(0);
    const before = (await manifest(page, pt)).data.results;
    expect(before).toHaveLength(4);
    await page.reload();
    await expect(page.locator('.today-finished')).toBeVisible();
    await page.locator('.today-duration select').selectOption('45');
    await expect(page.locator('.today-finished')).toBeVisible();
    expect((await manifest(page, pt)).data.results).toHaveLength(4);
    await go(page, 'Classes');
    await page.locator('.class-card').nth(1).click();
    await expect(page.locator('.lesson-room')).toBeVisible();
    await expect(
      page.getByRole('button', {
        name: pt ? 'Começar a prática' : 'Start the practice',
        exact: true,
      }),
    ).toBeVisible();
  });
for (const pt of [false, true])
  test(`Library keeps personal text import alongside the single PDF workspace (${pt ? 'PT' : 'EN'})`, async ({
    page,
  }) => {
    await page.goto(pt ? './portugues/' : './');
    await ready(page);
    await go(page, 'Library');
    await page
      .getByRole('button', { name: pt ? 'Adicionar texto' : 'Add text', exact: true })
      .click();
    const title = pt ? 'Meu texto pessoal' : 'My personal text';
    await page.getByLabel(pt ? 'Título' : 'Title', { exact: true }).fill(title);
    const text = pt
      ? 'Jazmín estuda português de manhã e conversa com uma amiga brasileira. Elas combinam um passeio pelo bairro e compram pão na padaria.'
      : 'Alejo studies English in the morning and talks with a colleague. They compare their plans for the week and arrange a visit to the local museum.';
    await page.locator('[role="dialog"] textarea').fill(text);
    await page
      .getByRole('button', {
        name: pt ? 'Adicionar à minha biblioteca' : 'Add to my library',
        exact: true,
      })
      .click();
    await page.locator('.level-filter input').uncheck();
    await page.locator('.document-card').filter({ hasText: title }).click();
    await expect(page.locator('.reading-text')).toContainText(text);
    await page.reload();
    await go(page, 'Library');
    await page.locator('.level-filter input').uncheck();
    await expect(page.locator('.document-card').filter({ hasText: title })).toBeVisible();
  });
