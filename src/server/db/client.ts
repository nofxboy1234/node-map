import { drizzle } from "drizzle-orm/d1";
import * as schema from "#src/shared/db/schema";
import type { AppBindings } from "../env";

export function getDb(env: AppBindings) {
  return drizzle(env.DB, { schema });
}
