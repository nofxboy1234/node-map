import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const migrationsDir = resolve(rootDir, "migrations");
const wranglerBin = resolve(rootDir, "node_modules/.bin/wrangler");
const wranglerConfigPath = resolve(rootDir, "wrangler.jsonc");

const drizzleMigrationPath = getLatestDrizzleMigrationPath();
const migrationName = process.argv[2] ?? basename(dirname(drizzleMigrationPath));
const drizzleSql = readFileSync(drizzleMigrationPath, "utf8");
assertHasNewDrizzleMigration(drizzleSql);

const beforeFiles = getFlatMigrationFiles();
run(
  wranglerBin,
  ["d1", "migrations", "create", "node-map", migrationName, "--config", wranglerConfigPath],
  rootDir,
  process.env,
);

const createdPath = getCreatedMigrationPath(beforeFiles);
writeFileSync(createdPath, drizzleSql.endsWith("\n") ? drizzleSql : `${drizzleSql}\n`);

console.log(
  `Created ${basename(createdPath)} from ${drizzleMigrationPath.replace(`${rootDir}/`, "")}`,
);

function getLatestDrizzleMigrationPath() {
  const migrationDirs = readdirSync(migrationsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => resolve(migrationsDir, entry.name, "migration.sql"))
    .sort();

  const latestPath = migrationDirs.at(-1);
  if (!latestPath) {
    throw new Error("Missing Drizzle migration. Run: vp run db:generate");
  }

  return latestPath;
}

function getFlatMigrationFiles() {
  return new Set(getFlatMigrationPaths());
}

function getCreatedMigrationPath(beforeFiles) {
  const createdPaths = getFlatMigrationPaths().filter((filePath) => !beforeFiles.has(filePath));
  const createdPath = createdPaths[0];
  if (!createdPath || createdPaths[1]) {
    throw new Error("Expected exactly one new Wrangler migration file");
  }

  return createdPath;
}

function getFlatMigrationPaths() {
  return readdirSync(migrationsDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".sql"))
    .map((entry) => resolve(migrationsDir, entry.name))
    .sort();
}

function assertHasNewDrizzleMigration(drizzleSql) {
  const normalizedDrizzleSql = normalizeSql(drizzleSql);
  for (const flatMigrationPath of getFlatMigrationPaths()) {
    const flatMigrationSql = readFileSync(flatMigrationPath, "utf8");
    if (normalizeSql(flatMigrationSql) === normalizedDrizzleSql) {
      throw new Error(
        `No new Drizzle migration to convert. Latest Drizzle SQL already matches ${basename(flatMigrationPath)}.`,
      );
    }
  }
}

function normalizeSql(sql) {
  return sql.trim();
}

function run(command, args, cwd, env) {
  const result = spawnSync(command, args, {
    cwd,
    env,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    throw new Error(`Command failed: ${command}`);
  }
}
