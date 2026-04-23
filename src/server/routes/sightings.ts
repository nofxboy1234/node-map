import { Hono } from "hono";
import type { AppBindings } from "../env";
import { sValidator } from "@hono/standard-validator";
import { createSightingInputSchema } from "#src/shared";
import { requireInternalUser } from "../auth/require-internal-user";
import { getIncidentSightings, submitSighting } from "../services/sighting-service";

function assertNever(value: never): never {
  throw new Error(`Unexpected sighting outcome: ${String(value)}`);
}

export const sightingsRoutes = new Hono<{ Bindings: AppBindings }>()
  .post("/:incidentId/sightings", sValidator("json", createSightingInputSchema), async (c) => {
    const actorId = await requireInternalUser(c);

    const { incidentId } = c.req.param();
    const sightingInput = c.req.valid("json");
    const outcome = await submitSighting(c.env, incidentId, {
      ...sightingInput,
      actorId,
    });

    switch (outcome.kind) {
      case "success":
        return c.json(outcome.value, 201);

      case "incident_not_found":
        return c.json({ message: "Incident not found" }, 404);

      default:
        return assertNever(outcome);
    }
  })
  .get("/:incidentId/sightings", async (c) => {
    await requireInternalUser(c);

    const { incidentId } = c.req.param();
    const outcome = await getIncidentSightings(c.env, incidentId);

    switch (outcome.kind) {
      case "success":
        return c.json(outcome.value, 200);

      case "incident_not_found":
        return c.json({ message: "Incident not found" }, 404);

      default:
        return assertNever(outcome);
    }
  });
