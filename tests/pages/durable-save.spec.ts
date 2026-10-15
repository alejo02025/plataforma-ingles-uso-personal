import { go, dailyWord, ready } from './navigation';
import { test, expect, type Page } from '@playwright/test';

async function fingerprint(page: Page, pt: boolean) {
  return page.evaluate(
    async (name) => {
      const opening = indexedDB.open(name, 1);
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        opening.onsuccess = () => resolve(opening.result);
        opening.onerror = () => reject(opening.error);
      });
      const transaction = db.transaction('values');
      const store = transaction.objectStore('values');
      const get = (key: string) =>
        new Promise<unknown>((resolve, reject) => {
          const request = store.get(key);
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
      const [bytes, manifest, device] = await Promise.all([
        get('database'),
        get('manifest'),
        get('device'),
      ]);
      db.close();
      const digest = await crypto.subtle.digest('SHA-256', bytes as BufferSource);
      return {
        database: Array.from(new Uint8Array(digest)).join(','),
        manifest: JSON.stringify(manifest),
        device,
      };
    },
    pt ? 'portuguese-os-private-v1' : 'english-os-private-v1',
  );
}

async function failNextManifest(page: Page, kind: 'abort' | 'throw') {
  await page.evaluate((kind) => {
    const original = IDBObjectStore.prototype.put;
    let armed = true;
    IDBObjectStore.prototype.put = function (value, key) {
      if (key === 'manifest' && armed) {
        armed = false;
        IDBObjectStore.prototype.put = original;
        if (kind === 'throw') throw new DOMException('Synthetic cloning failure', 'DataCloneError');
        const request = original.call(this, value, key);
        this.transaction.abort();
        return request;
      }
      return original.call(this, value, key);
    };
  }, kind);
}

async function enter(page: Page, pt: boolean) {
  await page.goto(pt ? './portugues/' : './');
  await expect(page.locator('.app-shell')).toBeVisible();
  const popup = page.getByRole('dialog', { name: pt ? 'Palavra do dia' : 'Word of the Day' });
  if (await popup.isVisible())
    await popup
      .getByRole('button', { name: pt ? 'Fechar palavra do dia' : 'Close daily word' })
      .click();
}

for (const pt of [false, true])
  for (const kind of ['abort', 'throw'] as const)
    test(`Durable save: ${kind} rolls back SQLite and metadata; the same diagnostic answer can retry (${pt ? 'PT' : 'EN'})`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await enter(page, pt);
      await go(page, 'Assessment');
      const card = page.locator('.diagnostic-card');
      await card.locator('input[type="radio"]').first().check();
      const before = await fingerprint(page, pt);
      await failNextManifest(page, kind);
      const save = card.getByRole('button', {
        name: pt ? 'Salvar resposta' : 'Save answer',
        exact: true,
      });
      await save.click();
      await expect(card.getByRole('alert')).toContainText('No se pudo guardar en este dispositivo');
      await expect(card.locator('.feedback')).toHaveCount(0);
      await expect(save).toBeEnabled();
      expect(
        await fingerprint(page, pt),
        'an aborted later put must not leave an earlier database put committed',
      ).toEqual(before);
      if (kind === 'abort') {
        await page.evaluate(() => {
          if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
          window.scrollTo(0, 0);
        });
        await page.screenshot({
          path: `artifacts/redesign/qa/save-error-${pt ? 'pt' : 'en'}-390.png`,
          fullPage: true,
        });
      }
      await save.click();
      await expect(card.locator('.feedback')).toBeVisible();
      await expect(card.getByRole('alert')).toHaveCount(0);
      await card.getByRole('button', { name: pt ? 'Próxima' : 'Next', exact: true }).click();
      await expect(card).toContainText('1 / 24');
      const after = await fingerprint(page, pt);
      expect(after.database).not.toBe(before.database);
      expect(JSON.parse(after.manifest).data.diagnostic_answers).toHaveLength(1);
      await page.reload();
      await go(page, 'Assessment');
      await expect(card).toContainText('1 / 24');
    });

