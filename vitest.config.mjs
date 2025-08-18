// vitest.config.mjs
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['src/tests/**/*.test.{js,ts}'],
    exclude: ['node_modules', 'dist', 'build', 'src/e2e/**', 'coverage', 'playwright-report'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'lcov', 'html'],
      reportsDirectory: 'coverage',
      exclude: ['src/e2e/**'],
    },
  },
});
