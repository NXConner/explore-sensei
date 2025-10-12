import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    deps: { inline: [/.*/] },
    exclude: [
      "e2e/**",
      "node_modules/**",
      "dist/**",
      "build/**",
      ".*/**",
    ],
    setupFiles: [],
    alias: {
      "@": new URL("./src/", import.meta.url).pathname,
    },
    css: true,
    typecheck: {
      tsconfig: "tsconfig.vitest.json",
    },
  },
});
