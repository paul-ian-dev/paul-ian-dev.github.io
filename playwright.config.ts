import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  use: { baseURL: 'http://127.0.0.1:4321' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // --ignore-lock keeps preview in the foreground: Astro otherwise backgrounds it when run by a coding agent,
  // and Playwright treats the exited command as a failed server.
  webServer: {
    command: 'npx astro build && npx astro preview --host 127.0.0.1 --port 4321 --ignore-lock',
    url: 'http://127.0.0.1:4321',
    reuseExistingServer: true,
    timeout: 180_000,
  },
});
