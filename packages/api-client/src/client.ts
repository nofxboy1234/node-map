import { hc } from "hono/client";
import type { AppType } from "@node-map/api/app-type";

export function createApiClient(baseUrl: string) {
  return hc<AppType>(baseUrl, {
    init: {
      credentials: "include",
    },
  });
}
