import * as v from "valibot";
import {
  createReportInputSchema,
  triageReportActionInputSchema,
  triageReportResponseSchema,
  type ReportStatus,
} from "#src/shared";
import type { AppBindings } from "../env";
import { createIncident, createIncidentReportLink } from "../repositories/incidents-repository";
import {
  createReport,
  findReportById,
  listSubmittedReports,
  type ReportRow,
  updateReportStatus,
} from "../repositories/reports-repository";

type CreateReportInput = v.InferOutput<typeof createReportInputSchema>;
type TriageReportActionInput = v.InferOutput<typeof triageReportActionInputSchema>;
type TriageReportResult = v.InferOutput<typeof triageReportResponseSchema>;

export type TriageReportOutcome =
  | {
      kind: "success";
      value: TriageReportResult;
    }
  | {
      kind: "not_found";
    }
  | {
      kind: "already_triaged";
      status: Exclude<ReportStatus, "submitted">;
    };

function assertNever(value: never): never {
  throw new Error(`Unexpected triage action: ${String(value)}`);
}

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

function toTriageSuccess(report: ReportRow, incidentId: string | null): TriageReportOutcome {
  return {
    kind: "success",
    value: {
      report: toReportDto(report),
      incidentId,
    },
  };
}

export async function getSubmittedReportsForTriage(env: AppBindings) {
  const reports = await listSubmittedReports(env);
  return reports.map(toReportDto);
}

export async function applyTriageAction(
  env: AppBindings,
  reportId: string,
  input: TriageReportActionInput,
): Promise<TriageReportOutcome> {
  const report = await findReportById(env, reportId);

  if (!report) {
    return { kind: "not_found" };
  }

  if (report.status !== "submitted") {
    return {
      kind: "already_triaged",
      status: report.status,
    };
  }

  switch (input.action) {
    case "mark_duplicate": {
      const updated = await updateReportStatus(env, reportId, "duplicate");
      return toTriageSuccess(updated, null);
    }

    case "reject": {
      const updated = await updateReportStatus(env, report.id, "rejected");
      return toTriageSuccess(updated, null);
    }

    case "escalate": {
      const incident = await createIncident(env, input.incidentTitle);
      await createIncidentReportLink(env, incident.id, report.id);
      const updated = await updateReportStatus(env, report.id, "escalated");
      return toTriageSuccess(updated, incident.id);
    }

    default: {
      assertNever(input);
    }
  }
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
