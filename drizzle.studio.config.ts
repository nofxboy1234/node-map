import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/shared/db/schema.ts",
  out: "./migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: ".wrangler/state/v3/d1/miniflare-D1DatabaseObject/6cd7c6191fa9c059e90939845c92fad32fcecb0f4fa80c0017e27f8b5843a40a.sqlite",
  },
});
