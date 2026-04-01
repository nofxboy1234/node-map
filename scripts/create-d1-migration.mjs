import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const migrationName = process.argv[2];
if (!migrationName) {
  throw new Error("Missing migration name. Run: vp run @node-map/db#create:d1-migration -- <name>");
}

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dbDir = resolve(rootDir, "packages/db");
const migrationsDir = resolve(dbDir, "migrations");
const wranglerBin = resolve(rootDir, "node_modules/.bin/wrangler");
const wranglerConfigPath = resolve(dbDir, "../../apps/api/wrangler.jsonc");
const configHome = resolve(rootDir, "apps/api/.wrangler-config");

const drizzleMigrationPath = getLatestDrizzleMigrationPath();
const drizzleSql = readFileSync(drizzleMigrationPath, "utf8");
assertHasNewDrizzleMigration(drizzleSql);

const beforeFiles = getFlatMigrationFiles();
run(
  wranglerBin,
  ["d1", "migrations", "create", "node-map", migrationName, "--config", wranglerConfigPath],
  dbDir,
  {
    ...process.env,
    XDG_CONFIG_HOME: configHome,
  },
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
    throw new Error("Missing Drizzle migration. Run: vp run @node-map/db#generate");
  }

  return latestPath;
}

function getFlatMigrationFiles() {
  return new Set(getFlatMigrationPaths());
}

function getCreatedMigrationPath(beforeFiles) {
  const createdPaths = getFlatMigrationPaths().filter((path) => !beforeFiles.has(path));
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
