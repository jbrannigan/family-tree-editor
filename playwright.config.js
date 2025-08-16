const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: 'src/e2e',
  // Avoid picking up Vitest files like *.test.js
  testMatch: /.*\.spec\.(js|ts)$/,
  use: { headless: true },
});
