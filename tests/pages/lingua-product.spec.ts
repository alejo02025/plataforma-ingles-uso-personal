import { test, expect } from '@playwright/test';
import { ready } from './navigation';

for (const pt of [false, true]) {
  test(`Lingua interface: language identity, daily Spanish, grammar guide and sections (${pt ? 'PT' : 'EN'})`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(pt ? './portugues/' : './');
    await ready(page);

    // The current language has its own flag; both languages are available.
    const selector = page.locator('.mobile-language-switch');
    await expect(selector.getByRole('link')).toHaveCount(2);
    await expect(selector.locator('a[aria-current="page"]')).toContainText(pt ? '🇧🇷' : '🇬🇧');
    await expect(selector.getByRole('link', { name: '🇬🇧 English' })).toBeVisible();
    await expect(selector.getByRole('link', { name: '🇧🇷 Português brasileiro' })).toBeVisible();

    // Today's activity always has a native-language explanation followed by Spanish.
    await expect(page.locator('.today-primary-spanish[lang="es"]')).toBeVisible();
    await expect(
      page.locator('.today-focus p[lang="' + (pt ? 'pt-BR' : 'en') + '"]'),
    ).toBeVisible();
    await expect(page.locator('.today-journey-bar[role="progressbar"]')).toBeVisible();
    await expect(page.locator('.mobile-bottom-nav .bottom-emoji')).toHaveCount(5);
    await page.screenshot({
      path: `artifacts/redesign/qa/lingua-today-${pt ? 'pt' : 'en'}-390.png`,
      fullPage: true,
    });

    await page.locator('.mobile-bottom-nav').getByRole('button').nth(1).click();
    await expect(page.locator('.course-guide-inline')).toBeVisible();
    await expect(page.locator('.course-path-step')).toHaveCount(4);
    await expect(page.locator('.course-path-es[lang="es"]').first()).toBeVisible();
    await expect(page.locator('.course-path-icon')).toHaveCount(4);

    await page.locator('.course-path-checkpoint button').click();
    await expect(page.locator('.course-requirements')).toHaveAttribute('open', '');
    await expect(page.locator('.course-checklist')).toBeVisible();

    await page.locator('.course-path-step').first().getByRole('button').click();
    await expect(page.locator('.lesson-player-meter[role="progressbar"]')).toBeVisible();
    await expect(page.locator('.lesson-player-close')).toBeVisible();
    await expect(page.locator('.mobile-bottom-nav')).toBeHidden();
    await expect(page.locator('.mobile-masthead')).toBeHidden();
    await expect(page.locator('.workspace-heading h1')).toBeHidden();
    await expect(page.locator('.workspace-heading .section-tabs')).toBeHidden();
    await expect(page.locator('.skip-learning-link')).toBeHidden();
    await expect(page.locator('.workspace-heading .word-help-toggle')).toBeVisible();
    await page
      .getByRole('button', { name: pt ? 'Começar a prática' : 'Start the practice' })
      .click();
    await expect(page.locator('.lesson-check')).toHaveCount(1);
    await expect(page.locator('.lesson-option-text')).toHaveCount(3);
    await page.locator('.lesson-check input[type="radio"]').first().check();
    await page
      .getByRole('button', { name: pt ? 'Conferir esta resposta' : 'Check this answer' })
      .click();
    await expect(page.locator('.lesson-tip-popup')).toBeVisible();
    await page.getByRole('button', { name: pt ? 'Fechar dica' : 'Dismiss tip' }).click();
    await expect(page.locator('.lesson-tip-popup')).toHaveCount(0);
    await expect(page.locator('.lesson-prompt-es[lang="es"]')).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    await page.screenshot({
      path: `artifacts/redesign/qa/immersive-class-${pt ? 'pt' : 'en'}-390.png`,
      fullPage: true,
    });
    await page.locator('.lesson-player-close').click();

    await page.locator('.course-guide-inline').click();
    await expect(page.locator('.language-desk')).toBeVisible();
    await expect(page.locator('.sentence-shape')).toBeVisible();
    await expect(page.locator('.builder-label-es[lang="es"]')).toHaveCount(4);
    await expect(page.locator('.foundation-model > p[lang="es"]')).toBeVisible();
    await page.screenshot({
      path: `artifacts/redesign/qa/lingua-sentences-${pt ? 'pt' : 'en'}-390.png`,
      fullPage: true,
    });

    await page.locator('.mobile-bottom-nav').getByRole('button').nth(2).click();
    await expect(page.locator('.review-tools')).toBeVisible();
    await page.locator('.mobile-bottom-nav').getByRole('button').nth(3).click();
    await expect(page.locator('.studio-drop')).toBeVisible();
    await page
      .locator('.section-tabs')
      .getByRole('button', { name: pt ? 'Leituras' : 'Readings' })
      .click();
    await page.getByRole('button', { name: pt ? 'Adicionar texto' : 'Add text' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(
      page.getByRole('dialog').getByText(pt ? 'Texto em português' : 'Text in English'),
    ).toBeVisible();
    await expect(
      page
        .getByRole('dialog')
        .getByRole('button', { name: pt ? 'Fechar importação' : 'Close import' }),
    ).toBeVisible();
    await page
      .getByRole('dialog')
      .getByRole('button', { name: pt ? 'Fechar importação' : 'Close import' })
      .click();
    await page.locator('.mobile-bottom-nav').getByRole('button').nth(4).click();
    await expect(page.locator('.progress-overview')).toBeVisible();

    for (const width of [375, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      ).toBe(true);
    }
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(page.locator('.sidebar .nav-emoji')).toHaveCount(5);
    await expect(page.locator('.language-switcher a')).toHaveCount(2);
    await expect(page.locator('.language-switcher')).toBeInViewport();
    await page.locator('.sidebar .nav-primary').getByRole('button').first().click();
    await expect(page.locator('.today-primary-spanish[lang="es"]')).toBeVisible();
    await page.screenshot({
      path: `artifacts/redesign/qa/lingua-today-${pt ? 'pt' : 'en'}-1440.png`,
      fullPage: true,
    });
    expect(errors).toEqual([]);
  });
}
