import { count, desc, eq } from "drizzle-orm";
import { incidentReports, incidents } from "#src/shared/db/schema";
import { getDb } from "../db/client";
import type { AppBindings } from "../env";

export type IncidentRow = typeof incidents.$inferSelect;

type CreateIncidentRow = {
  title: string;
  locationX: number;
  locationY: number;
};

export async function createIncident(env: AppBindings, input: CreateIncidentRow) {
  const rows = await getDb(env).insert(incidents).values(input).returning();
  return rows[0]!;
}

export async function createIncidentReportLink(
  env: AppBindings,
  incidentId: string,
  reportId: string,
) {
  await getDb(env).insert(incidentReports).values({ incidentId, reportId });
}

export async function findIncidentById(
  env: AppBindings,
  incidentId: string,
): Promise<IncidentRow | undefined> {
  const rows = await getDb(env)
    .select()
    .from(incidents)
    .where(eq(incidents.id, incidentId))
    .limit(1);
  return rows[0];
}

export async function countIncidentReports(env: AppBindings, incidentId: string) {
  const rows = await getDb(env)
    .select({ value: count() })
    .from(incidentReports)
    .where(eq(incidentReports.incidentId, incidentId));
  return rows[0]!.value;
}

export async function updateIncidentStatus(
  env: AppBindings,
  incidentId: string,
  status: IncidentRow["status"],
) {
  const rows = await getDb(env)
    .update(incidents)
    .set({ status })
    .where(eq(incidents.id, incidentId))
    .returning();
  return rows[0]!;
}

export async function listMapIncidents(env: AppBindings) {
  return getDb(env)
    .select({
      id: incidents.id,
      title: incidents.title,
      status: incidents.status,
      createdAt: incidents.createdAt,
      locationX: incidents.locationX,
      locationY: incidents.locationY,
    })
    .from(incidents)
    .orderBy(desc(incidents.createdAt));
}
