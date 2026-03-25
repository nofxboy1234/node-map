import type { AppType } from "../server";
import { hc } from "hono/client";

export type ApiClient = ReturnType<typeof hc<AppType>>;

export function createApiClient(baseUrl: string): ApiClient {
  return hc<AppType>(baseUrl, {
    init: {
      credentials: "include",
    },
  });
}
