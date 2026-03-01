import { expect, test } from '@playwright/test';

const ROUTES = ['/', '/en'];
const CLIENT_EXCEPTION_TEXT = 'Application error: a client-side exception has occurred';

test('core routes have no client-side runtime exceptions', async ({ page }) => {
  test.setTimeout(120000);
  const runtimeErrors: string[] = [];

  page.on('pageerror', (error) => {
    runtimeErrors.push(`[pageerror] ${error.message}`);
  });

  page.on('console', (message) => {
    if (message.type() === 'error') {
      runtimeErrors.push(`[console.error] ${message.text()}`);
    }
  });

  // Set security bypass header for CI tests
  const bypassSecret = process.env.ENCRYPTION_KEY || 'ci-bypass-token-2025';

  // Use page.route to only add the bypass header to requests for our own application
  // This prevents CORS errors when fetching 3rd party resources (like ipapi.co)
  await page.route('**/*', async (route) => {
    const url = route.request().url();

    if (url.includes('ipapi.co')) {
      // Mock ipapi.co to avoid CORS issues and external dependencies in CI
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          country_code: 'US',
          country_name: 'United States',
          region: 'California',
          city: 'Mountain View',
          timezone: 'America/Los_Angeles',
          currency: 'USD',
          in_eu: false,
        }),
      });
    } else if (url.includes('localhost') || url.includes('127.0.0.1')) {
      const headers = {
        ...route.request().headers(),
        'x-security-bypass': bypassSecret,
      };
      await route.continue({ headers });
    } else {
      await route.continue();
    }
  });

  const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:3000';

  for (const route of ROUTES) {
    const fullUrl = route.startsWith('http') ? route : `${baseUrl}${route}`;
    console.log(`Navigating to ${fullUrl}...`);
    const response = await page.goto(fullUrl, { waitUntil: 'networkidle', timeout: 60000 });
    expect(response?.ok(), `route=${route} status=${response?.status()}`).toBeTruthy();

    await expect(
      page.getByText(CLIENT_EXCEPTION_TEXT, { exact: false }),
      `route=${route}`,
    ).toHaveCount(0);
  }

  await page.waitForTimeout(2_000);
  expect(runtimeErrors, runtimeErrors.join('\n')).toEqual([]);
});
