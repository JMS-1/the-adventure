import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    setupFiles: ['src/app/vitest-setup.ts'],
    globals: true,
    browser: {
      enabled: true,
      provider: 'playwright',
      instances: [
        {
          browser: 'chromium',
          launch: {
            args: ['--remote-debugging-port=29872'],
          },
        },
      ],
    },
  },
});
