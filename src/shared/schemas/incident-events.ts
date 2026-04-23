import * as v from "valibot";
import { incidentEventTypes } from "#src/shared/domain/psdip";

export const incidentEventPayloadSchema = v.record(v.string(), v.unknown());

export const incidentEventDtoSchema = v.object({
  id: v.string(),
  incidentId: v.string(),
  type: v.picklist(incidentEventTypes),
  actorId: v.nullable(v.string()),
  payload: incidentEventPayloadSchema,
  createdAt: v.string(),
});

export const getIncidentEventsResponseSchema = v.object({
  events: v.array(incidentEventDtoSchema),
});
