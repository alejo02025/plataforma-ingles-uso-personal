import { test, expect } from '@playwright/test';
for (const pt of [false, true])
  test(`Classes teach with Spanish explanations, save real practice, retain drafts and adapt to phone screens (${pt ? 'Portuguese' : 'English'})`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(pt ? './portugues/' : './');
    await page
      .getByRole('dialog', { name: pt ? 'Palavra do dia' : 'Word of the Day' })
      .getByRole('button', { name: pt ? 'Fechar palavra do dia' : 'Close daily word' })
      .click();
    const open = async () => {
      await page
        .getByRole('button', { name: pt ? 'Abrir aulas' : 'Open classes', exact: true })
        .click();
      await expect(page.locator('.class-levels [aria-pressed="true"]')).toHaveText(
        pt ? 'A1' : 'A2',
      );
      await page
        .locator('.class-levels')
        .getByRole('button', { name: pt ? 'Todos os níveis' : 'All levels', exact: true })
        .click();
      await expect(page.locator('.class-card')).toHaveCount(10);
      await page.locator('.class-levels').getByRole('button', { name: 'A1', exact: true }).click();
      await page.locator('.class-card').first().click();
    };
    await open();
    await expect(page.locator('.lesson-step > p[lang="es"]').first()).toContainText(
      'Para presentarte',
    );
    await expect(page.locator('.lesson-pattern')).toHaveAttribute('lang', pt ? 'pt-BR' : 'en');
    await page.evaluate(() => {
      window.speechSynthesis.speak = (utterance) => {
        (window as unknown as { spoken: string }).spoken = utterance.lang;
      };
    });
    await page.locator('.lesson-example button').first().click();
    expect(await page.evaluate(() => (window as unknown as { spoken: string }).spoken)).toBe(
      pt ? 'pt-BR' : 'en-US',
    );
    await page.locator('.lesson-tip summary').click();
    await expect(page.locator('.lesson-tip [lang="es"]')).toBeVisible();
    await page.locator('.lesson-check').first().getByRole('radio').first().check();
    await page.locator('.lesson-check').last().getByRole('radio').nth(2).check();
    const practice = pt
      ? 'Meu nome é Jazmín. Eu sou argentina e moro em Buenos Aires.'
      : 'I’m Alejo. I’m from Argentina and I study English.';
    await page.getByLabel(pt ? 'Sua prática da aula' : 'Your class practice').fill(practice);
    await page.reload();
    await open();
    await expect(page.locator('.lesson-check').first().getByRole('radio').first()).toBeChecked();
    await expect(page.getByLabel(pt ? 'Sua prática da aula' : 'Your class practice')).toHaveValue(
      practice,
    );
    await page
      .getByRole('button', {
        name: pt ? 'Conferir e salvar minha aula' : 'Check and save my class',
        exact: true,
      })
      .click();
    await expect(page.locator('.lesson-saved > p')).toContainText('1 / 2');
    await expect(page.locator('.lesson-check').first().locator('[lang="es"]')).toContainText(
      pt ? 'Con “eu”' : 'El sujeto es “I”',
    );
    await expect(
      page.locator('.lesson-check').first().locator('.answer-correction-model'),
    ).toHaveText(pt ? 'Correção: Eu sou argentina.' : 'Correction: I am from Argentina.');
    await page.screenshot({ path: `/tmp/classes-${pt ? 'pt' : 'en'}-desktop.png`, fullPage: true });
    await page.reload();
    await open();
    await expect(page.locator('.lesson-saved > p')).toContainText('1 / 2');
    await expect(page.getByLabel(pt ? 'Sua prática da aula' : 'Your class practice')).toHaveValue(
      practice,
    );
    await page
      .getByRole('button', { name: pt ? 'Praticar novamente' : 'Try again later', exact: true })
      .click();
    await page.locator('.lesson-check').first().getByRole('radio').nth(1).check();
    await page.locator('.lesson-check').last().getByRole('radio').nth(2).check();
    await page
      .getByRole('button', {
        name: pt ? 'Conferir e salvar minha aula' : 'Check and save my class',
        exact: true,
      })
      .click();
    await expect(page.locator('.lesson-saved > p')).toContainText('2 / 2');
    await expect(page.locator('.lesson-saved > p')).toContainText(
      pt ? 'Prática da aula salva' : 'Class practice saved',
    );
    await page
      .getByRole('button', { name: pt ? 'Voltar às aulas' : 'Back to classes', exact: true })
      .click();
    await expect(page.locator('.classes-count strong')).toHaveText('1 / 10');
    await expect(page.locator('.class-card').first()).toContainText('2 / 2');
    await page.locator('.class-method summary').click();
    await expect(page.locator('.class-method a')).toHaveCount(3);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('.class-card').first().click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await expect
      .poll(() => page.locator('.sidebar').evaluate((e) => e.getBoundingClientRect().right))
      .toBeLessThanOrEqual(1);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: `/tmp/classes-${pt ? 'pt' : 'en'}-mobile.png` });
    await page
      .getByRole('navigation', { name: pt ? 'Navegação rápida' : 'Quick navigation' })
      .getByRole('button', { name: pt ? 'Progresso' : 'Progress', exact: true })
      .click();
    const entries = page
      .locator('.momentum-entry')
      .filter({ hasText: pt ? 'Meu nome, minha história' : 'A little about me' });
    await expect(entries).toHaveCount(2);
    await entries.first().locator('summary').click();
    await expect(entries.first().locator('blockquote')).toHaveText(practice);
    await expect(entries.first().locator('[lang="es"]')).toContainText(
      pt ? 'Con “eu”' : 'El sujeto es “I”',
    );
    expect(errors).toEqual([]);
  });
