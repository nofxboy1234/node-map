import { queryOptions } from "@tanstack/react-query";
import { getTriageQueue } from "../shared/api";
import { apiBaseUrl } from "#src/lib/api-base-url.js";

export const triageReportsQuery = queryOptions({
  queryKey: ["reports", "triage"],
  queryFn: () => getTriageQueue(apiBaseUrl),
  staleTime: 0,
});
