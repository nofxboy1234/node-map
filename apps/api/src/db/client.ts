import * as schema from "@node-map/db";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import { resolve } from "node:path";
import postgres from "postgres";

config({ path: resolve(process.cwd(), "../../.env.local"), quiet: true });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("Missing DATABASE_URL");
}

const parsedDatabaseUrl = new URL(databaseUrl);
const databaseName = parsedDatabaseUrl.pathname.slice(1);
if (!databaseName) {
  throw new Error("Missing database name");
}

const client = parsedDatabaseUrl.hostname
  ? postgres(databaseUrl)
  : postgres({
      host: "/run/postgresql",
      database: databaseName,
      user: parsedDatabaseUrl.username || process.env.USER,
    });

const db = drizzle({
  client,
  schema,
});

export function getDb() {
  return db;
}
