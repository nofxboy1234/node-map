import assert from "node:assert";
import { existsSync, rmSync, symlinkSync } from "node:fs";

const source = new URL("../node_modules/.pnpm/node_modules/vitest", import.meta.url);
const target = new URL("../node_modules/vitest", import.meta.url);

assert(existsSync(source), "Missing node_modules/.pnpm/node_modules/vitest");

rmSync(target, {
  force: true,
  recursive: true,
});

symlinkSync(source, target, "dir");
