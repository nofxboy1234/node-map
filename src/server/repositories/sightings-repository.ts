import { sightings } from "#src/shared/db/schema";
import { eq } from "drizzle-orm";
import { getDb } from "../db/client";
import type { AppBindings } from "../env";

export type SightingRow = typeof sightings.$inferSelect;

type CreateSightingRow = {
  incidentId: string;
  positionX: number;
  positionY: number;
  source: SightingRow["source"];
  confidence: number;
};

export async function createSighting(env: AppBindings, input: CreateSightingRow) {
  const rows = await getDb(env).insert(sightings).values(input).returning();
  return rows[0];
}

export async function listIncidentSightings(env: AppBindings, incidentId: string) {
  return getDb(env)
    .select()
    .from(sightings)
    .where(eq(sightings.incidentId, incidentId))
    .orderBy(sightings.createdAt);
}
