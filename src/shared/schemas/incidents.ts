import * as v from "valibot";
import { incidentStatuses, type IncidentStatus } from "#src/shared/domain/psdip";

const transitionIncidentStatuses = [
  "triaging",
  "confirmed",
  "in_operation",
  "resolved",
] as const satisfies readonly Exclude<IncidentStatus, "submitted">[];

export const transitionIncidentStateInputSchema = v.object({
  nextStatus: v.picklist(transitionIncidentStatuses),
});

export const incidentDtoSchema = v.object({
  id: v.string(),
  title: v.string(),
  status: v.picklist(incidentStatuses),
  createdAt: v.string(),
});

export const transitionIncidentStateResponseSchema = v.object({
  incident: incidentDtoSchema,
});
