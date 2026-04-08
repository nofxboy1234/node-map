import type { QueryClient } from "@tanstack/react-query";
import type { Session } from "../queries/session";

export type RouterContext = {
  queryClient: QueryClient;
  session?: Session;
};
