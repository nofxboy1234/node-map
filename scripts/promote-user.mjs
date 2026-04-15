import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

export function buildPromoteUserSql(email) {
  assert(email.length > 0, "Missing USER_EMAIL");
  assert(!email.includes("'"), "USER_EMAIL cannot contain single quotes");

  return `UPDATE user SET role='internal_user' WHERE email='${email}';`;
}

export function runPromoteUser({
  email = process.env.USER_EMAIL ?? "you@example.com",
  spawn = spawnSync,
} = {}) {
  const sql = buildPromoteUserSql(email);
  const result = spawn(
    "pnpm",
    ["exec", "wrangler", "d1", "execute", "node-map", "--local", "--command", sql],
    {
      stdio: "inherit",
    },
  );

  return result.status ?? 1;
}

const isMain = process.argv[1] ? import.meta.url === pathToFileURL(process.argv[1]).href : false;

if (isMain) {
  const exitCode = runPromoteUser();
  if (exitCode !== 0) {
    process.exit(exitCode);
  }
}
