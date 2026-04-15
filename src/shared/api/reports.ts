import * as v from "valibot";
import { createReportResponseSchema, triageQueueResponseSchema } from "#src/shared";
import type { InferRequestType } from "hono/client";
import { createApiClient } from "./client";

type ReportsClient = ReturnType<typeof createApiClient>;
type CreateReportRoute = ReportsClient["api"]["reports"]["$post"];
type CreateReportInput = InferRequestType<CreateReportRoute>["json"];
type CreateReportResponse = v.InferOutput<typeof createReportResponseSchema>;

export async function createReport(
  baseUrl: string,
  input: CreateReportInput,
): Promise<CreateReportResponse> {
  const client = createApiClient(baseUrl);
  const res = await client.api.reports.$post({ json: input });

  if (!res.ok) {
    throw new Error("Failed to submit report");
  }

  return v.parse(createReportResponseSchema, await res.json());
}

export async function getTriageQueue(baseUrl: string) {
  const client = createApiClient(baseUrl);
  const res = await client.api.reports.triage.$get();

  if (!res.ok) {
    throw new Error("Failed to get triage queue");
  }

  return v.parse(triageQueueResponseSchema, await res.json());
}
