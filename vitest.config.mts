import { defineConfig } from "vitest/config";

// Server actions and utilities only — no jsdom/React Testing Library, since
// components aren't unit tested (see context/coding-standards.md).
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
