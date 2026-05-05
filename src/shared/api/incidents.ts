import * as v from "valibot";
import { mapIncidentResponseSchema, transitionIncidentStateResponseSchema } from "#src/shared";
import type { InferRequestType } from "hono/client";
import { createApiClient } from "./client";

type IncidentsClient = ReturnType<typeof createApiClient>;

type TransitionIncidentStateRoute =
  IncidentsClient["api"]["incidents"][":incidentId"]["state"]["$post"];
type TransitionIncidentStateRequest = InferRequestType<TransitionIncidentStateRoute>;
type TransitionIncidentStateInput = TransitionIncidentStateRequest["json"];
type TransitionIncidentStateParams = TransitionIncidentStateRequest["param"];

export async function getMapIncidents(baseUrl: string) {
  const client = createApiClient(baseUrl);
  const res = await client.api.incidents.$get();

  if (!res.ok) {
    throw new Error();
  }

  return v.parse(mapIncidentResponseSchema, await res.json());
}

export async function transitionIncidentState(
  baseUrl: string,
  incidentId: TransitionIncidentStateParams["incidentId"],
  input: TransitionIncidentStateInput,
) {
  const client = createApiClient(baseUrl);
  const res = await client.api.incidents[":incidentId"].state.$post({
    json: input,
    param: { incidentId },
  });

  if (!res.ok) {
    throw new Error("Failed to transition incident state");
  }

  return v.parse(transitionIncidentStateResponseSchema, await res.json());
}
