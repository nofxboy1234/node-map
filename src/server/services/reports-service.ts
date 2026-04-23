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
import { recordIncidentEvent } from "./incident-events-service";

type CreateReportInput = v.InferOutput<typeof createReportInputSchema>;
export type TriageReportActionInput = v.InferOutput<typeof triageReportActionInputSchema>;
export type TriageReportCommandInput = TriageReportActionInput & {
  actorId: string;
};
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
  input: TriageReportCommandInput,
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
      await recordIncidentEvent(env, {
        incidentId: incident.id,
        type: "incident_created",
        actorId: input.actorId,
        payload: {
          incidentId: incident.id,
          reportId: report.id,
          title: incident.title,
        },
      });
      await recordIncidentEvent(env, {
        incidentId: incident.id,
        type: "report_escalated",
        actorId: input.actorId,
        payload: {
          reportId: report.id,
        },
      });
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
