import { test, expect } from '@playwright/test';
for (const pt of [false, true])
  test(`Language help and all-level notes stay unlocked without advancing the course (${pt ? 'PT' : 'EN'})`, async ({
    page,
    context,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(pt ? './portugues/' : './');
    await page
      .getByRole('dialog', { name: pt ? 'Palavra do dia' : 'Word of the Day' })
      .getByRole('button', { name: pt ? 'Fechar palavra do dia' : 'Close daily word' })
      .click();
    await expect(page.locator('.offline-status summary')).toContainText(
      pt ? 'Pronto sem conexão' : 'Ready offline',
      { timeout: 90000 },
    );
    await page
      .getByRole('button', {
        name: pt ? 'Escolher uma seção de estudo' : 'Choose a learning section',
        exact: true,
      })
      .click();
    const category = page
      .locator('.course-category')
      .filter({ hasText: pt ? 'Ajuda com o idioma' : 'Language help' });
    await expect(category).toContainText(pt ? 'Sempre disponível' : 'Always available');
    await category.click();
    await expect(page.locator('.toolkit-note')).toContainText('sin requisitos de nivel');
    await expect(page.locator('.sentence-shape')).toBeVisible();
    await page.getByLabel(pt ? 'Escolher um tempo' : 'Choose a time').selectOption('past');
    await page
      .getByLabel(pt ? 'Escolher um tipo de frase' : 'Choose a sentence type')
      .selectOption('negative');
    await expect(page.locator('.foundation-model h3')).toContainText(
      pt ? 'não estudei' : 'did not study',
    );
    await page
      .getByLabel(pt ? 'Escolher um tipo de frase' : 'Choose a sentence type')
      .selectOption('question');
    await expect(page.locator('.foundation-model h3')).toContainText(pt ? '?' : 'Did I study');
    await page
      .getByRole('button', { name: pt ? '01 Formar frases' : '01 Build sentences', exact: true })
      .click();
    await page.getByLabel(pt ? 'Escolher um tempo' : 'Choose a time').selectOption('future');
    await page
      .getByLabel(pt ? 'Escolher um tipo de frase' : 'Choose a sentence type')
      .selectOption('negative');
    await expect(page.locator('.foundation-model h3')).toContainText(
      pt ? 'não vou estudar' : 'will not study',
    );
    const timeSelect = page.getByLabel(pt ? 'Escolher um tempo' : 'Choose a time');
    await expect(timeSelect.locator('option')).toHaveCount(pt ? 26 : 23);
    await timeSelect.selectOption(pt ? 'subjunctive-future-perfect' : 'future-perfect-continuous');
    await expect(page.locator('.foundation-model h3')).toContainText(
      pt ? 'não tiver estudado' : 'will not have been studying',
    );
    await page.locator('.builder-comparison > summary').click();
    await expect(page.locator('.builder-comparison-row')).toHaveCount(3);
    await expect(page.locator('.builder-comparison-row').last()).toContainText('?');
    if (pt) {
      await timeSelect.selectOption('subjunctive-past');
      await page.getByLabel('Escolher um verbo').selectOption('fazer');
      await page.getByLabel('Escolher um sujeito').selectOption('nos');
      await expect(page.locator('.foundation-model h3')).toContainText('não fizéssemos');
      await page.getByLabel('Escolher um verbo').selectOption('estudar');
      await page.getByLabel('Escolher um sujeito').selectOption('eu');
    } else {
      await page.getByLabel('Choose a verb').selectOption('have');
      await expect(page.locator('.foundation-model [role="status"]')).toContainText(
        'expresa un estado',
      );
      await page.getByLabel('Choose a verb').selectOption('study');
    }
    await timeSelect.selectOption('imperative');
    await expect(
      page.getByLabel(pt ? 'Escolher um sujeito' : 'Choose a subject').locator('option'),
    ).toHaveCount(pt ? 3 : 2);
    await expect(page.locator('.foundation-model h3')).toContainText(
      pt ? 'Não estude' : 'Do not study',
    );
    await timeSelect.selectOption('past');
    await page
      .locator('.foundation-draft textarea')
      .fill('A reference draft that must survive reload.');
    await page
      .getByRole('button', { name: pt ? '02 Todos os tempos' : '02 All tenses', exact: true })
      .click();
    await expect(page.locator('.tense-card')).toHaveCount(pt ? 22 : 18);
    const advanced = page
      .locator('.tense-card')
      .filter({ hasText: pt ? 'Futuro composto do subjuntivo' : 'Future perfect continuous' });
    await advanced.locator('summary').click();
    await expect(advanced.locator('.tense-body')).toContainText(
      pt ? 'Quando eu tiver terminado' : 'will have been studying',
    );
    await expect(advanced.locator('.tense-tip')).toBeVisible();
    await page.getByRole('button', { name: pt ? '03 Verbos' : '03 Verbs', exact: true }).click();
    await expect(page.locator('.catalog-count')).toContainText(pt ? '2.415' : '7,100');
    await expect(page.locator('.verb-entry')).toHaveCount(30);
    await page.getByRole('searchbox').fill('respirar');
    const breathe = page
      .locator('.verb-entry')
      .filter({ hasText: pt ? 'respirar' : 'breathe' })
      .first();
    await breathe.locator('summary').first().click();
    await expect(breathe.locator('.verb-senses')).toContainText('respirar');
    await expect(page.locator('.course-locked')).toHaveCount(0);
    await page.locator('.toolkit-extra > summary').click();
    await page
      .getByRole('button', { name: pt ? 'Consulta rápida' : 'Quick reference', exact: true })
      .click();
    await page.locator('.grammar-reference-entry').nth(6).locator('summary').click();
    await expect(
      page.locator('.grammar-reference-entry').nth(6).locator('[lang="es"]'),
    ).toBeVisible();
    await expect(page.locator('.grammar-reference-entry').nth(6)).toContainText(
      pt ? 'tenho' : 'have/has',
    );
    await page
      .getByRole('button', { name: pt ? 'Notas de estudo' : 'Study notes', exact: true })
      .click();
    await page.getByLabel(pt ? 'Nível de consulta' : 'Reference level').selectOption('C2');
    await page.locator('.study-notes details').first().locator('summary').click();
    await expect(
      page.locator('.study-notes details').first().locator('[lang="es"]').first(),
    ).toBeVisible();
    await expect(page.locator('.course-locked')).toHaveCount(0);
    await context.setOffline(true);
    await page.reload();
    await page
      .getByRole('button', {
        name: pt ? 'Escolher uma seção de estudo' : 'Choose a learning section',
        exact: true,
      })
      .click();
    await page
      .locator('.course-category')
      .filter({ hasText: pt ? 'Ajuda com o idioma' : 'Language help' })
      .click();
    await expect(page.locator('.sentence-shape')).toBeVisible();
    await expect(page.locator('.foundation-draft textarea')).toHaveValue(
      'A reference draft that must survive reload.',
    );
    await page.getByRole('button', { name: pt ? '03 Verbos' : '03 Verbs', exact: true }).click();
    await expect(page.locator('.catalog-count')).toContainText(pt ? '2.415' : '7,100');
    await page.getByRole('searchbox').fill(pt ? 'estudar' : 'study');
    await expect(page.locator('.verb-entry').first()).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    await page.locator('.mobile-bottom-nav').getByRole('button').first().click();
    await expect(page.locator('.daily-guide')).toContainText(pt ? 'A1' : 'A2');
    await page
      .getByRole('button', { name: pt ? 'Abrir aulas' : 'Open classes', exact: true })
      .click();
    await page.locator('.class-levels').getByRole('button', { name: 'C2', exact: true }).click();
    await page.locator('.class-card').first().click();
    await expect(page.locator('.course-locked')).toBeVisible();
    expect(errors).toEqual([]);
  });
