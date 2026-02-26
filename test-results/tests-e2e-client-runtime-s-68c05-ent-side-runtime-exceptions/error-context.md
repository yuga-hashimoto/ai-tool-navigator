# Test info

- Name: core routes have no client-side runtime exceptions
- Location: /app/tests/e2e/client-runtime-smoke.spec.ts:9:5

# Error details

```
Error: browserType.launch: Executable doesn't exist at /home/jules/.cache/ms-playwright/chromium_headless_shell-1169/chrome-linux/headless_shell
╔═════════════════════════════════════════════════════════════════════════╗
║ Looks like Playwright Test or Playwright was just installed or updated. ║
║ Please run the following command to download new browsers:              ║
║                                                                         ║
║     npx playwright install                                              ║
║                                                                         ║
║ <3 Playwright Team                                                      ║
╚═════════════════════════════════════════════════════════════════════════╝
```

# Test source

```ts
   1 | import { expect, test } from '@playwright/test';
   2 |
   3 | // Use explicit full URLs to avoid "Cannot navigate to invalid URL" errors in CI
   4 | // if baseURL resolution fails.
   5 | const BASE_URL = 'http://127.0.0.1:3000';
   6 | const ROUTES = ['/', '/en'];
   7 | const CLIENT_EXCEPTION_TEXT = 'Application error: a client-side exception has occurred';
   8 |
>  9 | test('core routes have no client-side runtime exceptions', async ({ page }) => {
     |     ^ Error: browserType.launch: Executable doesn't exist at /home/jules/.cache/ms-playwright/chromium_headless_shell-1169/chrome-linux/headless_shell
  10 |   const runtimeErrors: string[] = [];
  11 |
  12 |   page.on('pageerror', (error) => {
  13 |     runtimeErrors.push(`[pageerror] ${error.message}`);
  14 |   });
  15 |
  16 |   page.on('console', (message) => {
  17 |     if (message.type() === 'error') {
  18 |       runtimeErrors.push(`[console.error] ${message.text()}`);
  19 |     }
  20 |   });
  21 |
  22 |   for (const route of ROUTES) {
  23 |     // Construct full URL to be safe
  24 |     const fullUrl = `${BASE_URL}${route}`;
  25 |     console.log(`Navigating to: ${fullUrl}`);
  26 |
  27 |     const response = await page.goto(fullUrl, { waitUntil: 'networkidle' });
  28 |     expect(response?.ok(), `route=${route}`).toBeTruthy();
  29 |
  30 |     await expect(
  31 |       page.getByText(CLIENT_EXCEPTION_TEXT, { exact: false }),
  32 |       `route=${route}`,
  33 |     ).toHaveCount(0);
  34 |   }
  35 |
  36 |   await page.waitForTimeout(2_000);
  37 |   expect(runtimeErrors, runtimeErrors.join('\n')).toEqual([]);
  38 | });
  39 |
```