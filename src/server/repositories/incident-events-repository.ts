import { eq } from "drizzle-orm";
import { incidentEvents } from "#src/shared/db/schema";
import { getDb } from "../db/client";
import type { AppBindings } from "../env";

export type IncidentEventRow = typeof incidentEvents.$inferSelect;

type CreateIncidentEventRow = {
  incidentId: string;
  type: IncidentEventRow["type"];
  actorId: string | null;
  payload: string;
};

export async function createIncidentEvent(env: AppBindings, input: CreateIncidentEventRow) {
  const rows = await getDb(env).insert(incidentEvents).values(input).returning();
  return rows[0]!;
}

export async function listIncidentEvents(env: AppBindings, incidentId: string) {
  return getDb(env)
    .select()
    .from(incidentEvents)
    .where(eq(incidentEvents.incidentId, incidentId))
    .orderBy(incidentEvents.createdAt);
}
