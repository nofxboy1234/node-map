import * as schema from "@node-map/db";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuth } from "better-auth";
import { getDb } from "../db/client";

const secret = process.env.BETTER_AUTH_SECRET;
if (!secret) {
  throw new Error("Missing BETTER_AUTH_SECRET");
}

const baseUrl = process.env.BETTER_AUTH_URL;
if (!baseUrl) {
  throw new Error("Missing BETTER_AUTH_URL");
}

export const auth = betterAuth({
  secret,
  baseURL: baseUrl,
  trustedOrigins: ["http://localhost:5173"],
  database: drizzleAdapter(getDb(), {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
});
