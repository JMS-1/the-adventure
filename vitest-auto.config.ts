import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    setupFiles: ['src/app/vitest-setup.ts'],
    globals: true,
    browser: {
      enabled: true,
      headless: true,
      provider: 'playwright',
      instances: [{ browser: 'chromium' }],
      screenshotFailures: false,
    },
  },
});
