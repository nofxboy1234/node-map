import * as v from "valibot";
import {
  transitionIncidentStateInputSchema,
  transitionIncidentStateResponseSchema,
  type IncidentStatus,
} from "#src/shared";
import type { AppBindings } from "../env";
import {
  countIncidentReports,
  findIncidentById,
  type IncidentRow,
  updateIncidentStatus,
} from "../repositories/incidents-repository";

type TransitionIncidentStateInput = v.InferOutput<typeof transitionIncidentStateInputSchema>;
type TransitionIncidentStateResponse = v.InferOutput<typeof transitionIncidentStateResponseSchema>;

type NextIncidentStatus = TransitionIncidentStateInput["nextStatus"];

export type TransitionIncidentStateOutcome =
  | {
      kind: "success";
      value: TransitionIncidentStateResponse;
    }
  | {
      kind: "not_found";
    }
  | {
      kind: "invalid_transition";
      currentStatus: IncidentStatus;
      nextStatus: NextIncidentStatus;
    }
  | {
      kind: "rule_violation";
      reason: "missing_linked_reports_for_confirmation";
    };

const allowedIncidentTransitions: Record<IncidentStatus, readonly NextIncidentStatus[]> = {
  submitted: ["triaging"],
  triaging: ["confirmed"],
  confirmed: ["in_operation", "resolved"],
  in_operation: ["resolved"],
  resolved: [],
};

function toIncidentDto(incident: IncidentRow): TransitionIncidentStateResponse["incident"] {
  return {
    id: incident.id,
    title: incident.title,
    status: incident.status,
    createdAt: incident.createdAt.toISOString(),
  };
}

function canTransition(currentStatus: IncidentStatus, nextStatus: NextIncidentStatus) {
  return allowedIncidentTransitions[currentStatus].includes(nextStatus);
}

export async function transitionIncidentState(
  env: AppBindings,
  incidentId: string,
  input: TransitionIncidentStateInput,
): Promise<TransitionIncidentStateOutcome> {
  const incident = await findIncidentById(env, incidentId);

  if (!incident) {
    return { kind: "not_found" };
  }

  const { nextStatus } = input;

  if (!canTransition(incident.status, nextStatus)) {
    return {
      kind: "invalid_transition",
      currentStatus: incident.status,
      nextStatus,
    };
  }

  if (nextStatus === "confirmed") {
    const linkedReports = await countIncidentReports(env, incident.id);
    if (linkedReports < 1) {
      return {
        kind: "rule_violation",
        reason: "missing_linked_reports_for_confirmation",
      };
    }
  }

  const updated = await updateIncidentStatus(env, incident.id, nextStatus);
  return {
    kind: "success",
    value: { incident: toIncidentDto(updated) },
  };
}
