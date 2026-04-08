import { queryOptions } from "@tanstack/react-query";
import { authClient } from "../lib/auth-client";

export type Session = Awaited<ReturnType<typeof authClient.getSession>>["data"];

export const sessionQuery = queryOptions({
  queryKey: ["session"],
  queryFn: async () => {
    const result = await authClient.getSession();

    if (result.error) {
      throw new Error(result.error.message!);
    }

    return result.data;
  },
  staleTime: 30_000,
});
