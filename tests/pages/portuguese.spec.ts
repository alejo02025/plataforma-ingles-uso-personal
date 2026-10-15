import { go, dailyWord, ready } from './navigation';
import { test, expect } from '@playwright/test';
import { makePdf } from '../pdf-fixture';

test('Jazmín has Brazilian Portuguese study content, independent PDFs, vocabulary, voice and progress', async ({
  page,
}) => {
  test.setTimeout(180000);
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('./');
  await ready(page);

  await go(page, 'PDF Studio');
  await page
    .getByLabel('Upload PDFs')
    .setInputFiles({ name: 'Alejo only.pdf', mimeType: 'application/pdf', buffer: makePdf() });
  await expect(page.getByRole('tab', { name: 'Alejo only', exact: true })).toBeVisible();
  await page
    .getByRole('link', { name: '🇧🇷 Português brasileiro', exact: true })
    .filter({ visible: true })
    .click();
  await expect(page).toHaveURL(/\/portugues\/(?:\?|$)/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
  await ready(page);
  await dailyWord(page);
  const popup = page.getByRole('dialog', { name: 'Palavra do dia' });
  await expect(popup).toBeVisible();
  const word = await popup.getByRole('heading').innerText();
  await popup.getByRole('button', { name: 'Salvar esta palavra' }).click();
  await expect(popup.getByRole('button', { name: 'Salva no vocabulário' })).toBeVisible();
  await popup.getByRole('button', { name: 'Meu vocabulário' }).click();
  await expect(page.getByRole('heading', { name: word, exact: true }).first()).toBeVisible();
  await go(page, 'Biblioteca');
  await page.locator('.level-filter input').uncheck();
  await expect(page.getByRole('button', { name: /Uma cidade descoberta a pé/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /The city you discover/ })).toHaveCount(0);
  await go(page, 'Estúdio de PDFs');
  await expect(page.getByRole('tablist')).toHaveCount(0);
  await page.getByLabel('Enviar PDFs').setInputFiles({
    name: 'Café da Jazmín.pdf',
    mimeType: 'application/pdf',
    buffer: makePdf([
      'A cidade tem um café aconchegante perto da praça.',
      'Jazmín chegou de ônibus para conversar com uma amiga.',
      'Elas compraram pão de queijo e pediram um café.',
      'O passeio pela vizinhança foi tranquilo e cheio de curiosidade.',
    ]),
  });
  await expect(page.getByRole('tab', { name: 'Café da Jazmín', exact: true })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Alejo only', exact: true })).toHaveCount(0);
  await expect(page.locator('.studio-passage')).toContainText('café aconchegante');
  await page.evaluate(() => {
    const captured = window as unknown as { spokenLocale?: string };
    window.speechSynthesis.speak = (utterance) => {
      captured.spokenLocale = utterance.lang;
    };
  });
  await go(page, 'Vocabulário');
  await page
    .getByRole('button', { name: `Ouvir ${word}`, exact: true })
    .first()
    .click();
  expect(
    await page.evaluate(() => (window as unknown as { spokenLocale: string }).spokenLocale),
  ).toBe('pt-BR');
  await go(page, 'Estúdio de PDFs');
  await page.getByRole('button', { name: 'Praticar', exact: true }).last().click();
  const choice = page.locator('.studio-question').first();
  await expect(choice).toContainText('Complete esta frase');
  await expect(choice).toContainText('_____');
  await choice.locator('input[type=radio]').first().check();
  await choice.getByRole('button', { name: 'Conferir e salvar' }).click();
  await expect(choice.getByRole('status')).toBeVisible();
  await page
    .locator('.studio-question textarea')
    .fill('Jazmín chegou de ônibus e tomou um café com sua amiga.');
  await page
    .locator('.studio-question')
    .last()
    .getByRole('button', { name: 'Conferir e salvar' })
    .click();
  await expect(page.getByText(/não recebeu nota automática/)).toBeVisible();
  await page.getByRole('button', { name: 'Conversa', exact: true }).click();
  await page.getByLabel('Mensagem para seu tutor de PDF').fill('Onde fica o café?');
  await page.getByRole('button', { name: 'Enviar mensagem' }).click();
  await expect(page.locator('.studio-message.assistant').last()).toContainText(
    'Aqui está o trecho',
  );
  await expect(page.locator('.studio-message.assistant').last()).toContainText('praça');
  await page.getByRole('button', { name: 'Ativar IA local', exact: true }).click();
  await expect(page.locator('.studio-ai-state')).toHaveText('IA local', { timeout: 90000 });
  await page.getByLabel('Mensagem para seu tutor de PDF').fill('Onde fica o café?');
  await page.getByRole('button', { name: 'Enviar mensagem' }).click();
  await expect(page.getByRole('button', { name: 'Parar resposta' })).toHaveCount(0, {
    timeout: 90000,
  });
  await expect(page.locator('.studio-message.assistant')).toHaveCount(2, { timeout: 90000 });
  const reply = page.locator('.studio-message.assistant').last();
  await expect(reply).toContainText('O texto diz:');
  await expect(reply).toContainText('praça');
  await expect(reply).not.toContainText('The passage');
  await page
    .getByRole('button', { name: 'Mover Café da Jazmín para a Lixeira', exact: true })
    .click();
  await expect(page.getByRole('tablist')).toHaveCount(0);
  await page.locator('.studio-trash summary').click();
  await page.getByRole('button', { name: 'Restaurar', exact: true }).click();
  await expect(page.locator('.studio-message.assistant')).toHaveCount(2);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await expect
    .poll(() =>
      page.locator('.sidebar').evaluate((element) => element.getBoundingClientRect().right),
    )
    .toBeLessThanOrEqual(1);
  await page.screenshot({ path: '/tmp/portugues-jazmin-mobile.png', fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await go(page, 'Início');
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await page.screenshot({ path: '/tmp/portugues-jazmin-home.png', fullPage: true });
  await go(page, 'Assessment');
  await page.getByRole('radio', { name: 'sou', exact: true }).check();
  await page.getByRole('button', { name: 'Salvar resposta', exact: true }).click();
  await expect(page.getByText('Muito bem.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Próxima', exact: true }).click();
  await page.getByRole('button', { name: 'Salvar e sair', exact: true }).click();
  await go(page, 'Settings');
  await page
    .locator('.settings-info')
    .getByRole('link', { name: '🇬🇧 English', exact: true })
    .click();
  await ready(page);
  await expect(page.getByRole('dialog', { name: 'Word of the Day' })).toHaveCount(0);
  await go(page, 'PDF Studio');
  await expect(page.getByRole('tab', { name: 'Alejo only', exact: true })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Café da Jazmín', exact: true })).toHaveCount(0);
  await go(page, 'Vocabulary');
  await expect(page.getByRole('heading', { name: word, exact: true })).toHaveCount(0);
  await page.goto('./portugues/');
  await go(page, 'Assessment');
  await expect(page.getByText('1 / 24 · respostas salvas', { exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test('English and Portuguese sync to different folders even in the same private GitHub repository', async ({
  page,
}) => {
  const files = new Map<string, { sha: string; content: string }>();
  let revision = 0;
  await page.route('https://api.github.com/**', async (route) => {
    const request = route.request(),
      url = new URL(request.url());
    expect(request.headers().authorization).toBe('Bearer study-spaces-test-never-real');
    if (url.pathname === '/repos/alejo02025/shared-study-data') {
      await route.fulfill({ json: { private: true, permissions: { push: true } } });
      return;
    }
    const file = url.pathname.split('/contents/')[1];
    expect(file).toMatch(/^(english-os|portuguese-os)\//);
    const current = files.get(file);
    if (request.method() === 'GET') {
      await route.fulfill(
        current
          ? {
              json: {
                ...current,
                type: 'file',
                encoding: 'base64',
                size: Buffer.from(current.content, 'base64').length,
              },
            }
          : { status: 404, json: { message: 'Not Found' } },
      );
      return;
    }
    const payload = request.postDataJSON();
    if (payload.sha !== current?.sha) {
      await route.fulfill({ status: 409, json: { message: 'Conflict' } });
      return;
    }
    const next = { sha: `revision-${++revision}`, content: payload.content };
    files.set(file, next);
    await route.fulfill({ json: { content: { sha: next.sha } } });
  });
  await page.goto('./');
  await dailyWord(page);
  const englishWord = page.getByRole('dialog', { name: 'Word of the Day' });
  const en = await englishWord.getByRole('heading').innerText();
  await englishWord.getByRole('button', { name: 'Save this word' }).click();
  await englishWord.getByRole('button', { name: 'Close daily word' }).click();
  await go(page, 'Settings');
  await page.getByLabel('Private repository').fill('alejo02025/shared-study-data');
  await page.getByLabel('GitHub token').fill('study-spaces-test-never-real');
  await page.getByRole('button', { name: 'Connect GitHub', exact: true }).click();
  await expect(page.locator('.github-sync [role="status"]')).toContainText('Synced with GitHub');
  const englishState = files.get('english-os/state.json')!.content;
  expect(JSON.parse(Buffer.from(englishState, 'base64').toString()).workspace).toBe('en');
  await go(page, 'Home');
  await page
    .getByRole('link', { name: '🇧🇷 Português brasileiro', exact: true })
    .filter({ visible: true })
    .click();
  await dailyWord(page);
  const portugueseWord = page.getByRole('dialog', { name: 'Palavra do dia' });
  const pt = await portugueseWord.getByRole('heading').innerText();
  await portugueseWord.getByRole('button', { name: 'Salvar esta palavra' }).click();
  await portugueseWord.getByRole('button', { name: 'Fechar palavra do dia' }).click();
  await go(page, 'Settings');
  await page.getByLabel('Repositório privado').fill('alejo02025/shared-study-data');
  await page.getByLabel('Token do GitHub').fill('study-spaces-test-never-real');
  await page.getByRole('button', { name: 'Conectar GitHub', exact: true }).click();
  await expect(page.locator('.github-sync [role="status"]')).toContainText(
    'Sincronizado com GitHub',
  );
  expect(files.get('english-os/state.json')!.content).toBe(englishState);
  const state = JSON.parse(
    Buffer.from(files.get('portuguese-os/state.json')!.content, 'base64').toString(),
  );
  expect(state.workspace).toBe('pt');
  expect(state.data.profile[0].name).toBe('Jazmín');
  expect(state.data.vocabulary.map((word: { word: string }) => word.word)).toEqual([pt]);
  expect(state.data.vocabulary.some((word: { word: string }) => word.word === en)).toBe(false);
});
