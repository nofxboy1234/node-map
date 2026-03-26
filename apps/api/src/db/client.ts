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

const client = postgres(databaseUrl);

const db = drizzle({
  client,
  schema,
});

export function getDb() {
  return db;
}
