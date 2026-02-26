import { expect, test } from '@playwright/test';

// Use explicit full URLs to avoid "Cannot navigate to invalid URL" errors in CI
// if baseURL resolution fails.
const BASE_URL = 'http://127.0.0.1:3000';
const ROUTES = ['/', '/en'];
const CLIENT_EXCEPTION_TEXT = 'Application error: a client-side exception has occurred';

test('core routes have no client-side runtime exceptions', async ({ page }) => {
  const runtimeErrors: string[] = [];

  page.on('pageerror', (error) => {
    runtimeErrors.push(`[pageerror] ${error.message}`);
  });

  page.on('console', (message) => {
    if (message.type() === 'error') {
      runtimeErrors.push(`[console.error] ${message.text()}`);
    }
  });

  for (const route of ROUTES) {
    // Construct full URL to be safe
    const fullUrl = `${BASE_URL}${route}`;
    console.log(`Navigating to: ${fullUrl}`);

    const response = await page.goto(fullUrl, { waitUntil: 'networkidle' });
    expect(response?.ok(), `route=${route}`).toBeTruthy();

    await expect(
      page.getByText(CLIENT_EXCEPTION_TEXT, { exact: false }),
      `route=${route}`,
    ).toHaveCount(0);
  }

  await page.waitForTimeout(2_000);
  expect(runtimeErrors, runtimeErrors.join('\n')).toEqual([]);
});
