import { go, dailyWord, ready, manifest } from './navigation';
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
    const captured = window as unknown as { spokenLocale?: string; localVoice?: boolean };
    Object.defineProperty(window, 'SpeechSynthesisUtterance', {
      configurable: true,
      value: class {
        constructor(public text: string) {}
      },
    });
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: {
        getVoices: () => [
          { lang: 'pt-BR', localService: false },
          { lang: 'pt-BR', localService: true },
        ],
        cancel: () => {},
        speak: (utterance: { lang: string; voice: { localService: boolean } }) => {
          captured.spokenLocale = utterance.lang;
          captured.localVoice = utterance.voice.localService;
        },
      },
    });
  });
  await go(page, 'Vocabulário');
  await page
    .getByRole('button', { name: `Ouvir ${word}`, exact: true })
    .first()
    .click();
  expect(
    await page.evaluate(() => (window as unknown as { spokenLocale: string }).spokenLocale),
  ).toBe('pt-BR');
  expect(await page.evaluate(() => (window as unknown as { localVoice: boolean }).localVoice)).toBe(
    true,
  );
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

test('English and Portuguese keep separate local vocabulary and backup identities without remote sync', async ({
  page,
}) => {
  const remoteRequests: string[] = [];
  page.on('request', (request) => {
    if (request.url().startsWith('https://api.github.com/')) remoteRequests.push(request.url());
  });
  await page.goto('./');
  const englishWord = await dailyWord(page);
  const en = await englishWord.getByRole('heading').innerText();
  await englishWord.getByRole('button', { name: 'Save this word' }).click();
  await englishWord.getByRole('button', { name: 'Close daily word' }).click();
  const englishState = await manifest(page, false);
  expect(englishState.workspace).toBe('en');
  expect(englishState.data.vocabulary.map((word: { word: string }) => word.word)).toEqual([en]);
  await page.locator('.language-switcher a:not([aria-current])').click();
  const portugueseWord = await dailyWord(page);
  const pt = await portugueseWord.getByRole('heading').innerText();
  await portugueseWord.getByRole('button', { name: 'Salvar esta palavra' }).click();
  await portugueseWord.getByRole('button', { name: 'Fechar palavra do dia' }).click();
  const portugueseState = await manifest(page, true);
  expect(portugueseState.workspace).toBe('pt');
  expect(portugueseState.data.vocabulary.map((word: { word: string }) => word.word)).toEqual([pt]);
  expect(portugueseState.data.vocabulary.some((word: { word: string }) => word.word === en)).toBe(
    false,
  );
  await page.locator('.language-switcher a:not([aria-current])').click();
  await ready(page);
  expect((await manifest(page, false)).data.vocabulary).toEqual(englishState.data.vocabulary);
  await go(page, 'Settings');
  await expect(page.locator('.local-backup')).toBeVisible();
  await expect(page.locator('.github-sync,input[type="password"],input[type="email"]')).toHaveCount(
    0,
  );
  expect(remoteRequests).toEqual([]);
});
