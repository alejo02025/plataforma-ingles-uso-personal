import { test, expect, type Page } from '@playwright/test';
import { makePdf } from '../pdf-fixture';
async function tapWord(page: Page, selector: string, word: string) {
  await page.locator(selector).scrollIntoViewIfNeeded();
  const point = await page.locator(selector).evaluate((element, word) => {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    let node: Node | null;
    while ((node = walker.nextNode())) {
      const text = node.textContent || '';
      const index = text.indexOf(word);
      if (index < 0) continue;
      const range = document.createRange();
      range.setStart(node, index);
      range.setEnd(node, index + word.length);
      const r = range.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }
    throw new Error('Word not found');
  }, word);
  await page.mouse.click(point.x, point.y);
}
for (const pt of [false, true])
  test(`Word clouds work across classes, PDF text and answer options, with Spanish support and verb/sentence tools (${pt ? 'Portuguese' : 'English'})`, async ({
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
    await page
      .getByRole('button', { name: pt ? 'Abrir aulas' : 'Open classes', exact: true })
      .click();
    await page
      .locator('.foundation-tabs')
      .getByRole('button', { name: pt ? 'Verbos' : 'Verbs', exact: true })
      .click();
    await expect(page.locator('.verb-table')).toContainText(pt ? 'estudou' : 'studied');
    await page
      .getByLabel(pt ? 'Escolher um sujeito' : 'Choose a subject')
      .selectOption(pt ? 'ela' : 'she');
    await page.getByLabel(pt ? 'Escolher um tempo' : 'Choose a time').selectOption('past');
    await expect(page.locator('.foundation-model h3')).toHaveText(
      pt ? 'Ela estudou português.' : 'She studied English.',
    );
    await page
      .getByLabel(pt ? 'Escolher um tipo de frase' : 'Choose a sentence type')
      .selectOption('question');
    await expect(page.locator('.foundation-model h3')).toHaveText(
      pt ? 'Ela estudou português?' : 'Did she study English?',
    );
    await page.getByLabel(pt ? 'Escolher um tempo' : 'Choose a time').selectOption('future');
    await expect(page.locator('.foundation-model h3')).toHaveText(
      pt ? 'Ela vai estudar português?' : 'Will she study English?',
    );
    const cloud = page.getByRole('dialog', { name: pt ? 'Ajuda com palavras' : 'Word help' });
    await page.locator('.verb-table tbody tr').first().locator('td button').nth(1).click();
    await expect(cloud).toBeVisible();
    await expect(cloud.locator('.word-cloud-meaning[lang="es"]')).toContainText('estudiar');
    await cloud
      .getByRole('button', { name: pt ? 'Fechar ajuda com palavras' : 'Close word help' })
      .click();
    await tapWord(page, '.foundation-model h3', pt ? 'estudar' : 'study');
    await expect(cloud).toBeVisible();
    await expect(cloud.locator('h2')).toHaveText(pt ? 'estudar' : 'study');
    await cloud
      .getByRole('button', {
        name: pt ? 'Salvar no vocabulário' : 'Save to vocabulary',
        exact: true,
      })
      .click();
    await expect(
      cloud.getByRole('button', {
        name: pt ? 'Salva no vocabulário' : 'Saved to vocabulary',
        exact: true,
      }),
    ).toBeDisabled();
    await cloud
      .getByRole('button', { name: pt ? 'Fechar ajuda com palavras' : 'Close word help' })
      .click();
    await page
      .locator('.foundation-tabs')
      .getByRole('button', { name: pt ? 'Frases' : 'Sentences', exact: true })
      .click();
    const field = page.getByLabel(pt ? 'Minha frase do dia' : 'My daily sentence');
    await field.fill(pt ? 'Eu vou estudar amanhã.' : 'I will study tomorrow.');
    await page.reload();
    await page
      .getByRole('button', { name: pt ? 'Abrir aulas' : 'Open classes', exact: true })
      .click();
    await page
      .locator('.foundation-tabs')
      .getByRole('button', { name: pt ? 'Frases' : 'Sentences', exact: true })
      .click();
    await expect(page.getByLabel(pt ? 'Minha frase do dia' : 'My daily sentence')).toHaveValue(
      pt ? 'Eu vou estudar amanhã.' : 'I will study tomorrow.',
    );
    await page
      .getByRole('button', {
        name: pt ? 'Praticar isso em uma aula' : 'Practise this in a class',
        exact: true,
      })
      .click();
    await expect(page.locator('.course-locked')).toBeVisible();
    await page
      .getByRole('button', { name: pt ? 'Voltar às aulas' : 'Back to classes', exact: true })
      .click();
    await page
      .locator('.class-levels')
      .getByRole('button', { name: pt ? 'A1' : 'A2', exact: true })
      .click();
    await page.locator('.class-card').first().click();
    await page
      .getByRole('button', { name: pt ? 'Começar a prática' : 'Start the practice', exact: true })
      .click();
    const label = page.locator('.lesson-check').first().locator('label').first();
    await page
      .getByRole('button', { name: pt ? 'Ajuda com palavras' : 'Word help', exact: true })
      .click();
    await cloud
      .getByRole('button', {
        name: pt ? 'Escolher uma palavra da página' : 'Pick a word from the page',
      })
      .click();
    await tapWord(page, '.lesson-check:first-of-type .options', pt ? 'é' : 'study');
    await expect(cloud).toBeVisible();
    await expect(label.getByRole('radio')).not.toBeChecked();
    await cloud
      .getByRole('button', { name: pt ? 'Fechar ajuda com palavras' : 'Close word help' })
      .click();
    await label.click();
    await expect(label.getByRole('radio')).toBeChecked();
    await page
      .getByRole('navigation')
      .getByRole('button', { name: pt ? 'Estúdio de PDFs' : 'PDF Studio', exact: true })
      .click();
    await page.getByLabel(pt ? 'Enviar PDFs' : 'Upload PDFs').setInputFiles({
      name: 'Words.pdf',
      mimeType: 'application/pdf',
      buffer: makePdf(
        pt
          ? [
              'Eu estudo português e gosto de ler um livro.',
              'A amizade ajuda a conhecer a cidade e encontrar uma casa.',
            ]
          : [
              'I study English and read a book every day.',
              'An umbrella can help when the rain starts in the city.',
            ],
      ),
    });
    await expect(page.getByRole('tab', { name: 'Words', exact: true })).toBeVisible();
    await tapWord(page, '.studio-passage', pt ? 'livro' : 'book');
    await expect(cloud).toBeVisible();
    await expect(cloud.locator('.word-cloud-meaning')).toContainText(pt ? 'Libro' : 'libro');
    await cloud
      .getByRole('button', { name: pt ? 'Fechar ajuda com palavras' : 'Close word help' })
      .click();
    await page
      .getByRole('button', { name: pt ? 'Ajuda com palavras' : 'Word help', exact: true })
      .click();
    await cloud
      .getByLabel(pt ? 'Palavra ou expressão' : 'Word or expression')
      .fill('zzzxnonexistent');
    await cloud
      .getByRole('button', { name: pt ? 'Consultar esta palavra' : 'Look up this word' })
      .click();
    await expect(cloud.locator('.word-cloud-meaning')).toContainText(
      'no tengo una traducción fiable',
    );
    await cloud
      .getByLabel(pt ? 'Significado pessoal em espanhol' : 'Personal Spanish meaning')
      .fill('Nota de prueba');
    await cloud
      .getByRole('button', {
        name: pt ? 'Salvar no vocabulário' : 'Save to vocabulary',
        exact: true,
      })
      .click();
    await expect(
      cloud.getByRole('button', {
        name: pt ? 'Salva no vocabulário' : 'Saved to vocabulary',
        exact: true,
      }),
    ).toBeDisabled();
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: `/tmp/word-cloud-${pt ? 'pt' : 'en'}-mobile.png` });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await cloud
      .getByRole('button', { name: pt ? 'Fechar ajuda com palavras' : 'Close word help' })
      .click();
    await page
      .getByRole('navigation', { name: pt ? 'Navegação rápida' : 'Quick navigation' })
      .getByRole('button', { name: pt ? 'Início' : 'Home', exact: true })
      .click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    expect(errors).toEqual([]);
  });
