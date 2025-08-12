// vitest.config.js
import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    include: ['src/tests/**/*.test.{js,ts}'],
    exclude: ['src/e2e/**', 'node_modules/**', 'dist/**'],
  },
});
