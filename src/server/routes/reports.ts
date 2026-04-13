import { sValidator } from "@hono/standard-validator";
import { Hono } from "hono";
import { createReportInputSchema } from "#src/shared";
import type { AppBindings } from "../env";
import { submitReport } from "../services/reports-service";

export const reportsRoutes = new Hono<{ Bindings: AppBindings }>().post(
  "/",
  sValidator("json", createReportInputSchema),
  async (c) => {
    const reportInput = c.req.valid("json");
    const report = await submitReport(c.env, reportInput);
    return c.json({ report }, 201);
  },
);
