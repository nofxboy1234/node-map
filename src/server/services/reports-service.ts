import * as v from "valibot";
import { createReportInputSchema } from "#src/shared";
import type { AppBindings } from "../env";
import { createReport, type ReportRow } from "../repositories/reports-repository";

type CreateReportInput = v.InferOutput<typeof createReportInputSchema>;

function toReportDto(report: ReportRow) {
  return {
    id: report.id,
    description: report.description,
    location: {
      x: report.locationX,
      y: report.locationY,
    },
    devilType: report.devilType,
    urgency: report.urgency,
    status: report.status,
    createdAt: report.createdAt.toISOString(),
  };
}

export async function submitReport(env: AppBindings, input: CreateReportInput) {
  const report = await createReport(env, {
    description: input.description,
    locationX: input.location.x,
    locationY: input.location.y,
    devilType: input.devilType ?? null,
    urgency: input.urgency,
  });

  return toReportDto(report);
}
