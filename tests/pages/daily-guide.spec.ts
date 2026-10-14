import { test, expect } from '@playwright/test';
for (const pt of [false, true])
  test(`Suggested Home route is optional, opens exact activities and saves news reflection (${pt ? 'PT' : 'EN'})`, async ({
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
    const guide = page.locator('.daily-guide');
    await expect(guide).toContainText(pt ? 'Uma sugestão' : 'A suggestion');
    await expect(guide.locator('.daily-guide-steps > li')).toHaveCount(4);
    expect(await page.locator('main section').first().getAttribute('class')).toContain(
      'daily-guide',
    );
    await expect(guide).toContainText(pt ? 'A1' : 'A2');
    const question = guide.locator('textarea');
    await expect(question).toBeVisible();
    await question.fill(pt ? 'Eu aprendo sobre o mundo.' : 'I learn about the world.');
    await page.reload();
    await expect(question).toHaveValue(
      pt ? 'Eu aprendo sobre o mundo.' : 'I learn about the world.',
    );
    const title = await guide.locator('li').nth(1).locator('strong').innerText();
    await guide
      .getByRole('button', {
        name: pt ? 'Abrir aula sugerida' : 'Open suggested class',
        exact: true,
      })
      .click();
    await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
    // Mobile navigation labels differ across editions; use the visible bottom Home button.
    await page.locator('.mobile-bottom-nav').getByRole('button').first().click();
    const words = await guide.locator('.guide-words span').allTextContents();
    await guide
      .getByRole('button', { name: pt ? 'Jogar a sugestão' : 'Play suggested game', exact: true })
      .click();
    await expect(page.locator('.game-session')).toBeVisible();
    await expect(page.locator('.game-session')).toContainText(words[0]);
    await page.locator('.mobile-bottom-nav').getByRole('button').first().click();
    await guide
      .getByRole('button', { name: pt ? 'Abrir leitura' : 'Open suggested reading', exact: true })
      .click();
    await expect(page.locator('.reading-text')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    expect(errors).toEqual([]);
  });
