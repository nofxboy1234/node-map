import { cloudflare } from "@cloudflare/vite-plugin";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite-plus";

export default defineConfig({
  plugins: [tanstackRouter(), react(), cloudflare()],
  staged: {
    "*": "vp check --fix",
  },
  lint: {
    ignorePatterns: ["src/routeTree.gen.ts", "migrations/**"],
    options: { typeAware: true, typeCheck: true },
  },
  fmt: {
    ignorePatterns: ["src/routeTree.gen.ts", "migrations/**"],
  },
});
