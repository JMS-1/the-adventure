/// <reference types="vitest" />
import { defineConfig } from 'vite';

import angular from '@analogjs/vite-plugin-angular';

export default defineConfig(({ mode }) => ({
  plugins: [angular()],
  test: {
    globals: true,
    setupFiles: ['src/test-setup.ts'],
    // environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    // Vitest browser config
    browser: {
      enabled: true,
      name: 'chromium',
      headless: false, // set to true in CI
      provider: 'playwright',
    },
  },
  define: {
    'import.meta.vitest': mode !== 'production',
  },
}));
