import { hc } from "hono/client";
import type { AppType } from "#server";

export function createApiClient(baseUrl: string) {
  return hc<AppType>(baseUrl, {
    init: {
      credentials: "include",
    },
  });
}
