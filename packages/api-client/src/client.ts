import { hc } from "hono/client";

export function createApiClient(baseUrl: string) {
  return hc(baseUrl, {
    init: {
      credentials: "include",
    },
  });
}
