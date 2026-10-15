import { test, expect } from '@playwright/test';
import { go, ready, offlineReady, finishRoutine, manifest } from './navigation';
import { makeRoutine } from '../../src/lib/routine';
for (const pt of [false, true])
  test(`Contextual routine moves forward, varies retries and preserves separate paused drafts (${pt ? 'PT' : 'EN'})`, async ({
    page,
    context,
  }) => {
    test.setTimeout(180000);
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(pt ? './portugues/' : './');
    await ready(page);
    await offlineReady(page);
    await go(page, 'Practice');
    const practice = page.locator('.review-practice');
    await expect(practice.locator('.activity-row')).toHaveCount(4);
    await practice.locator('.activity-row').first().click();
    const dialog = page.locator('.routine-session');
    await expect(dialog.locator('.picture-choices button')).toHaveCount(4);
    await expect(dialog.locator('svg[viewBox="0 0 480 110"]')).toHaveCount(1);
    await finishRoutine(page, pt, 'vocabulary', 0, 2);
    await expect(dialog.locator('.routine-score')).toHaveText('4 / 6');
    await dialog
      .getByRole('button', {
        name: pt ? 'Reforçar com outra sequência' : 'Reinforce with a new sequence',
        exact: true,
      })
      .click();
    const varied = makeRoutine('vocabulary', pt ? 'A1' : 'A2', 0, pt, { edition: 2, variant: 1 });
    await expect(dialog.locator('.routine-reading').first()).toContainText(
      varied.rounds[0].context!,
    );
    await finishRoutine(page, pt, 'vocabulary', 1);
    await dialog
      .getByRole('button', { name: pt ? 'Voltar à revisão' : 'Back to review', exact: true })
      .click();
    await practice.locator('.activity-row').nth(1).click();
    await dialog.locator('.routine-tiles button').first().click();
    await expect(dialog.locator('.routine-answer button')).toHaveCount(1);
    await dialog
      .getByRole('button', { name: pt ? 'Pausar atividade' : 'Pause activity', exact: true })
      .click();
    await practice.locator('.activity-row').nth(2).click();
    await expect(dialog.getByRole('heading', { level: 2 })).toContainText(
      pt ? 'Entender uma situação' : 'Understand a situation',
    );
    await dialog
      .getByRole('button', { name: pt ? 'Pausar atividade' : 'Pause activity', exact: true })
      .click();
    await context.setOffline(true);
    await page.reload();
    await ready(page);
    await go(page, 'Practice');
    await practice.locator('.activity-row').nth(1).click();
    await expect(dialog.locator('.routine-answer button')).toHaveCount(1);
    await dialog.locator('.routine-answer button').first().click();
    await finishRoutine(page, pt, 'grammar');
    await dialog
      .getByRole('button', { name: pt ? 'Voltar à revisão' : 'Back to review', exact: true })
      .click();
    await practice.locator('.activity-row').nth(2).click();
    await finishRoutine(page, pt, 'reading');
    await dialog
      .getByRole('button', { name: pt ? 'Voltar à revisão' : 'Back to review', exact: true })
      .click();
    const saved = await manifest(page, pt);
    expect(
      saved.data.results.filter((r: any) => r.activity_id.startsWith('routine:')),
    ).toHaveLength(4);
    await page.reload();
    await ready(page);
    expect((await manifest(page, pt)).data.results).toHaveLength(4);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    expect(errors).toEqual([]);
  });
