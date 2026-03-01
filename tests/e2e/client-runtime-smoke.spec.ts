import { expect, test } from '@playwright/test';

const ROUTES = ['/', '/en'];
const CLIENT_EXCEPTION_TEXT = 'Application error: a client-side exception has occurred';

test('core routes have no client-side runtime exceptions', async ({ page }) => {
  const runtimeErrors: string[] = [];

  page.on('pageerror', (error) => {
    runtimeErrors.push(`[pageerror] ${error.message}`);
  });

  page.on('console', (message) => {
    if (message.type() === 'error') {
      // Ignore specific expected or out-of-scope errors during smoke tests
      const text = message.text();
      const ignoredErrors = [
        'ipapi.co/json/',
        'ERR_FAILED'
      ];
      if (!ignoredErrors.some(ignored => text.includes(ignored))) {
        runtimeErrors.push(`[console.error] ${text}`);
      }
    }
  });

  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  for (const route of ROUTES) {
    const response = await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' });
    expect(response?.ok(), `route=${route}`).toBeTruthy();

    await expect(
      page.getByText(CLIENT_EXCEPTION_TEXT, { exact: false }),
      `route=${route}`,
    ).toHaveCount(0);
  }

  await page.waitForTimeout(2_000);
  expect(runtimeErrors, runtimeErrors.join('\n')).toEqual([]);
});
