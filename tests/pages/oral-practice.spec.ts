import { go, dailyWord, ready } from './navigation';
import { test, expect } from '@playwright/test';
import { existsSync } from 'node:fs';
import { oralTask } from '../../src/lib/oral-practice';
test.use({
  launchOptions: {
    executablePath: existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined,
    args: ['--no-sandbox', '--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'],
  },
});
for (const pt of [false, true])
  test(`Oral: real browser audio container persists, manual transcript is not pronunciation, supported listening stays separate (${pt ? 'PT' : 'EN'})`, async ({
    page,
    context,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.setViewportSize({ width: 390, height: 844 });
    await context.grantPermissions(['microphone']);
    await page.goto(pt ? './portugues/' : './');

    await go(page, 'Oral practice');
    const room = page.locator('.oral-room');
    await expect(room).toContainText('no equivale a evaluar tu pronunciación');
    await room
      .getByRole('button', { name: pt ? 'Gravar áudio' : 'Record audio', exact: true })
      .click();
    await expect(room).toHaveClass(/oral-recording-active/);
    await expect
      .poll(async () =>
        parseInt(await room.locator('.oral-controls [role="status"]').innerText(), 10),
      )
      .toBeGreaterThan(0);
    const recordingUrl = page.url();
    await page.locator('.language-switcher').getByRole('link').click();
    await expect(page).toHaveURL(recordingUrl);
    await expect(room).toHaveClass(/oral-recording-active/);
    await expect(page.locator('.global-error')).toContainText(
      pt ? 'trocar de idioma' : 'changing language',
    );
    await room
      .getByRole('button', { name: pt ? 'Parar gravação' : 'Stop recording', exact: true })
      .click();
    await expect(room.locator('.oral-audio audio')).toHaveAttribute('src', /^blob:/);
    await room
      .locator('textarea')
      .first()
      .fill(pt ? 'Ontem comprei uma passagem.' : 'Yesterday I bought a ticket.');
    await room
      .locator('textarea')
      .nth(1)
      .fill(pt ? 'Revisar o passado.' : 'Review the past tense.');
    await room
      .getByRole('button', { name: pt ? 'Salvar prática' : 'Save practice', exact: true })
      .click();
    await expect(room.locator('.oral-saved')).toContainText(pt ? 'Salvo' : 'Saved');
    await expect(room.locator('.oral-history article')).toHaveCount(1);
    await expect(room.locator('.oral-history audio')).toHaveAttribute('src', /^blob:/);
    await page.reload();
    await go(page, 'Oral practice');
    await expect(room.locator('.oral-history audio')).toHaveAttribute('src', /^blob:/);
    await expect(room.locator('.oral-history')).toContainText(
      pt ? 'Pronúncia: não avaliada' : 'Pronunciation: not assessed',
    );
    await room
      .getByRole('button', { name: pt ? 'Laboratório de escuta' : 'Listening lab', exact: true })
      .click();
    await room
      .getByRole('button', {
        name: pt ? 'Mostrar transcrição (apoio)' : 'Show transcript (support)',
        exact: true,
      })
      .click();
    const task = oralTask(pt ? 'A1' : 'A2', pt);
    for (let i = 0; i < 2; i++)
      await room.getByRole('radio', { name: task.options[i][0], exact: true }).check();
    await room
      .getByRole('button', { name: pt ? 'Salvar prática' : 'Save practice', exact: true })
      .click();
    await expect(room.locator('.oral-saved')).toContainText('2 / 2');
    await expect(room).toContainText('no cuenta como evidencia auditiva independiente');
    await expect(room.locator('.oral-history article')).toHaveCount(2);
    await expect(room.locator('.answer-correction .study-native')).toHaveCount(2);
    await page.screenshot({
      path: `artifacts/redesign/qa/oral-${pt ? 'pt' : 'en'}-390.png`,
      fullPage: true,
    });
    await page.locator('.mobile-bottom-nav').getByRole('button').last().click();
    await page.locator('.progress-oral-history > summary').click();
    await expect(page.locator('.progress-oral-history .oral-evidence-record')).toHaveCount(2);
    await expect(page.locator('.progress-oral-history')).not.toContainText('oral-v1');
    await go(page, 'Calendar');
    await expect(page.locator('.calendar-day.current')).toContainText(/./);
    await expect(page.locator('.calendar-day.current .day-dot')).toHaveCount(1);
    await expect(page.locator('.day-detail .oral-evidence-record')).toHaveCount(2);
    await expect(page.locator('.day-detail')).not.toContainText('oral-v1');
    await expect(page.locator('.day-detail .empty')).toHaveCount(0);
    await page.locator('.mobile-bottom-nav').getByRole('button').first().click();
    await go(page, 'Oral practice');
    await go(page, 'Settings');
    await expect(page.locator('.offline-status summary')).toContainText(
      pt ? 'Pronto sem conexão' : 'Ready offline',
      { timeout: 90000 },
    );
    await context.setOffline(true);
    await page.reload();
    await go(page, 'Oral practice');
    await expect(room.locator('.oral-history article')).toHaveCount(2);
    await expect(room.locator('.oral-history audio')).toHaveAttribute('src', /^blob:/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    expect(errors).toEqual([]);
  });

for (const pt of [false, true])
  test(`Oral: pending microphone permission blocks navigation and a concurrent update; denial recovers (${pt ? 'PT' : 'EN'})`, async ({
    page,
    context,
  }) => {
    await page.addInitScript(() => {
      navigator.mediaDevices.getUserMedia = () =>
        new Promise((_resolve, reject) => {
          (window as unknown as { rejectMicrophone: () => void }).rejectMicrophone = () =>
            reject(new DOMException('Denied', 'NotAllowedError'));
        });
    });
    await page.goto(pt ? './portugues/' : './');

    await go(page, 'Oral practice');
    const room = page.locator('.oral-room');
    await room
      .getByRole('button', { name: pt ? 'Gravar áudio' : 'Record audio', exact: true })
      .click();
    await expect(room).toHaveClass(/oral-recording-active/);
    const pendingUrl = page.url();
    await page.locator('.language-switcher').getByRole('link').click();
    await expect(page).toHaveURL(pendingUrl);
    await expect(room).toHaveClass(/oral-recording-active/);
    await expect(
      room.getByRole('button', {
        name: pt ? 'Laboratório de escuta' : 'Listening lab',
        exact: true,
      }),
    ).toBeDisabled();
    await go(page, pt ? 'Início' : 'Home');
    await expect(room).toBeVisible();
    await expect(page.locator('.global-error')).toContainText(
      pt ? 'Pare a gravação' : 'Stop the recording',
    );
    const other = await context.newPage();
    await other.goto(pt ? './' : './portugues/');
    await go(other, 'Settings');
    await other
      .getByRole('button', { name: pt ? 'Update app' : 'Atualizar aplicativo', exact: true })
      .click();
    await expect(other).toHaveURL(/updated=/);
    await page.bringToFront();
    await expect(room).toHaveClass(/oral-recording-active/);
    expect(page.url()).not.toContain('updated=');
    await page.evaluate(() =>
      (window as unknown as { rejectMicrophone: () => void }).rejectMicrophone(),
    );
    await expect(room).not.toHaveClass(/oral-recording-active/);
    await expect(room.locator('[role="alert"]')).toContainText(pt ? 'microfone' : 'Microphone');
    await expect(room.locator('.oral-history article')).toHaveCount(0);
    await room
      .getByRole('button', { name: pt ? 'Laboratório de escuta' : 'Listening lab', exact: true })
      .click();
    await expect(
      room.getByRole('button', {
        name: pt ? 'Mostrar transcrição (apoio)' : 'Show transcript (support)',
        exact: true,
      }),
    ).toBeEnabled();
  });
