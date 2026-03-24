import { defineConfig } from "vite-plus";

export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  lint: {
    ignorePatterns: [
      "apps/web/src/routeTree.gen.ts",
      "src/**",
      "server/**",
      "packages/db/migrations/**",
    ],
    options: { typeAware: true, typeCheck: true },
  },
  fmt: {
    ignorePatterns: [
      "apps/web/src/routeTree.gen.ts",
      "src/**",
      "server/**",
      "packages/db/migrations/**",
    ],
  },
});
