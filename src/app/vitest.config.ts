import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    setupFiles: ['vitest-setup.ts'],
    browser: {
      enabled: true,
      instances: [{ browser: 'chrome' }],
    },
  },
});
