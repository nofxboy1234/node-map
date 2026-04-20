import * as v from "valibot";
import {
  createReportResponseSchema,
  triageQueueResponseSchema,
  triageReportResponseSchema,
} from "#src/shared";
import type { InferRequestType } from "hono/client";
import { createApiClient } from "./client";

type ReportsClient = ReturnType<typeof createApiClient>;

type CreateReportRoute = ReportsClient["api"]["reports"]["$post"];
type CreateReportRequest = InferRequestType<CreateReportRoute>;
type CreateReportInput = CreateReportRequest["json"];

type TriageReportRoute = ReportsClient["api"]["reports"][":reportId"]["triage"]["$post"];
type TriageReportRequest = InferRequestType<TriageReportRoute>;
type TriageReportInput = TriageReportRequest["json"];
type TriageParams = TriageReportRequest["param"];

export async function createReport(baseUrl: string, input: CreateReportInput) {
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

export async function triageReport(
  baseUrl: string,
  reportId: TriageParams["reportId"],
  input: TriageReportInput,
) {
  const client = createApiClient(baseUrl);
  const res = await client.api.reports[":reportId"].triage.$post({
    json: input,
    param: { reportId },
  });

  if (!res.ok) {
    throw new Error("Failed to triage report");
  }

  return v.parse(triageReportResponseSchema, await res.json());
}
