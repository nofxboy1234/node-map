import * as schema from "@node-map/db";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuth } from "better-auth";
import { getDb } from "../db/client";
import { getCorsOrigins } from "../env";
import type { AppBindings } from "../env";

export function createAuth(env: AppBindings) {
  if (!env.BETTER_AUTH_SECRET) {
    throw new Error("Missing BETTER_AUTH_SECRET");
  }

  if (!env.BETTER_AUTH_URL) {
    throw new Error("Missing BETTER_AUTH_URL");
  }

  if (!env.GOOGLE_CLIENT_ID) {
    throw new Error("Missing GOOGLE_CLIENT_ID");
  }

  if (!env.GOOGLE_CLIENT_SECRET) {
    throw new Error("Missing GOOGLE_CLIENT_SECRET");
  }

  if (!env.GITHUB_CLIENT_ID) {
    throw new Error("Missing GITHUB_CLIENT_ID");
  }

  if (!env.GITHUB_CLIENT_SECRET) {
    throw new Error("Missing GITHUB_CLIENT_SECRET");
  }

  return betterAuth({
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    trustedOrigins: getCorsOrigins(env),
    database: drizzleAdapter(getDb(env), {
      provider: "sqlite",
      schema,
    }),
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      },
      github: {
        clientId: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
      },
    },
  });
}
