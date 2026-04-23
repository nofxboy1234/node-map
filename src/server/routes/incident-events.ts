import { Hono } from "hono";
import { requireInternalUser } from "../auth/require-internal-user";
import type { AppBindings } from "../env";
import { getIncidentEvents } from "../services/incident-events-service";

function assertNever(value: never): never {
  throw new Error(`Unexpected incident events outcome: ${String(value)}`);
}

export const incidentEventsRoutes = new Hono<{ Bindings: AppBindings }>().get(
  "/:incidentId/events",
  async (c) => {
    await requireInternalUser(c);

    const { incidentId } = c.req.param();
    const outcome = await getIncidentEvents(c.env, incidentId);

    switch (outcome.kind) {
      case "success":
        return c.json(outcome.value, 200);

      case "incident_not_found":
        return c.json({ message: "Incident not found" }, 404);

      default:
        return assertNever(outcome);
    }
  },
);
