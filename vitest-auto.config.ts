import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  resolve: { alias: { src: resolve(__dirname, './src') } },
  test: {
    environment: 'jsdom',
    setupFiles: ['src/app/vitest-setup.ts'],
    globals: true,
    sequence: { concurrent: false, shuffle: false, seed: 29091963 },
    browser: {
      enabled: true,
      headless: true,
      provider: 'playwright',
      instances: [{ browser: 'chromium' }],
      screenshotFailures: false,
    },
  },
});
