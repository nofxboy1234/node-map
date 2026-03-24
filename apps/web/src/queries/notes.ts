import { queryOptions } from "@tanstack/react-query";
import { getNotes } from "@node-map/api-client";

export const notesQuery = queryOptions({
  queryKey: ["notes"],
  queryFn: () => getNotes(import.meta.env.VITE_API_URL),
  staleTime: 30_000,
});
