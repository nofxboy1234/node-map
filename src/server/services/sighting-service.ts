import {
  createSightingInputSchema,
  createSightingResponseSchema,
  getSightingsResponseSchema,
} from "#src/shared";
import type { AppBindings } from "../env";
import * as v from "valibot";
import { findIncidentById } from "../repositories/incidents-repository";
import {
  createSighting,
  listIncidentSightings,
  type SightingRow,
} from "../repositories/sightings-repository";
import { recordIncidentEvent } from "./incident-events-service";

export type CreateSightingInput = v.InferOutput<typeof createSightingInputSchema>;
export type SubmitSightingCommandInput = CreateSightingInput & {
  actorId: string;
};
type CreateSightingResult = v.InferOutput<typeof createSightingResponseSchema>;

type GetIncidentSightingsResult = v.InferOutput<typeof getSightingsResponseSchema>;

export type SubmitSightingOutcome =
  | {
      kind: "success";
      value: CreateSightingResult;
    }
  | {
      kind: "incident_not_found";
    };

export type GetIncidentSightingsOutcome =
  | {
      kind: "success";
      value: GetIncidentSightingsResult;
    }
  | {
      kind: "incident_not_found";
    };

function toSightingDto(sighting: SightingRow) {
  return {
    id: sighting.id,
    incidentId: sighting.incidentId,
    position: {
      x: sighting.positionX,
      y: sighting.positionY,
    },
    source: sighting.source,
    confidence: sighting.confidence,
    createdAt: sighting.createdAt.toISOString(),
  };
}

export async function submitSighting(
  env: AppBindings,
  incidentId: string,
  input: SubmitSightingCommandInput,
): Promise<SubmitSightingOutcome> {
  const incident = await findIncidentById(env, incidentId);

  if (!incident) {
    return {
      kind: "incident_not_found",
    };
  }

  const sighting = await createSighting(env, {
    confidence: input.confidence,
    incidentId: incident.id,
    positionX: input.position.x,
    positionY: input.position.y,
    source: input.source,
  });
  await recordIncidentEvent(env, {
    incidentId: incident.id,
    type: "sighting_added",
    actorId: input.actorId,
    payload: {
      sightingId: sighting.id,
      position: {
        x: sighting.positionX,
        y: sighting.positionY,
      },
      source: sighting.source,
      confidence: sighting.confidence,
    },
  });

  return {
    kind: "success",
    value: {
      sighting: toSightingDto(sighting),
    },
  };
}

export async function getIncidentSightings(
  env: AppBindings,
  incidentId: string,
): Promise<GetIncidentSightingsOutcome> {
  const incident = await findIncidentById(env, incidentId);

  if (!incident) {
    return {
      kind: "incident_not_found",
    };
  }

  const sightings = await listIncidentSightings(env, incidentId);

  return {
    kind: "success",
    value: {
      sightings: sightings.map(toSightingDto),
    },
  };
}
