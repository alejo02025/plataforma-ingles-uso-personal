import { test, expect } from '@playwright/test';
for (const pt of [false, true])
  test(`Speaking room supports speech turns, actual local AI, saved text and device voices (${pt ? 'Portuguese' : 'English'})`, async ({
    page,
  }) => {
    test.setTimeout(150000);
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    // Hardware/browser speech services are simulated; model inference below is real.
    await page.addInitScript(() => {
      const log = { starts: [] as string[], spoken: [] as { text: string; lang: string }[] };
      (window as any).__speech = log;
      class Recognition {
        lang = '';
        continuous = false;
        interimResults = false;
        onresult: any;
        onerror: any;
        onend: any;
        start() {
          log.starts.push(this.lang);
          setTimeout(() => {
            this.onresult?.({
              results: [
                [
                  {
                    transcript:
                      this.lang === 'pt-BR'
                        ? 'Hoje eu fui ao parque.'
                        : 'Today I went to the park.',
                  },
                ],
              ],
            });
            this.onend?.();
          }, 100);
        }
        stop() {
          this.onend?.();
        }
        abort() {}
      }
      (window as any).SpeechRecognition = Recognition;
      Object.defineProperty(window, 'speechSynthesis', {
        value: {
          cancel() {},
          getVoices() {
            return [];
          },
          addEventListener() {},
          removeEventListener() {},
          speak(utterance: any) {
            log.spoken.push({ text: utterance.text, lang: utterance.lang });
          },
        },
        configurable: true,
      });
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(pt ? './portugues/' : './');
    await page
      .getByRole('dialog', { name: pt ? 'Palavra do dia' : 'Word of the Day' })
      .getByRole('button', { name: pt ? 'Fechar palavra do dia' : 'Close daily word' })
      .click();
    await page
      .getByRole('button', { name: pt ? 'Abrir aulas' : 'Open classes', exact: true })
      .click();
    await page
      .locator('.foundation-tabs')
      .getByRole('button', { name: pt ? 'Aplicar' : 'Use it', exact: true })
      .click();
    await page
      .getByRole('button', { name: pt ? 'Começar a falar' : 'Start speaking', exact: true })
      .click();
    await expect(page.locator('.voice-room').getByRole('alert')).toContainText(
      pt ? 'reconhecimento local' : 'On-device speech recognition',
    );
    expect(await page.evaluate(() => (window as any).__speech.starts.length)).toBe(0);
    await page.locator('.voice-options summary').click();
    await page
      .getByLabel(
        pt ? 'Permitir reconhecimento de voz do navegador' : 'Allow browser speech recognition',
        { exact: true },
      )
      .check();
    await page
      .getByRole('button', { name: pt ? 'Começar a falar' : 'Start speaking', exact: true })
      .click();
    const words = pt ? 'Hoje eu fui ao parque.' : 'Today I went to the park.';
    await expect(
      page.getByRole('textbox', { name: pt ? 'Suas palavras' : 'Your words', exact: true }),
    ).toHaveValue(words);
    expect(await page.evaluate(() => (window as any).__speech.starts[0])).toBe(
      pt ? 'pt-BR' : 'en-US',
    );
    await page
      .getByRole('button', { name: pt ? 'Ativar tutora local' : 'Enable local tutor', exact: true })
      .click();
    await expect(
      page.getByRole('button', { name: pt ? 'Enviar' : 'Send', exact: true }),
    ).toBeEnabled({ timeout: 90000 });
    await page.getByRole('button', { name: pt ? 'Enviar' : 'Send', exact: true }).click();
    await expect(page.locator('.voice-message.assistant')).toHaveCount(1, { timeout: 60000 });
    const reply = await page.locator('.voice-message.assistant p').innerText();
    console.log(pt ? 'Actual Portuguese oral reply:' : 'Actual English oral reply:', reply);
    expect(reply.trim().length).toBeGreaterThan(0);
    expect(reply).not.toMatch(/I have \d+ years|won an award/);
    await expect
      .poll(() => page.evaluate(() => (window as any).__speech.spoken.length))
      .toBeGreaterThan(0);
    expect(await page.evaluate(() => (window as any).__speech.spoken.at(-1).lang)).toBe(
      pt ? 'pt-BR' : 'en-US',
    );
    await page
      .getByLabel(pt ? 'Suas palavras' : 'Your words', { exact: true })
      .fill(pt ? 'Um rascunho salvo.' : 'A saved draft.');
    await page.reload();
    await page
      .getByRole('button', { name: pt ? 'Abrir aulas' : 'Open classes', exact: true })
      .click();
    await page
      .locator('.foundation-tabs')
      .getByRole('button', { name: pt ? 'Aplicar' : 'Use it', exact: true })
      .click();
    await expect(page.locator('.voice-message.user p')).toHaveText(words);
    await expect(page.locator('.voice-message.assistant p')).toHaveText(reply);
    await expect(
      page.getByRole('textbox', { name: pt ? 'Suas palavras' : 'Your words', exact: true }),
    ).toHaveValue(pt ? 'Um rascunho salvo.' : 'A saved draft.');
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
      .toBe(true);
    await page.screenshot({ path: `/tmp/voice-room-${pt ? 'pt' : 'en'}.png`, fullPage: true });
    expect(errors).toEqual([]);
  });
