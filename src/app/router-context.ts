import type { QueryClient } from "@tanstack/react-query";
import type { sessionQuery } from "../queries/session";

export type RouterContext = {
  queryClient: QueryClient;
  session?: Awaited<ReturnType<NonNullable<typeof sessionQuery.queryFn>>>;
};
