import * as v from "valibot";
import type { InferRequestType } from "hono";
import { createApiClient } from "./client";
import { createSightingResponseSchema, getSightingsResponseSchema } from "../schemas/sightings";

type SightingsClient = ReturnType<typeof createApiClient>;

type CreateSightingRoute = SightingsClient["api"]["incidents"][":incidentId"]["sightings"]["$post"];
type CreateSightingRequest = InferRequestType<CreateSightingRoute>;
type CreateSightingInput = CreateSightingRequest["json"];
type CreateSightingParams = CreateSightingRequest["param"];

export async function createSighting(
  baseUrl: string,
  incidentId: CreateSightingParams["incidentId"],
  input: CreateSightingInput,
) {
  const client = createApiClient(baseUrl);
  const res = await client.api.incidents[":incidentId"].sightings.$post({
    json: input,
    param: { incidentId },
  });

  if (!res.ok) {
    throw new Error("Failed to create sighting for incident");
  }

  return v.parse(createSightingResponseSchema, await res.json());
}

export async function getSightings(
  baseUrl: string,
  incidentId: CreateSightingParams["incidentId"],
) {
  const client = createApiClient(baseUrl);
  const res = await client.api.incidents[":incidentId"].sightings.$get({
    param: { incidentId },
  });

  if (!res.ok) {
    throw new Error("Failed to get sightings");
  }

  return v.parse(getSightingsResponseSchema, await res.json());
}
