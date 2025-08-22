// playwright.config.js
const { defineConfig } = require('@playwright/test');

const PORT = process.env.PW_PORT || 4173;
const BASE_URL = `http://localhost:${PORT}`;

/**
 * Local dev:
 *   - Starts CRA dev server on PORT and reuses it across runs.
 * CI:
 *   - Serves the production build with `npx serve -s build -l PORT`.
 *   - You must run `npm run build` before `npx playwright test` in CI.
 */
module.exports = defineConfig({
  testDir: 'src/e2e',
  // Avoid picking up Vitest files like *.test.js
  testMatch: /.*\.spec\.(js|ts)$/,
  fullyParallel: true,
  use: {
    baseURL: BASE_URL, // makes page.goto('/') resolve to your server
    headless: true,
  },
  webServer: {
    command: process.env.CI ? `npx serve -s build -l ${PORT}` : `PORT=${PORT} npm start`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
