import { test, expect } from '@playwright/test';
import { makePdf } from '../pdf-fixture';
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
  await page.getByLabel('Clave de acceso').fill('e2e-access-only');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  expect((await request.post('/api/login', { data: { token: 'e2e-access-only' } })).ok()).toBe(
    true,
  );
  await expect(page.getByRole('heading', { name: 'Buen día, Alejo.' })).toBeVisible();
  await page.getByRole('button', { name: 'Conocer mi punto de partida' }).click();
  await page.getByText('took', { exact: true }).click();
  await page.getByRole('button', { name: 'Guardar respuesta', exact: true }).click();
  await expect(page.getByText('Bien pensado.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Siguiente', exact: true }).click();
  await page.getByRole('button', { name: 'Guardar y salir', exact: true }).click();
  await page.reload();
  await page.getByRole('button', { name: 'Conocer mi punto de partida' }).click();
  await expect(page.getByText('1 de 9 guardadas', { exact: true })).toBeVisible();
  const answers = [
    'a document to get on a plane',
    'No, entry ends at five',
    'have worked',
    'reduce',
    'They reached the meeting on time',
    'would have chosen',
    'gradually weaken',
    'Further evidence is needed before firm conclusions',
  ];
  for (const answer of answers) {
    await page.getByText(answer, { exact: true }).click();
    await page.getByRole('button', { name: 'Guardar respuesta', exact: true }).click();
    await page.getByRole('button', { name: 'Siguiente', exact: true }).click();
  }
  await expect(page.getByText('Tu línea de base está guardada.')).toBeVisible();
  await page.getByRole('button', { name: 'Ir a mi recorrido' }).click();
  await page.getByRole('navigation').getByRole('button', { name: 'Biblioteca' }).click();
  await page.getByRole('button', { name: /The city you discover on foot/ }).click();
  await expect(page.getByRole('heading', { name: 'The city you discover on foot' })).toBeVisible();
  await page.getByRole('button', { name: 'narrow,', exact: true }).click();
  await page.getByRole('button', { name: 'Guardar palabra', exact: true }).click();
  await expect(page.getByRole('button', { name: 'En tu vocabulario' })).toBeVisible();
  await page.getByRole('button', { name: 'Siguiente', exact: true }).click();
  await page.reload();
  // La navegación vuelve al inicio; abrir otra vez conserva el fragmento y la sesión.
  await page.getByRole('navigation').getByRole('button', { name: 'Biblioteca' }).click();
  await page.getByRole('button', { name: /The city you discover on foot/ }).click();
  await expect(page.getByText('FRAGMENTO 2 DE 3')).toBeVisible();
  await page.getByText('A map from the bookshop owner', { exact: true }).click();
  await page.getByText('Slow exploration can be valuable', { exact: true }).click();
  await page.getByRole('button', { name: 'Completar lectura', exact: true }).click();
  await expect(page.getByText('2 de 2 respuestas correctas')).toBeVisible();
  await page
    .getByRole('navigation')
    .getByRole('button', { name: /Vocabulario/ })
    .click();
  await page.getByRole('button', { name: 'Mostrar significado' }).click();
  await expect(page.getByText('estrecho/a', { exact: true }).first()).toBeVisible();
  await page.getByRole('button', { name: 'La recordé' }).click();
  await expect(page.getByText('Estás al día.', { exact: true })).toBeVisible();
  await page.getByRole('navigation').getByRole('button', { name: 'Biblioteca' }).click();
  await page.getByRole('button', { name: 'Agregar material' }).click();
  await page.getByLabel('Título', { exact: true }).fill('My travel PDF');
  await page
    .locator('input[type=file]')
    .setInputFiles({ name: 'journey.pdf', mimeType: 'application/pdf', buffer: makePdf() });
  await page.getByRole('button', { name: 'Incorporar a mi biblioteca' }).click();
  await page.getByRole('button', { name: /My travel PDF/ }).click();
  await expect(page.getByText(/Last summer I travelled/, { exact: false })).toBeVisible();
  await page
    .getByLabel('Tu respuesta en inglés')
    .fill(
      'This story describes a journey to a town beside a river and a visit to its local museum.',
    );
  await page.getByRole('button', { name: 'Completar lectura', exact: true }).click();
  await expect(page.getByText('Práctica guardada, sin puntuación automática.')).toBeVisible();
  await page.getByRole('navigation').getByRole('button', { name: 'Calendario' }).click();
  await expect(page.getByRole('heading', { name: 'The city you discover on foot' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'My travel PDF' })).toBeVisible();
  await page.getByRole('navigation').getByRole('button', { name: 'Progreso' }).click();
  await expect(
    page.getByText('2/2 respuestas en actividades; no equivale a un nivel MCER.'),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Activar modo oscuro' }).click();
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
    await phonePage.getByLabel('Clave de acceso').fill('e2e-access-only');
    await phonePage.getByRole('button', { name: 'Entrar', exact: true }).click();
    await expect(phonePage.getByRole('heading', { name: 'Buen día, Alejo.' })).toBeVisible();
    const phoneState = await (await phone.request.get('/api/state')).json();
    expect(phoneState.results).toHaveLength(2);
    expect(phoneState.vocabulary[0].word).toBe('narrow');
    await phonePage.getByRole('button', { name: 'Abrir navegación' }).click();
    await phonePage
      .getByRole('navigation')
      .getByRole('button', { name: /Vocabulario/ })
      .click();
    await expect(phonePage.getByRole('heading', { name: 'narrow', exact: true })).toBeVisible();
  } finally {
    await phone.close();
  }
  const proxyLogin = await request.post('/api/login', {
    headers: { 'x-forwarded-proto': 'https' },
    data: { token: 'e2e-access-only' },
  });
  expect(proxyLogin.headers()['set-cookie']).toContain('Secure');
  expect(errors).toEqual([]);
});
