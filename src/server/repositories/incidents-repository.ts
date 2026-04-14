import { incidentReports, incidents } from "#src/shared/db/schema";
import { getDb } from "../db/client";
import type { AppBindings } from "../env";

export type IncidentRow = typeof incidents.$inferSelect;

export async function createIncident(env: AppBindings, title: string): Promise<IncidentRow> {
  const rows = await getDb(env).insert(incidents).values({ title }).returning();
  return rows[0]!;
}

export async function createIncidentReportLink(
  env: AppBindings,
  incidentId: string,
  reportId: string,
) {
  await getDb(env).insert(incidentReports).values({ incidentId, reportId });
}
