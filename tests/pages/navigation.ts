import { expect, type Page } from '@playwright/test';
/** Exercise the real five-destination navigation and its grouped tools. */
export async function go(page: Page, target: string | RegExp) {
  // Close the active lesson through its back control before changing study area.
  if (await page.locator('.lesson-player-close:visible').count())
    await page.locator('.lesson-player-close').click();
  const pt = (await page.locator('html').getAttribute('lang')) === 'pt-BR';
  const key = typeof target === 'string' ? target : target.source.replace(/^\^/, '');
  const primary = page.locator('.sidebar .nav-primary:visible, .mobile-bottom-nav:visible');
  const select = async (index: number) => {
    await primary.getByRole('button').nth(index).click();
  };
  const tab = async (label: string) => {
    await page.locator('.section-tabs').getByRole('button', { name: label, exact: true }).click();
  };
  if (/^(Home|Início|Today|Hoje|My Day|Meu dia)$/.test(key)) {
    await select(0);
    return;
  }
  if (/^(Settings|Preferences|Ajustes|Preferências)$/.test(key)) {
    await page
      .getByRole('button', { name: pt ? 'Ajustes' : 'Settings', exact: true })
      .filter({ visible: true })
      .click();
    return;
  }
  if (/^(Assessment|Diagnostic|Diagnóstico)$/.test(key)) {
    await go(page, 'Settings');
    await page
      .locator('.settings-info summary')
      .filter({ hasText: pt ? 'Diagnóstico' : 'Assessment' })
      .click();
    await page
      .getByRole('button', { name: pt ? 'Fazer diagnóstico' : 'Take the level check', exact: true })
      .click();
    return;
  }
  if (/^(Classes|Aulas|MCER)$/.test(key)) {
    await select(1);
    return;
  }
  if (/^(Language help|Ajuda com o idioma|Speaking|Course practice)$/.test(key)) {
    await select(1);
    await tab(pt ? 'Guia de idioma' : 'Language reference');
    return;
  }
  if (/^(Vocabulary|Vocabulário|Review|Revisão|Revisar)/.test(key)) {
    await select(2);
    return;
  }
  if (/^(Errors|My mistakes|Meus erros)$/.test(key)) {
    await select(2);
    await tab(pt ? 'Meus erros' : 'My mistakes');
    return;
  }
  if (/^(Practice|Praticar|Games|Jogos|Oral practice|Prática oral)$/.test(key)) {
    await select(2);
    await tab(
      /Games|Jogos/.test(key)
        ? pt
          ? 'Jogos'
          : 'Games'
        : /Oral practice|Prática oral/.test(key)
          ? pt
            ? 'Ouvir e gravar'
            : 'Listen & record'
          : pt
            ? 'Prática'
            : 'Practice',
    );
    return;
  }
  if (/^(PDF Studio|Estúdio de PDFs)$/.test(key)) {
    await select(3);
    return;
  }
  if (/^(Library|Biblioteca|News|Notícias)$/.test(key)) {
    await select(3);
    await tab(
      /News|Notícias/.test(key) ? (pt ? 'Notícias' : 'News') : pt ? 'Leituras' : 'Readings',
    );
    return;
  }
  if (/^(Progress|Progresso|Calendar|Calendário)$/.test(key)) {
    await select(4);
    if (/Calendar|Calendário/.test(key)) await tab(pt ? 'Calendário' : 'Calendar');
    return;
  }
  throw new Error(`Unknown study destination: ${key}`);
}
export async function dailyWord(page: Page) {
  const pt = (await page.locator('html').getAttribute('lang')) === 'pt-BR';
  await go(page, 'Vocabulary');
  await page.locator('.daily-word-launcher').click();
  const popup = page.getByRole('dialog', { name: pt ? 'Palavra do dia' : 'Word of the Day' });
  await expect(popup).toBeVisible();
  return popup;
}
export async function ready(page: Page) {
  await expect(page.locator('.today-focus .start-button, .today-finished')).toBeVisible();
}
export async function offlineReady(page: Page) {
  await go(page, 'Settings');
  await expect(page.locator('.offline-status summary')).toContainText(
    /Ready offline|Pronto sem conexão/,
    { timeout: 90000 },
  );
}
export async function finishRoutine(
  page: Page,
  pt: boolean,
  mode: 'vocabulary' | 'grammar' | 'reading',
  variant = 0,
  wrong = 0,
  start = 0,
) {
  const { makeRoutine, routineFormat } = await import('../../src/lib/routine');
  const stored = await page.evaluate((pt) => {
    const prefix = pt ? 'portuguese:' : '';
    const ids = JSON.parse(localStorage.getItem(prefix + 'routine-drafts:v2') || '[]');
    return JSON.parse(localStorage.getItem(prefix + 'routine-draft:v2:' + ids.at(-1)) || 'null');
  }, pt);
  expect(stored).toBeTruthy();
  expect(stored.mode).toBe(mode);
  expect(stored.variant ?? 0).toBe(variant);
  const set = makeRoutine(mode, stored.level, stored.block, pt, {
    edition: stored.edition,
    variant,
  });
  const dialog = page.locator('.routine-session');
  for (let i = start; i < set.rounds.length; i++) {
    const q = set.rounds[i];
    const format = routineFormat(q, mode);
    if (format === 'tiles') {
      let remaining = q.solution;
      const available = [...q.choices];
      while (available.length) {
        const token = available
          .filter((t) => remaining === t || remaining.startsWith(`${t} `))
          .sort((a, b) => b.length - a.length)[0];
        expect(token).toBeTruthy();
        await dialog
          .locator('.routine-tiles')
          .getByRole('button', { name: token, exact: true })
          .and(dialog.locator('button:enabled'))
          .first()
          .click();
        available.splice(available.indexOf(token), 1);
        remaining = remaining.slice(token.length).trimStart();
      }
    } else if (format === 'choice') {
      const answer = i < wrong ? q.choices.find((c) => c !== q.solution)! : q.solution;
      await dialog.getByRole('radio', { name: answer, exact: true }).check();
    } else
      await dialog
        .locator('.exercise-text-answer input')
        .fill(i < wrong ? 'incorrect-form' : q.solution);
    await dialog.getByRole('button', { name: pt ? 'Conferir' : 'Check', exact: true }).click();
    const why = dialog.getByText(pt ? 'Por que essa forma?' : 'Why this form?', { exact: true });
    if (await why.isVisible()) await why.click();
    await expect(dialog.locator('.learning-insight p[lang="es"]').first()).toBeVisible();
    await dialog.getByRole('button', { name: pt ? 'Continuar' : 'Continue', exact: true }).click();
  }
  await expect(dialog.locator('.routine-finish')).toContainText('Guardado en tu progreso.');
  return dialog;
}
export async function manifest(page: Page, pt = false) {
  return page.evaluate(
    async (name) =>
      new Promise<any>((resolve, reject) => {
        const opening = indexedDB.open(name, 1);
        opening.onerror = () => reject(opening.error);
        opening.onsuccess = () => {
          const db = opening.result;
          const request = db.transaction('values').objectStore('values').get('manifest');
          request.onsuccess = () => {
            resolve(request.result);
            db.close();
          };
          request.onerror = () => reject(request.error);
        };
      }),
    pt ? 'portuguese-os-private-v1' : 'english-os-private-v1',
  );
}
