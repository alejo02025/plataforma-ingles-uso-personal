import { test, expect } from '@playwright/test';
import { go, ready } from './navigation';

for (const pt of [false, true])
  test(`Grammar reference shows the selected model, matching structure and saved choices (${pt ? 'PT' : 'EN'})`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(pt ? './portugues/' : './');
    await ready(page);
    await go(page, 'Language help');
    await expect(page.locator('.builder-label-es').first()).toHaveText('Tiempo verbal');
    await expect(page.locator('.builder-label-es').nth(1)).toHaveText(
      'Afirmativa, negativa o pregunta',
    );
    const time = page.getByLabel(pt ? 'Escolher um tempo' : 'Choose a time');
    const kind = page.getByLabel(pt ? 'Escolher um tipo de frase' : 'Choose a sentence type');
    const verb = page.getByLabel(pt ? 'Escolher um verbo' : 'Choose a verb');
    const subject = page.getByLabel(pt ? 'Escolher um sujeito' : 'Choose a subject');
    await time.selectOption('past');
    await kind.selectOption('negative');
    await verb.selectOption(pt ? 'pagar' : 'study');
    await subject.selectOption(pt ? 'eu' : 'she');
    await expect(page.locator('.foundation-model h3')).toHaveText(
      pt ? 'Eu não paguei a conta.' : 'She did not study English.',
    );
    await expect(page.locator('.foundation-model > p[lang="es"]')).toHaveText(
      pt ? 'Yo no pagué la cuenta.' : 'Ella no estudió inglés.',
    );
    await expect(page.locator('.builder-structure > p[lang="es"]')).toContainText(
      pt ? 'pretérito perfecto simple' : 'did + not + verbo en forma base',
    );
    await kind.selectOption('question');
    await expect(page.locator('.foundation-model h3')).toHaveText(
      pt ? 'Eu paguei a conta?' : 'Did she study English?',
    );
    await expect(page.locator('.builder-model-selection')).toContainText(
      pt ? 'Pergunta' : 'Question',
    );
    await page.locator('.builder-comparison > summary').click();
    await expect(page.locator('.builder-comparison-row')).toHaveCount(3);
    await expect(page.locator('.builder-comparison-row').nth(1)).toContainText(
      pt ? 'Eu não paguei a conta.' : 'She did not study English.',
    );
    await page.locator('.builder-comparison > summary').click();
    if (pt) {
      await verb.selectOption('construir');
      await time.selectOption('imperfect');
      await subject.selectOption('nos');
      await expect(page.locator('.foundation-model h3')).toHaveText('Nós construíamos uma casa?');
      await time.selectOption('infinitive');
      await expect(page.locator('.builder-structure')).toContainText('pretender no presente');
      await expect(page.locator('.builder-structure')).not.toContainText('tendo');
    } else {
      await time.selectOption('present-perfect');
      await expect(page.locator('.foundation-model h3')).toHaveText('Has she studied English?');
      await expect(page.locator('.builder-structure > p[lang="en"]')).toHaveText(
        'has + subject + past participle + complement + ?',
      );
      await time.selectOption('imperative');
      await subject.selectOption('we');
      await kind.selectOption('negative');
      await expect(page.locator('.foundation-model h3')).toHaveText("Let's not study English.");
      await expect(page.locator('.builder-structure > p[lang="en"]')).toHaveText(
        "let's + not + base verb + complement",
      );
    }
    const selected = await page.locator('.foundation-model h3').innerText();
    await expect(page.locator('.language-desk')).toHaveAttribute('translate', 'no');
    await page.reload();
    await ready(page);
    await go(page, 'Language help');
    await expect(page.locator('.foundation-model h3')).toHaveText(selected);
    for (const width of [375, 390, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      await page.screenshot({
        path: `artifacts/grammar-fix/${pt ? 'pt' : 'en'}-${width}.png`,
        fullPage: true,
      });
    }
    await page
      .getByRole('button', { name: pt ? '02 Todos os tempos' : '02 All tenses', exact: true })
      .click();
    await page.locator('.tense-card').first().locator('summary').click();
    await expect(page.locator('.tense-card').first().locator('.tense-example')).toHaveCount(3);
    await expect(
      page.locator('.tense-card').first().locator('.tense-example .study-spanish[lang="es"]'),
    ).toHaveCount(6);
    expect(errors).toEqual([]);
  });
