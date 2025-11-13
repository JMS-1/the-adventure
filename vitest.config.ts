import { playwright } from '@vitest/browser-playwright';
import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { alias: { src: resolve(__dirname, './src') } },
  test: {
    environment: 'jsdom',
    setupFiles: ['src/app/vitest-setup.ts'],
    globals: true,
    sequence: { concurrent: false, shuffle: false, seed: 29091963 },
    isolate: true,
    pool: 'threads',
    include: ['src/**/*.spec.ts'],
    browser: {
      enabled: true,
      provider: playwright(),
      screenshotFailures: false,
      instances: [
        {
          browser: 'chromium',
          launch: { args: ['--remote-debugging-port=29872'] },
        },
      ],
    },
  },
});
