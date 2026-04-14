import { desc, eq } from "drizzle-orm";
import { reports } from "#src/shared/db/schema";
import { getDb } from "../db/client";
import type { AppBindings } from "../env";

export type ReportRow = typeof reports.$inferSelect;

type CreateReportRow = {
  description: string;
  locationX: number;
  locationY: number;
  devilType: string | null;
  urgency: ReportRow["urgency"];
};

type TriagedReportStatus = Exclude<ReportRow["status"], "submitted">;

export function listSubmittedReports(env: AppBindings) {
  return getDb(env)
    .select()
    .from(reports)
    .where(eq(reports.status, "submitted"))
    .orderBy(desc(reports.createdAt));
}

export async function findReportById(
  env: AppBindings,
  reportId: string,
): Promise<ReportRow | undefined> {
  const rows = await getDb(env).select().from(reports).where(eq(reports.id, reportId)).limit(1);
  return rows[0];
}

export async function updateReportStatus(
  env: AppBindings,
  reportId: string,
  status: TriagedReportStatus,
): Promise<ReportRow> {
  const rows = await getDb(env)
    .update(reports)
    .set({ status })
    .where(eq(reports.id, reportId))
    .returning();
  return rows[0]!;
}

export async function createReport(env: AppBindings, input: CreateReportRow): Promise<ReportRow> {
  const rows = await getDb(env).insert(reports).values(input).returning();
  return rows[0]!;
}
