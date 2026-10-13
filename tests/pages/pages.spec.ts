import { test, expect, type Page, type BrowserContext } from '@playwright/test';
import { makePdf } from '../pdf-fixture';
async function preferences(page: Page) {
  await page.getByRole('button', { name: 'Ayuda y preferencias' }).click();
}
async function authorize(page: Page) {
  await preferences(page);
  await page.getByLabel('Token de GitHub').fill('github-test-fixture-never-real');
  await page.getByRole('button', { name: 'Conectar GitHub', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Sincronizado con GitHub');
}
test('Pages: SQLite en navegador, persistencia, PDF y sincronización privada entre dos dispositivos', async ({
  page,
  browser,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  let remote: { sha: string; content: string } | undefined;
  let counter = 0,
    conflictOnce = false,
    remotePublic = false,
    blockNetwork = false;
  const files = new Map<string, { sha: string; content: string }>();
  const mock = async (context: BrowserContext) =>
    context.route('https://api.github.com/**', async (route) => {
      const request = route.request(),
        url = new URL(request.url());
      expect(request.headers().authorization).toBe('Bearer github-test-fixture-never-real');
      if (blockNetwork) {
        await route.abort();
        return;
      }
      if (url.pathname === '/repos/alejo02025/english-os-datos') {
        await route.fulfill({ json: { private: !remotePublic, permissions: { push: true } } });
        return;
      }
      const filename = url.pathname.split('/contents/english-os/')[1];
      let current = filename === 'state.json' ? remote : files.get(filename);
      if (request.method() === 'GET') {
        await route.fulfill(
          current
            ? {
                json: {
                  ...current,
                  size: Buffer.from(current.content, 'base64').length,
                  type: 'file',
                  encoding: 'base64',
                },
              }
            : { status: 404, json: { message: 'Not Found' } },
        );
        return;
      }
      const input = request.postDataJSON();
      if (conflictOnce || input.sha !== current?.sha) {
        conflictOnce = false;
        await route.fulfill({ status: 409, json: { message: 'Conflict' } });
        return;
      }
      current = { sha: `revision-${++counter}`, content: input.content };
      if (filename === 'state.json') remote = current;
      else files.set(filename, current);
      await route.fulfill({ json: { content: { sha: current.sha } } });
    });
  await mock(page.context());
  await page.goto('./');
  await expect(page.getByRole('heading', { name: 'Buen día, Alejo.' })).toBeVisible();
  await page.getByRole('button', { name: 'Conocer mi punto de partida' }).click();
  await page.getByText('took', { exact: true }).click();
  await page.getByRole('button', { name: 'Guardar respuesta', exact: true }).click();
  await page.getByRole('button', { name: 'Siguiente', exact: true }).click();
  await page.getByRole('button', { name: 'Guardar y salir', exact: true }).click();
  await page.reload();
  await page.getByRole('button', { name: 'Conocer mi punto de partida' }).click();
  await expect(page.getByText('1 de 9 guardadas', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Guardar y salir', exact: true }).click();
  await authorize(page);
  await page.getByRole('button', { name: 'Cerrar preferencias' }).click();
  await page.getByRole('navigation').getByRole('button', { name: 'Biblioteca' }).click();
  await page.getByRole('button', { name: 'Agregar material' }).click();
  await page.getByLabel('Título', { exact: true }).fill('Private travel PDF');
  await page
    .locator('input[type=file]')
    .setInputFiles({ name: 'travel.pdf', mimeType: 'application/pdf', buffer: makePdf() });
  await page.getByRole('button', { name: 'Incorporar a mi biblioteca' }).click();
  await page.getByRole('button', { name: /Private travel PDF/ }).click();
  await expect(page.getByText(/Last summer I travelled/)).toBeVisible();
  await preferences(page);
  await page.getByRole('button', { name: 'Sincronizar ahora' }).click();
  await expect(page.getByRole('status')).toContainText('Sincronizado con GitHub');
  expect(files.size).toBe(1);
  await page.getByRole('button', { name: 'Cerrar preferencias' }).click();
  const phoneContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await mock(phoneContext);
  const phone = await phoneContext.newPage();
  phone.on('pageerror', (error) => errors.push(error.message));
  await phone.goto('http://127.0.0.1:3200/plataforma-ingles-uso-personal/');
  await authorize(phone);
  await phone.getByLabel('Cómo te llamás').fill('Alejo sincronizado');
  conflictOnce = true;
  await phone.getByRole('button', { name: 'Guardar preferencias', exact: true }).click();
  await expect(phone.getByRole('heading', { name: 'Buen día, Alejo sincronizado.' })).toBeVisible();
  await preferences(phone);
  await phone.getByRole('button', { name: 'Sincronizar ahora' }).click();
  await expect(phone.getByRole('status')).toContainText('Sincronizado con GitHub');
  await phone.getByRole('button', { name: 'Cerrar preferencias' }).click();
  await preferences(page);
  await page.getByRole('button', { name: 'Sincronizar ahora' }).click();
  await expect(page.getByRole('status')).toContainText('Sincronizado con GitHub');
  await page.getByRole('button', { name: 'Cerrar preferencias' }).click();
  await page.getByRole('navigation').getByRole('button', { name: 'Inicio', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Buen día, Alejo sincronizado.' })).toBeVisible();
  await phone.getByRole('button', { name: 'Abrir navegación' }).click();
  await phone.getByRole('navigation').getByRole('button', { name: 'Biblioteca' }).click();
  await phone.getByRole('button', { name: /Private travel PDF/ }).click();
  await expect(phone.getByText(/Last summer I travelled/)).toBeVisible();
  const download = phone.waitForEvent('download');
  await phone.getByRole('link', { name: 'Descargar PDF original' }).click();
  expect((await download).suggestedFilename()).toBe('documento.pdf');
  // Remote failure keeps local preferences; closing/reloading never retains the token.
  blockNetwork = true;
  await preferences(phone);
  await phone.getByLabel('Cómo te llamás').fill('Alejo offline');
  await phone.getByRole('button', { name: 'Guardar preferencias', exact: true }).click();
  await phone.reload();
  await expect(phone.getByRole('heading', { name: 'Buen día, Alejo offline.' })).toBeVisible();
  await preferences(phone);
  await expect(phone.getByLabel('Token de GitHub')).toHaveValue('');
  expect(await phone.evaluate(() => JSON.stringify(localStorage))).not.toContain(
    'github-test-fixture-never-real',
  );
  blockNetwork = false;
  const originalRemote = remote!;
  const corrupted = JSON.parse(Buffer.from(originalRemote.content, 'base64').toString('utf8'));
  const activity = corrupted.data.activities[0];
  activity.plan_id = 'missing-parent-plan';
  corrupted.clocks[`activities/${activity.id}`].plan_id = '9999999999999999:invalid-fixture';
  remote = {
    sha: 'corrupted-fixture',
    content: Buffer.from(JSON.stringify(corrupted)).toString('base64'),
  };
  const writesBefore = counter;
  await phone.getByLabel('Token de GitHub').fill('github-test-fixture-never-real');
  await phone.getByRole('button', { name: 'Conectar GitHub', exact: true }).click();
  await expect(phone.getByRole('status')).toContainText('El historial de GitHub no es válido');
  expect(counter).toBe(writesBefore);
  await phone.getByRole('button', { name: 'Desconectar', exact: true }).click();
  remote = originalRemote;
  remotePublic = true;
  await phone.getByLabel('Token de GitHub').fill('github-test-fixture-never-real');
  await phone.getByRole('button', { name: 'Conectar GitHub', exact: true }).click();
  await expect(phone.locator('p[role=alert]')).toContainText('repositorio privado');
  expect(errors).toEqual([]);
  await phoneContext.close();
});
