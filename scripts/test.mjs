import "./link-vitest.mjs";
import { spawnSync } from "node:child_process";

const vitestPath = new URL("../node_modules/vitest/vitest.mjs", import.meta.url);

const result = spawnSync(
  process.execPath,
  [vitestPath.pathname, "run", "--config", "./vitest.config.ts"],
  {
    stdio: "inherit",
  },
);

process.exit(result.status ?? 1);
