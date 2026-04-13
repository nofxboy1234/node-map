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

export async function createReport(env: AppBindings, input: CreateReportRow): Promise<ReportRow> {
  const rows = await getDb(env).insert(reports).values(input).returning();

  return rows[0]!;
}
