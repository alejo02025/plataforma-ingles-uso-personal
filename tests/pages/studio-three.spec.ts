import { test, expect, type Page } from '@playwright/test';
import { ready, go, manifest, offlineReady, finishRoutine } from './navigation';
import { makeRoutine } from '../../src/lib/routine';
import { oralTask } from '../../src/lib/oral-practice';

const sizes = [
  [320, 700],
  [375, 812],
  [390, 844],
  [768, 1024],
  [1024, 768],
  [1280, 800],
  [1440, 900],
] as const;
for (const pt of [false, true]) {
  test(`Studio 3.0: native-first Today, reachable Start and compact five-area navigation in seven viewports (${pt ? 'PT' : 'EN'})`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(pt ? './portugues/' : './');
    await ready(page);
    for (const [width, height] of sizes) {
      await page.setViewportSize({ width, height });
      const nav = page
        .getByRole('navigation', { name: pt ? 'Navegação principal' : 'Main navigation' })
        .filter({ visible: true });
      await expect(nav.getByRole('button')).toHaveCount(5);
      await expect(page.locator('.language-switcher a')).toHaveCount(2);
      await expect(page.locator('.language-switcher a[aria-current=page]')).toContainText(
        pt ? '🇧🇷' : '🇬🇧',
      );
      await expect(page.locator('.start-button')).toBeInViewport();
      expect(
        await page.locator('.start-button').evaluate((el) => {
          const r = el.getBoundingClientRect();
          const bottom = document.querySelector('.mobile-bottom-nav')?.getBoundingClientRect();
          return (
            r.top >= 0 && r.bottom <= innerHeight && (!bottom?.height || r.bottom <= bottom.top)
          );
        }),
      ).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      expect(await page.locator('.today-task').count()).toBeLessThanOrEqual(3);
      await expect(page.locator('.study-cover,.nav-emoji,.workspace-kicker')).toHaveCount(0);
    }
    await page.locator('.start-button').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('.lesson-player')).toBeVisible();
    await expect(page.locator('.lesson-heading .study-spanish')).toBeVisible();
    await page
      .getByRole('button', { name: pt ? 'Começar a prática' : 'Start the practice', exact: true })
      .click();
    const q = pt ? makeRoutine('grammar', 'A1', 0, true) : makeRoutine('grammar', 'A2', 0, false);
    void q;
    await expect(page.locator('.lesson-check')).toHaveCount(1);
    // The word-help launcher remains usable when the duplicate workspace heading is hidden.
    await expect(
      page.getByRole('button', { name: pt ? 'Ajuda com palavras' : 'Word help', exact: true }),
    ).toBeVisible();
    await page.locator('.lesson-check input[value="0"]').check();
    await page
      .getByRole('button', {
        name: pt ? 'Conferir esta resposta' : 'Check this answer',
        exact: true,
      })
      .click();
    await expect(page.locator('.learning-insight')).toBeVisible();
    await expect(page.locator('.learning-insight .study-native')).toBeVisible();
    await expect(page.locator('.learning-insight .study-spanish').first()).toBeVisible();
    expect(
      await page.locator('.learning-insight').evaluate((el) => getComputedStyle(el).position),
    ).toBe('static');
    for (const [width, height] of sizes) {
      await page.setViewportSize({ width, height });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    }
    expect(errors).toEqual([]);
  });
  test(`Studio 3.0: typed drafts, hints, first answers, uncertain alternatives and mistake history survive offline reload (${pt ? 'PT' : 'EN'})`, async ({
    page,
    context,
  }) => {
    test.setTimeout(120000);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(pt ? './portugues/' : './');
    await ready(page);
    await offlineReady(page);
    await go(page, 'Home');
    await page
      .getByLabel(pt ? 'Tempo disponível' : 'Time available', { exact: true })
      .selectOption('30');
    await page
      .locator('.today-task')
      .filter({ hasText: pt ? 'Construa frases' : 'Build sentences' })
      .click();
    const room = page.locator('.routine-session');
    // Today launches outside main; its native prose must still support word help.
    const prose = room.locator('.exercise-context > p').first();
    await prose.scrollIntoViewIfNeeded();
    const point = await prose.evaluate(
      (el, word) => {
        const node = el.firstChild!,
          start = (node.textContent || '').indexOf(word);
        if (start < 0) throw Error('Authored context word missing');
        const range = document.createRange();
        range.setStart(node, start);
        range.setEnd(node, start + word.length);
        const r = range.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      },
      pt ? 'Você' : 'work',
    );
    await page.mouse.click(point.x, point.y);
    await expect(page.locator('.word-cloud')).toBeVisible();
    await page
      .getByRole('button', {
        name: pt ? 'Fechar ajuda com palavras' : 'Close word help',
        exact: true,
      })
      .click();
    const set = makeRoutine('grammar', pt ? 'A1' : 'A2', 0, pt, { edition: 3, variant: 0 });
    const chooseTiles = async () => {
      let remaining = set.rounds[0].solution;
      const tokens = [...set.rounds[0].choices];
      while (tokens.length) {
        const token = tokens
          .filter((t) => remaining === t || remaining.startsWith(t + ' '))
          .sort((a, b) => b.length - a.length)[0];
        expect(token).toBeTruthy();
        await room
          .locator('.routine-tiles')
          .getByRole('button', { name: token, exact: true })
          .and(room.locator('button:enabled'))
          .first()
          .click();
        remaining = remaining.slice(token.length).trim();
        tokens.splice(tokens.indexOf(token), 1);
      }
    };
    await room.locator('.routine-tiles button').first().focus();
    await page.keyboard.press('Enter');
    await expect(room.locator('.routine-answer button')).toHaveCount(1);
    await room.getByRole('button', { name: pt ? 'Desfazer' : 'Undo', exact: true }).click();
    await expect(room.locator('.routine-answer button')).toHaveCount(0);
    await chooseTiles();
    const check = () =>
      room.getByRole('button', { name: pt ? 'Conferir' : 'Check', exact: true }).click();
    const next = () =>
      room.getByRole('button', { name: pt ? 'Continuar' : 'Continue', exact: true }).click();
    await check();
    await next();
    await room.locator('.exercise-text-answer input').fill(set.rounds[1].solution);
    await room
      .getByRole('button', { name: pt ? 'Pausar atividade' : 'Pause activity', exact: true })
      .click();
    await context.setOffline(true);
    await page.reload();
    await ready(page);
    await go(page, 'Practice');
    await page.locator('.review-practice .practice-options .activity-row').nth(1).click();
    await expect(room.locator('.exercise-position')).toContainText('2 / 6');
    await expect(room.locator('.exercise-text-answer input')).toHaveValue(set.rounds[1].solution);
    await room.locator('.exercise-hint > summary').click();
    await check();
    await next();
    await room
      .locator('.exercise-text-answer input')
      .fill(pt ? 'Eu não moro nessa cidade.' : 'I did not commute yesterday.');
    await check();
    await expect(room).toContainText('Esta versión necesita revisión');
    await next();
    await room.locator('.exercise-text-answer input').fill(set.rounds[3].source!);
    await check();
    await expect(room.locator('.learning-insight .study-spanish').first()).toContainText(
      set.rounds[3].why,
    );
    await next();
    await room.getByRole('radio', { name: set.rounds[4].solution, exact: true }).check();
    await check();
    await next();
    await room.locator('.exercise-text-answer input').fill(set.rounds[5].solution);
    await check();
    await next();
    await expect(room.locator('.routine-score')).toContainText('4 / 5');
    await expect(room.locator('.routine-finish')).toContainText('1 respuestas abiertas');
    const saved = await manifest(page, pt);
    const result = saved.data.results.find((r: any) => r.activity_id.startsWith('routine:'));
    const body = JSON.parse(result.answers);
    expect(body.edition).toBe(3);
    expect(body.responses[2]).toBe(
      pt ? 'Eu não moro nessa cidade.' : 'I did not commute yesterday.',
    );
    expect(body.unverified).toBe(1);
    expect(body.helpUsed).toBe(true);
    expect(body.support).toHaveLength(2);
    expect(body.support.some((s: any) => s.kind === 'word')).toBe(true);
    expect(body.feedback[2].correct).toBeNull();
    expect(saved.data.mistakes).toHaveLength(1);
    await room
      .getByRole('button', { name: pt ? 'Voltar ao percurso' : 'Back to the path', exact: true })
      .click();
    await go(page, 'Errors');
    await expect(page.locator('.mistake-entry')).toHaveCount(1);
    await page.locator('.mistake-entry > summary').click();
    await expect(page.locator('.mistake-entry .study-native')).toContainText(
      set.rounds[3].explanationNative!,
    );
    await expect(page.locator('.mistake-entry .insight-response')).toContainText(
      set.rounds[3].source!,
    );
    await page.locator('.pending-productions > summary').click();
    await expect(page.locator('.pending-productions')).toContainText(body.responses[2]);
    await page.reload();
    await ready(page);
    await go(page, 'Errors');
    await expect(page.locator('.mistake-entry')).toHaveCount(1);
    expect((await manifest(page, pt)).data.results).toHaveLength(1);
  });
  test(`Studio 3.0: a persisted edition 2 sequence resumes its original blocks and is not reinterpreted as edition 3 (${pt ? 'PT' : 'EN'})`, async ({
    page,
  }) => {
    await page.goto(pt ? './portugues/' : './');
    await ready(page);
    const old = makeRoutine('grammar', pt ? 'A1' : 'A2', 0, pt, { edition: 2, variant: 0 });
    await page.evaluate(
      ({ pt, token }) => {
        const prefix = pt ? 'portuguese:' : '';
        const id = crypto.randomUUID();
        localStorage.setItem(
          prefix + 'routine-draft:v1',
          JSON.stringify({
            id,
            mode: 'grammar',
            level: pt ? 'A1' : 'A2',
            block: 0,
            edition: 2,
            variant: 0,
            answers: [],
            choice: '',
            picked: [0],
            checked: false,
            helpUsed: false,
            seconds: 19,
          }),
        );
      },
      { pt, token: old.rounds[0].choices[0] },
    );
    await go(page, 'Practice');
    await page.locator('.review-practice .practice-options .activity-row').nth(1).click();
    const room = page.locator('.routine-session');
    await expect(room.locator('.routine-answer button')).toHaveText([old.rounds[0].choices[0]]);
    await expect(room.locator('.exercise-text-answer')).toHaveCount(0);
    await room.getByRole('button', { name: pt ? 'Recomeçar' : 'Clear', exact: true }).click();
    await finishRoutine(page, pt, 'grammar');
    const saved = (await manifest(page, pt)).data.results;
    expect(JSON.parse(saved[0].answers).edition).toBe(2);
    expect(saved[0].correct).toBe(6);
  });
  test(`Studio 3.0: available synthetic listening is a real saved daily task, isolated from the other language (${pt ? 'PT' : 'EN'})`, async ({
    page,
  }) => {
    await page.addInitScript(() => {
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
            { lang: 'en-US', localService: true },
            { lang: 'pt-BR', localService: true },
          ],
          cancel: () => {},
          speak: (speech: any) => {
            speech.onstart?.();
            setTimeout(() => speech.onend?.(), 10);
          },
        },
      });
    });
    await page.goto(pt ? './portugues/' : './');
    await ready(page);
    await page
      .locator('.today-task')
      .filter({ hasText: pt ? 'Ouça uma situação curta' : 'Listen to a short situation' })
      .click();
    const room = page.locator('.oral-room');
    await expect(
      room.getByText(pt ? 'Escute para entender.' : 'Listen for meaning.', { exact: true }),
    ).toBeVisible();
    await room
      .getByRole('button', { name: pt ? 'Ouvir o recado' : 'Listen to the message', exact: true })
      .click();
    const task = oralTask(pt ? 'A1' : 'A2', pt);
    for (let i = 0; i < 2; i++)
      await room.getByRole('radio', { name: task.options[i][0], exact: true }).check();
    await room
      .getByRole('button', { name: pt ? 'Salvar prática' : 'Save practice', exact: true })
      .click();
    await expect(room.locator('.oral-saved')).toContainText('2 / 2');
    await go(page, 'Home');
    await expect(page.locator('.today-completion')).toContainText(pt ? '1 de 4' : '1 of 4');
    await page.reload();
    await ready(page);
    await expect(page.locator('.today-completion')).toContainText(pt ? '1 de 4' : '1 of 4');
    await page.locator('.language-switcher a:not([aria-current])').click();
    await ready(page);
    await expect(page.locator('.today-completion')).toContainText(pt ? '0 of 4' : '0 de 4');
  });
  test(`Lingua: quiet background keeps the daily action usable with reduced motion (${pt ? 'PT' : 'EN'})`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 320, height: 700 });
    await page.goto(pt ? './portugues/' : './');
    await ready(page);
    await expect(page.locator('.studio-atmosphere,.studio-orb')).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await expect(page.locator('.start-button')).toBeInViewport();
    await page.locator('.start-button').click();
    await expect(page.locator('.lesson-player')).toBeVisible();
    await go(page, 'Settings');
    await expect(page.locator('.local-backup')).toBeVisible();
    await expect(page.locator('.motion-preference')).toHaveCount(0);
    await page.getByLabel(pt ? 'Aparência' : 'Appearance', { exact: true }).selectOption('dark');
    await page
      .getByRole('button', { name: pt ? 'Salvar preferências' : 'Save preferences', exact: true })
      .click();
    await page.reload();
    await ready(page);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.locator('.start-button')).toBeInViewport();
  });
}
