import { defineConfig } from "vite-plus";

export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  lint: {
    ignorePatterns: ["apps/web/src/routeTree.gen.ts", "src/**", "server/**"],
    options: { typeAware: true, typeCheck: true },
  },
  fmt: {},
});
