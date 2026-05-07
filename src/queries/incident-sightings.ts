import { apiBaseUrl } from "#src/lib/api-base-url";
import { getSightings } from "#src/shared/api";
import { queryOptions } from "@tanstack/react-query";

export function incidentSightingsQuery(incidentId: string) {
  return queryOptions({
    queryKey: ["incidents", incidentId, "sightings"],
    queryFn: () => getSightings(apiBaseUrl, incidentId),
  });
}
