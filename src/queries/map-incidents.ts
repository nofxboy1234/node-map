import { queryOptions } from "@tanstack/react-query";
import { getMapIncidents } from "../shared/api";
import { apiBaseUrl } from "#src/lib/api-base-url.js";

export const mapIncidentsQuery = queryOptions({
  queryKey: ["incidenst", "map"],
  queryFn: () => getMapIncidents(apiBaseUrl),
});
