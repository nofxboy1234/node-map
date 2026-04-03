import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const migrationsDir = resolve(rootDir, "migrations");
const drizzleBin = resolve(rootDir, "node_modules/.bin/drizzle-kit");
const wranglerBin = resolve(rootDir, "node_modules/.bin/wrangler");
const wranglerConfigPath = resolve(rootDir, "wrangler.jsonc");

run(drizzleBin, ["generate"], rootDir);

const drizzleMigrationPath = getLatestDrizzleMigrationPath();
if (!drizzleMigrationPath) {
  console.log("No Drizzle migrations found.");
  process.exit(0);
}

const drizzleSql = readFileSync(drizzleMigrationPath, "utf8");
const matchingFlatMigrationPath = getMatchingFlatMigrationPath(drizzleSql);
if (matchingFlatMigrationPath) {
  console.log(
    `No new D1 migration to create. Latest Drizzle SQL already matches ${basename(matchingFlatMigrationPath)}.`,
  );
  process.exit(0);
}

const migrationName = basename(dirname(drizzleMigrationPath));
const beforeFiles = getFlatMigrationFiles();
run(
  wranglerBin,
  ["d1", "migrations", "create", "node-map", migrationName, "--config", wranglerConfigPath],
  rootDir,
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

  return migrationDirs.at(-1);
}

function getMatchingFlatMigrationPath(drizzleSql) {
  const normalizedDrizzleSql = normalizeSql(drizzleSql);

  for (const flatMigrationPath of getFlatMigrationPaths()) {
    const flatMigrationSql = readFileSync(flatMigrationPath, "utf8");
    if (normalizeSql(flatMigrationSql) === normalizedDrizzleSql) {
      return flatMigrationPath;
    }
  }

  return null;
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

function normalizeSql(sql) {
  return sql.trim();
}

function run(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    env: process.env,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    throw new Error(`Command failed: ${command}`);
  }
}
