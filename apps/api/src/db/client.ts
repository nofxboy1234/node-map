import * as schema from "@node-map/db";
import { drizzle } from "drizzle-orm/d1";
import type { AppBindings } from "../env";

export function getDb(env: AppBindings) {
  return drizzle(env.DB, { schema });
}
