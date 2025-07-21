import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    setupFiles: ['vitest-setup.ts'],
    isolate: false,
    browser: {
      enabled: true,
      instances: [{ browser: 'chrome' }],
    },
  },
});
