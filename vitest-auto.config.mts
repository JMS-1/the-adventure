/// <reference types="vitest" />

import angular from "@analogjs/vite-plugin-angular";
import { playwright } from "@vitest/browser-playwright";
import { resolve } from "path";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  resolve: { alias: { src: resolve(__dirname, "./src") }, tsconfigPaths: true },
  plugins: [angular()],

  test: {
    globals: true,
    sequence: { concurrent: false, shuffle: false, seed: 29091963 },

    browser: {
      enabled: true,
      provider: playwright(),
      screenshotFailures: false,
      headless: true,
      instances: [{ browser: "chromium" }],
    },

    setupFiles: ["src/app/vitest-setup.ts"],
    include: ["src/**/*.spec.ts"],
    reporters: ["default"],
  },
  define: {
    "import.meta.vitest": mode !== "production",
  },
}));
