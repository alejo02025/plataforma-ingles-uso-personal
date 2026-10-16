import { go, ready } from '../pages/navigation';
import { test, expect } from '@playwright/test';
import { makePdf } from '../pdf-fixture';
import { diagnosticQuestions } from '../../src/lib/content';
test('diagnóstico retomable, lectura, vocabulario, PDF, calendario y tema persistentes', async ({
  page,
  request,
  browser,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  const unauthorized = await request.get('/api/state');
  expect(unauthorized.status()).toBe(401);
  const health = await request.get('/api/health');
  expect(health.ok()).toBe(true);
  expect(await health.json()).toEqual({ status: 'ok' });
  expect((await request.post('/api/login', { data: { token: 'wrong' } })).status()).toBe(401);
  await page.getByLabel('Access key').fill('e2e-access-only');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  expect((await request.post('/api/login', { data: { token: 'e2e-access-only' } })).ok()).toBe(
    true,
  );
  await ready(page);
  const agenda = await request.post('/api/study-day', { data: { minutes: 20 } });
  expect(agenda.ok()).toBe(true);
  const savedAgenda = await agenda.json();
  expect(savedAgenda.tasks.length).toBeLessThanOrEqual(4);
  expect(await (await request.post('/api/study-day', { data: { minutes: 20 } })).json()).toEqual(
    savedAgenda,
  );
  expect((await request.post('/api/study-day', { data: { minutes: 13 } })).status()).toBe(400);

  await go(page, 'Assessment');
  await page.getByText('am', { exact: true }).click();
  await page.getByRole('button', { name: 'Save answer', exact: true }).click();
  await expect(page.getByText('Well done.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.getByRole('button', { name: 'Save and leave', exact: true }).click();
  await page.reload();
  await go(page, 'Assessment');
  await expect(page.getByText('1 / 24 · answers saved', { exact: true })).toBeVisible();
  for (const question of diagnosticQuestions.slice(1)) {
    await page.getByLabel(question.options![question.answer!], { exact: true }).check();
    await page.getByRole('button', { name: 'Save answer', exact: true }).click();
    await page.getByRole('button', { name: 'Next', exact: true }).click();
  }
  await expect(page.locator('.placement-result')).toBeVisible();
  await expect(page.locator('.placement-result')).toContainText('24 / 24');
  await page.getByRole('button', { name: 'Go to my journey' }).click();
  await go(page, 'Library');
  await page.locator('.document-card').filter({ hasText: 'The city you discover on foot' }).click();
  await expect(page.getByRole('heading', { name: 'The city you discover on foot' })).toBeVisible();
  await page.getByRole('button', { name: 'narrow,', exact: true }).click();
  await page.getByRole('button', { name: 'Save to vocabulary', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Saved to vocabulary' })).toBeVisible();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.reload();
  // La navegación vuelve al inicio; abrir otra vez conserva el fragmento y la sesión.
  await go(page, 'Library');
  await page.locator('.document-card').filter({ hasText: 'The city you discover on foot' }).click();
  await expect(page.getByText('SECTION 2 OF 3')).toBeVisible();
  await page.getByText('A map from the bookshop owner', { exact: true }).click();
  await page
    .locator('.question-player-navigation')
    .getByRole('button', { name: 'Next question', exact: true })
    .click();
  await page.getByText('Slow exploration can be valuable', { exact: true }).click();
  await page.getByRole('button', { name: 'Complete reading', exact: true }).click();
  await expect(page.getByText('2 of 2 correct answers')).toBeVisible();
  await go(page, /Vocabulary/);
  await page.getByRole('button', { name: 'Show meaning' }).click();
  await expect(page.getByText(/Estrecho|estrecho/, { exact: false }).first()).toBeVisible();
  await page.getByRole('button', { name: 'I remembered it' }).click();
  await expect(page.getByText('You’re up to date.', { exact: true })).toBeVisible();
  await go(page, 'PDF Studio');
  await page
    .getByLabel('Upload PDFs')
    .setInputFiles({ name: 'My travel PDF.pdf', mimeType: 'application/pdf', buffer: makePdf() });
  await page.getByRole('tab', { name: 'My travel PDF', exact: true }).click();
  await page.locator('.studio-outline summary').click();
  await page.getByRole('button', { name: 'Open full reader', exact: true }).click();
  await expect(page.getByText(/Last summer I travelled/, { exact: false })).toBeVisible();
  await page
    .getByLabel('Your answer in English')
    .fill(
      'This story describes a journey to a town beside a river and a visit to its local museum.',
    );
  await page.getByRole('button', { name: 'Complete reading', exact: true }).click();
  await expect(page.getByText('Practice saved, without an automatic score.')).toBeVisible();
  await go(page, 'Calendar');
  await expect(page.getByRole('heading', { name: 'The city you discover on foot' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'My travel PDF' })).toBeVisible();
  await go(page, 'Progress');
  await expect(page.locator('.evidence-table > div').filter({ hasText: 'Reading' })).toContainText(
    '2/2',
  );
  await expect(page.locator('.progress-evidence')).toContainText('not a level certificate');
  await go(page, 'Settings');
  await page.getByLabel('Appearance', { exact: true }).selectOption('dark');
  await page.getByRole('button', { name: 'Save preferences', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  const state = await (await request.get('/api/state')).json();
  expect(state.results).toHaveLength(2);
  expect(state.vocabulary).toHaveLength(1);
  expect(state.reviews).toHaveLength(1);
  const forbidden = await request.post('/api/profile', {
    headers: { Origin: 'https://other.example' },
    data: state.profile,
  });
  expect(forbidden.status()).toBe(403);
  const exported = await (await request.get('/api/export')).json();
  expect(exported.data.documents.some((d: { title: string }) => d.title === 'My travel PDF')).toBe(
    true,
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('body')).toHaveJSProperty('scrollWidth', 390);
  const phone = await browser.newContext({
    baseURL: new URL(page.url()).origin,
    viewport: { width: 390, height: 844 },
  });
  try {
    const phonePage = await phone.newPage();
    await phonePage.goto('/');
    await phonePage.getByLabel('Access key').fill('e2e-access-only');
    await phonePage.getByRole('button', { name: 'Sign in', exact: true }).click();
    await ready(phonePage);
    const phoneState = await (await phone.request.get('/api/state')).json();
    expect(phoneState.results).toHaveLength(2);
    expect(phoneState.vocabulary[0].word).toBe('narrow');
    await go(phonePage, /Vocabulary/);
    await expect(phonePage.getByRole('heading', { name: 'narrow', exact: true })).toBeVisible();
  } finally {
    await phone.close();
  }
  const oral = {
    id: crypto.randomUUID(),
    kind: 'oral-v1',
    mode: 'listening',
    level: 'A2',
    duration: 0,
    answers: [0, 0],
    heard: false,
  };
  const oralReply = await request.post('/api/oral/attempt', { data: oral });
  expect(oralReply.ok()).toBe(true);
  expect(await oralReply.json()).toMatchObject({
    correct: 2,
    total: 2,
    evidence: { helpUsed: true },
  });
  const rejectedGrade = await request.post('/api/oral/attempt', {
    data: { ...oral, id: crypto.randomUUID(), pronunciationScore: 95 },
  });
  expect(rejectedGrade.status()).toBe(400);
  const proxyLogin = await request.post('/api/login', {
    headers: { 'x-forwarded-proto': 'https' },
    data: { token: 'e2e-access-only' },
  });
  expect(proxyLogin.headers()['set-cookie']).toContain('Secure');
  expect(errors).toEqual([]);
});
