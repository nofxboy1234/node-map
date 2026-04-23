import * as v from "valibot";
import type { InferRequestType } from "hono";
import { getIncidentEventsResponseSchema } from "../schemas/incident-events";
import { createApiClient } from "./client";

type IncidentEventsClient = ReturnType<typeof createApiClient>;

type GetIncidentEventsRoute =
  IncidentEventsClient["api"]["incidents"][":incidentId"]["events"]["$get"];
type GetIncidentEventsRequest = InferRequestType<GetIncidentEventsRoute>;
type GetIncidentEventsParams = GetIncidentEventsRequest["param"];

export async function getIncidentEvents(
  baseUrl: string,
  incidentId: GetIncidentEventsParams["incidentId"],
) {
  const client = createApiClient(baseUrl);
  const res = await client.api.incidents[":incidentId"].events.$get({
    param: { incidentId },
  });

  if (!res.ok) {
    throw new Error("Failed to get incident events");
  }

  return v.parse(getIncidentEventsResponseSchema, await res.json());
}
