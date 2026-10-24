import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/static',
  timeout: 45000,
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:8933',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
  webServer: {
    command: 'node tests/static-server.mjs',
    port: 8933,
    reuseExistingServer: true,
    timeout: 30000,
  },
});