for (const pt of [false, true])
  test(`Durable save: a failed startup commit can retry without reloading or losing existing history (${pt ? 'PT' : 'EN'})`, async ({
    page,
  }) => {
    await enter(page, pt);
    await go(page, 'Settings');
    await page
      .getByLabel(pt ? 'Seu nome' : 'Your name', { exact: true })
      .fill('Saved before failure');
    await page
      .getByRole('button', { name: pt ? 'Salvar preferências' : 'Save preferences', exact: true })
      .click();
    const before = await fingerprint(page, pt);
    await page.addInitScript(() => {
      const original = IDBObjectStore.prototype.put;
      let armed = true;
      IDBObjectStore.prototype.put = function (value, key) {
        if (key === 'manifest' && armed) {
          armed = false;
          IDBObjectStore.prototype.put = original;
          const request = original.call(this, value, key);
          this.transaction.abort();
          return request;
        }
        return original.call(this, value, key);
      };
    });
    await page.reload();
    await expect(page.locator('.loading-screen [role="alert"]')).toContainText(
      'No se pudo guardar en este dispositivo',
    );
    expect(await fingerprint(page, pt)).toEqual(before);
    await page
      .getByRole('button', { name: pt ? 'Tentar novamente' : 'Try again', exact: true })
      .click();
    await expect(page.locator('.app-shell')).toBeVisible();
    await go(page, 'Settings');
    await expect(page.getByLabel(pt ? 'Seu nome' : 'Your name', { exact: true })).toHaveValue(
      'Saved before failure',
    );
    const after = await fingerprint(page, pt);
    expect(JSON.parse(after.manifest).data.profile[0].name).toBe('Saved before failure');
  });

test('Durable save: a transient opening error does not permanently reject startup', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = IDBFactory.prototype.open;
    IDBFactory.prototype.open = function (name, version) {
      if (name === 'english-os-private-v1') {
        IDBFactory.prototype.open = original;
        throw new DOMException('Synthetic transient open failure', 'UnknownError');
      }
      return original.call(this, name, version);
    };
  });
  await page.goto('./');
  await expect(page.locator('.loading-screen [role="alert"]')).toContainText(
    'Synthetic transient open failure',
  );
  await page.getByRole('button', { name: 'Try again', exact: true }).click();
  await expect(page.locator('.app-shell')).toBeVisible();
  await ready(page);
  await go(page, 'Settings');
  await expect(page.getByLabel('Your name', { exact: true })).toHaveValue('Alejo');
});

test('Durable save: a failed local sync commit preserves the device snapshot and can retry the remote merge', async ({
  page,
  context,
}) => {
  await enter(page, false);
  const before = await fingerprint(page, false);
  const remote = JSON.parse(before.manifest);
  remote.data.profile[0].name = 'Remote profile fixture';
  remote.clocks['profile/1'].name = '9999999999999999:durable-fixture';
  await context.route('https://api.github.com/**', async (route) => {
    if (new URL(route.request().url()).pathname === '/repos/alejo02025/english-os-datos')
      return route.fulfill({ json: { private: true, permissions: { push: true } } });
    if (route.request().method() === 'GET')
      return route.fulfill({
        json: {
          sha: 'durable-revision',
          type: 'file',
          encoding: 'base64',
          size: JSON.stringify(remote).length,
          content: Buffer.from(JSON.stringify(remote)).toString('base64'),
        },
      });
    await route.fulfill({ json: { content: { sha: 'durable-upload' } } });
  });
  await go(page, 'Settings');
  await page.getByLabel('GitHub token').fill('synthetic-durable-token-never-real');
  await failNextManifest(page, 'abort');
  await page.getByRole('button', { name: 'Connect GitHub', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('No se pudo guardar en este dispositivo');
  expect(await fingerprint(page, false)).toEqual(before);
  await expect(page.getByLabel('Your name', { exact: true })).toHaveValue('Alejo');
  await page.getByRole('button', { name: 'Sync now', exact: true }).click();
  await expect(page.locator('.github-sync [role="status"]')).toContainText('Synced with GitHub');
  await go(page, 'Home');
  await go(page, 'Settings');
  await expect(page.getByLabel('Your name', { exact: true })).toHaveValue('Remote profile fixture');
  expect(JSON.parse((await fingerprint(page, false)).manifest).data.profile[0].name).toBe(
    'Remote profile fixture',
  );
});
