import { defineProject } from "vitest/config";

export default defineProject({
  test: {
    name: "unit",
    exclude: ["test/**/*.worker.spec.ts"],
    include: ["test/**/*.spec.ts"],
  },
});
