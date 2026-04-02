import { queryOptions } from "@tanstack/react-query";
import { authClient } from "../lib/auth-client";

export const sessionQuery = queryOptions({
  queryKey: ["session"],
  queryFn: async () => {
    const result = await authClient.getSession();

    if (result.error) {
      throw new Error(result.error.message || "Failed to load session");
    }

    return result.data;
  },
  staleTime: 30_000,
});
