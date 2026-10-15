import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:8932',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium' }],
  webServer: {
    command: 'npm run start -- --port 8932',
    port: 8932,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
