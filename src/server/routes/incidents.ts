import { sValidator } from "@hono/standard-validator";
import { Hono } from "hono";
import { transitionIncidentStateInputSchema } from "#src/shared";
import { requireInternalUser } from "../auth/require-internal-user";
import type { AppBindings } from "../env";
import {
  transitionIncidentState,
  type TransitionIncidentStateOutcome,
} from "../services/incidents-service";

function assertNever(value: never): never {
  throw new Error(`Unexpected incident transition outcome: ${String(value)}`);
}

type FailedTransitionIncidentStateOutcome = Extract<
  TransitionIncidentStateOutcome,
  { kind: "invalid_transition" | "rule_violation" }
>;

function toTransitionMessage(outcome: FailedTransitionIncidentStateOutcome) {
  switch (outcome.kind) {
    case "invalid_transition":
      return `Cannot transition incident from ${outcome.currentStatus} to ${outcome.nextStatus}`;

    case "rule_violation":
      if (outcome.reason === "missing_linked_reports_for_confirmation") {
        return "Cannot confirm incident without at least one linked report";
      }

      return assertNever(outcome.reason);
  }
}

export const incidentsRoutes = new Hono<{ Bindings: AppBindings }>().post(
  "/:incidentId/state",
  sValidator("json", transitionIncidentStateInputSchema),
  async (c) => {
    await requireInternalUser(c);

    const { incidentId } = c.req.param();
    const transitionInput = c.req.valid("json");
    const outcome = await transitionIncidentState(c.env, incidentId, transitionInput);

    switch (outcome.kind) {
      case "success":
        return c.json(outcome.value, 200);

      case "not_found":
        return c.json({ message: "Incident not found" }, 404);

      case "invalid_transition":
      case "rule_violation":
        return c.json({ message: toTransitionMessage(outcome) }, 409);

      default:
        return assertNever(outcome);
    }
  },
);
