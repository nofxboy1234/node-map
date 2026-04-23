import * as v from "valibot";
import {
  getIncidentEventsResponseSchema,
  incidentEventPayloadSchema,
  type IncidentEventType,
} from "#src/shared";
import { findIncidentById } from "../repositories/incidents-repository";
import {
  createIncidentEvent,
  listIncidentEvents,
  type IncidentEventRow,
} from "../repositories/incident-events-repository";
import type { AppBindings } from "../env";

type IncidentEventPayload = v.InferOutput<typeof incidentEventPayloadSchema>;
type GetIncidentEventsResult = v.InferOutput<typeof getIncidentEventsResponseSchema>;

type RecordIncidentEventInput = {
  incidentId: string;
  type: IncidentEventType;
  actorId: string | null;
  payload: IncidentEventPayload;
};

export type GetIncidentEventsOutcome =
  | {
      kind: "success";
      value: GetIncidentEventsResult;
    }
  | {
      kind: "incident_not_found";
    };

function assertIncidentEventPayload(value: unknown): asserts value is IncidentEventPayload {
  v.parse(incidentEventPayloadSchema, value);
}

function parsePayload(payload: string) {
  const value: unknown = JSON.parse(payload);
  assertIncidentEventPayload(value);
  return value;
}

function toIncidentEventDto(event: IncidentEventRow) {
  return {
    id: event.id,
    incidentId: event.incidentId,
    type: event.type,
    actorId: event.actorId,
    payload: parsePayload(event.payload),
    createdAt: event.createdAt.toISOString(),
  };
}

export async function recordIncidentEvent(env: AppBindings, input: RecordIncidentEventInput) {
  const event = await createIncidentEvent(env, {
    incidentId: input.incidentId,
    type: input.type,
    actorId: input.actorId,
    payload: JSON.stringify(input.payload),
  });

  return toIncidentEventDto(event);
}

export async function getIncidentEvents(
  env: AppBindings,
  incidentId: string,
): Promise<GetIncidentEventsOutcome> {
  const incident = await findIncidentById(env, incidentId);

  if (!incident) {
    return {
      kind: "incident_not_found",
    };
  }

  const events = await listIncidentEvents(env, incidentId);

  return {
    kind: "success",
    value: {
      events: events.map(toIncidentEventDto),
    },
  };
}
