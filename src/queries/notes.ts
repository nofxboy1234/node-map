import { queryOptions } from "@tanstack/react-query";
import { getNotes } from "#src/shared/api";
import { apiBaseUrl } from "../lib/api-base-url";

export const notesQuery = queryOptions({
  queryKey: ["notes"],
  queryFn: () => getNotes(apiBaseUrl),
});
