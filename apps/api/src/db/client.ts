import { notes } from "@node-map/db";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

type Schema = {
  notes: typeof notes;
};

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

const db = drizzle<Schema>({
  client,
  schema: { notes },
});

export function getDb() {
  return db;
}
