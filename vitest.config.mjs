// vitest.config.mjs
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
<<<<<<< HEAD
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
=======
    // JSDOM lets DOM-y tests run if you add any later; harmless for pure logic tests.
    environment: 'jsdom',

    // Your unit test locations
    include: ['src/tests/**/*.test.{js,ts}'],

    // Keep unit tests from wandering into build outputs or e2e artifacts
    exclude: [
      'node_modules',
      'dist',
      'build',
      'src/e2e/**',
      'coverage',
      'playwright-report'
    ],

    // Coverage is generated in CI on one Node version (per your workflow)
    coverage: {
      reporter: ['text', 'json-summary', 'lcov', 'html'],
      reportsDirectory: 'coverage',
      exclude: ['src/e2e/**']
    }
  }
>>>>>>> 7634b7a9 (ci: add Vitest coverage summary + HTML artifact)
});
