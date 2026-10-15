import { test, expect } from '@playwright/test';
import { go, ready } from './navigation';
for (const pt of [false, true])
  test(`Today links to real work and Library preserves optional news reflection (${pt ? 'PT' : 'EN'})`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(pt ? './portugues/' : './');
    await ready(page);
    await expect(
      page.locator('.daily-guide,.welcome-guide,.daily-word-launcher,.stats-grid'),
    ).toHaveCount(0);
    const title = await page.locator('.today-focus h2').innerText();
    await page.locator('.start-button').click();
    await expect(page.locator('.lesson-heading')).toContainText(title);
    await go(page, 'News');
    const story = page.locator('.briefing-story').first();
    await expect(story).toBeVisible();
    await expect(story.locator('a')).toHaveAttribute('href', /^https:/);
    await story.locator('summary').click();
    const text = pt ? 'Eu aprendo sobre o mundo.' : 'I learn about the world.';
    await story.locator('textarea').fill(text);
    await page.reload();
    await go(page, 'News');
    await story.locator('summary').click();
    await expect(story.locator('textarea')).toHaveValue(text);
    await expect(story).toContainText(pt ? 'sem nota automática' : 'without an automatic grade');
    await go(page, 'Library');
    await page.locator('.document-card').first().click();
    await expect(page.locator('.reading-text')).toBeVisible();
    await go(page, 'Games');
    await page.locator('.game-match').click();
    await expect(page.locator('.game-session')).toBeVisible();
    await go(page, 'Settings');
    await page.getByLabel(pt ? 'Aparência' : 'Appearance', { exact: true }).selectOption('dark');
    await page
      .getByRole('button', { name: pt ? 'Salvar preferências' : 'Save preferences', exact: true })
      .click();
    await go(page, 'Home');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    for (const width of [390, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    }
    expect(errors).toEqual([]);
  });
