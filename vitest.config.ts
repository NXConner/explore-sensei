import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    passWithNoTests: true,
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
    coverage: {
      reporter: ["text", "json", "lcov"],
      thresholds: {
        lines: 85,
        functions: 85,
        branches: 80,
        statements: 85,
      },
    },
  },
});
