import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/shared/db/schema.ts",
  out: "./migrations",
  dialect: "sqlite",
});
