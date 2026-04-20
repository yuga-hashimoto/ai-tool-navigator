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
      const text = message.text();
      if (text.includes('ipapi.co') || text.includes('Failed to load resource: net::ERR_FAILED')) {
        return;
      }
      runtimeErrors.push(`[console.error] ${text}`);
    }
  });

  for (const route of ROUTES) {
    const response = await page.goto(route, { waitUntil: 'networkidle' });
    expect(response?.ok(), `route=${route}`).toBeTruthy();

    await expect(
      page.getByText(CLIENT_EXCEPTION_TEXT, { exact: false }),
      `route=${route}`,
    ).toHaveCount(0);
  }

  await page.waitForTimeout(2_000);
  expect(runtimeErrors, runtimeErrors.join('\n')).toEqual([]);
});
