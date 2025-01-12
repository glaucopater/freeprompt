import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["**/*.test.ts"],
    // setupFiles: ["dotenv/config"], // Load .env file automatically
  },
});
