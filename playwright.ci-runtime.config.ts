import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    // In CI with SKIP_BUILD=true (pr-check.yml), the app is already built — just start it.
    // In CI without SKIP_BUILD (deploy.yml), build then start.
    // Locally, build then start.
    command: process.env.SKIP_BUILD
      ? 'npm run start -- -H 127.0.0.1 -p 3000'
      : 'npm run build && npm run start -- -H 127.0.0.1 -p 3000',
    url: 'http://127.0.0.1:3000',
    timeout: 180_000,
    reuseExistingServer: !process.env.CI,
  },
});
