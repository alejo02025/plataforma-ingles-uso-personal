import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';
export default defineConfig({
  testDir: './tests/pages',
  workers: 1,
  timeout: 90000,
  use: {
    baseURL: 'http://127.0.0.1:3200/plataforma-ingles-uso-personal/',
    trace: 'retain-on-failure',
    launchOptions: {
      executablePath:
        process.env.PLAYWRIGHT_EXECUTABLE_PATH ||
        (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined),
      args: ['--no-sandbox'],
    },
  },
  webServer: {
    command: 'node scripts/serve-pages.mjs',
    url: 'http://127.0.0.1:3200/plataforma-ingles-uso-personal/',
    reuseExistingServer: false,
  },
});
