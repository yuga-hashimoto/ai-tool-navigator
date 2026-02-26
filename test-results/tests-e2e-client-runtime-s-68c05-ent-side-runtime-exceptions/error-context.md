# Test info

- Name: core routes have no client-side runtime exceptions
- Location: /app/tests/e2e/client-runtime-smoke.spec.ts:6:5

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
   3 | const ROUTES = ['/', '/en'];
   4 | const CLIENT_EXCEPTION_TEXT = 'Application error: a client-side exception has occurred';
   5 |
>  6 | test('core routes have no client-side runtime exceptions', async ({ page }) => {
     |     ^ Error: browserType.launch: Executable doesn't exist at /home/jules/.cache/ms-playwright/chromium_headless_shell-1169/chrome-linux/headless_shell
   7 |   const runtimeErrors: string[] = [];
   8 |
   9 |   page.on('pageerror', (error) => {
  10 |     runtimeErrors.push(`[pageerror] ${error.message}`);
  11 |   });
  12 |
  13 |   page.on('console', (message) => {
  14 |     if (message.type() === 'error') {
  15 |       runtimeErrors.push(`[console.error] ${message.text()}`);
  16 |     }
  17 |   });
  18 |
  19 |   for (const route of ROUTES) {
  20 |     const response = await page.goto(route, { waitUntil: 'networkidle' });
  21 |     expect(response?.ok(), `route=${route}`).toBeTruthy();
  22 |
  23 |     await expect(
  24 |       page.getByText(CLIENT_EXCEPTION_TEXT, { exact: false }),
  25 |       `route=${route}`,
  26 |     ).toHaveCount(0);
  27 |   }
  28 |
  29 |   await page.waitForTimeout(2_000);
  30 |   expect(runtimeErrors, runtimeErrors.join('\n')).toEqual([]);
  31 | });
  32 |
```