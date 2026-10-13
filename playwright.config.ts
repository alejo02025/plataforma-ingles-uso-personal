import { defineConfig } from '@playwright/test';
import { existsSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
const testData = mkdtempSync(path.join(tmpdir(), 'english-os-browser-'));
export default defineConfig({
  testDir: './tests/e2e',
  workers: 1,
  retries: 0,
  timeout: 90_000,
  use: {
    baseURL: 'http://127.0.0.1:3100',
    trace: 'retain-on-failure',
    launchOptions: {
      executablePath:
        process.env.PLAYWRIGHT_EXECUTABLE_PATH ||
        (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined),
      args: ['--no-sandbox'],
    },
  },
  webServer: {
    command: 'npm run start -- --port 3100',
    url: 'http://127.0.0.1:3100',
    reuseExistingServer: false,
    env: {
      ENGLISH_DATA_DIR: testData,
      APP_ACCESS_TOKEN: 'e2e-access-only',
      ENGLISH_REQUIRE_AUTH: '1',
      ENGLISH_AI_API_KEY: '',
    },
    timeout: 30_000,
  },
});
