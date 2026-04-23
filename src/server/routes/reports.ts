import { sValidator } from "@hono/standard-validator";
import { Hono } from "hono";
import { createReportInputSchema, triageReportActionInputSchema } from "#src/shared";
import type { AppBindings } from "../env";
import {
  applyTriageAction,
  getSubmittedReportsForTriage,
  submitReport,
} from "../services/reports-service";
import { requireInternalUser } from "../auth/require-internal-user";

function assertNever(value: never) {
  throw new Error(`Unexpected triage outcome: ${String(value)}`);
}

export const reportsRoutes = new Hono<{ Bindings: AppBindings }>()
  .post("/", sValidator("json", createReportInputSchema), async (c) => {
    const reportInput = c.req.valid("json");
    const report = await submitReport(c.env, reportInput);
    return c.json({ report }, 201);
  })
  .get("/triage", async (c) => {
    await requireInternalUser(c);

    const reports = await getSubmittedReportsForTriage(c.env);
    return c.json({ reports }, 200);
  })
  .post("/:reportId/triage", sValidator("json", triageReportActionInputSchema), async (c) => {
    const actorId = await requireInternalUser(c);

    const { reportId } = c.req.param();
    const triageInput = c.req.valid("json");
    const outcome = await applyTriageAction(c.env, reportId, {
      ...triageInput,
      actorId,
    });

    switch (outcome.kind) {
      case "success":
        return c.json(outcome.value, 200);

      case "not_found":
        return c.json({ message: "Report not found" }, 404);

      case "already_triaged":
        return c.json({ message: `Report already triaged as ${outcome.status}` }, 409);

      default:
        assertNever(outcome);
    }
  });
