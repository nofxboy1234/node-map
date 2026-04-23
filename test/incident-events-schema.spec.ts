import { describe, expect, it } from "vitest";
import * as v from "valibot";
import { getIncidentEventsResponseSchema, incidentEventDtoSchema } from "#src/shared";

describe("incidentEventDtoSchema", () => {
  it("accepts a valid incident event", () => {
    const result = v.safeParse(incidentEventDtoSchema, {
      id: "event-1",
      incidentId: "incident-1",
      type: "sighting_added",
      actorId: "user-1",
      payload: {
        sightingId: "sighting-1",
      },
      createdAt: new Date().toISOString(),
    });

    expect(result.success).toBe(true);
  });

  it("accepts a system event without an actor", () => {
    const result = v.safeParse(incidentEventDtoSchema, {
      id: "event-1",
      incidentId: "incident-1",
      type: "incident_created",
      actorId: null,
      payload: {},
      createdAt: new Date().toISOString(),
    });

    expect(result.success).toBe(true);
  });

  it("rejects an unknown event type", () => {
    const result = v.safeParse(incidentEventDtoSchema, {
      id: "event-1",
      incidentId: "incident-1",
      type: "devil_defeated",
      actorId: null,
      payload: {},
      createdAt: new Date().toISOString(),
    });

    expect(result.success).toBe(false);
  });

  it("rejects a missing payload", () => {
    const result = v.safeParse(incidentEventDtoSchema, {
      id: "event-1",
      incidentId: "incident-1",
      type: "incident_created",
      actorId: null,
      createdAt: new Date().toISOString(),
    });

    expect(result.success).toBe(false);
  });
});

describe("getIncidentEventsResponseSchema", () => {
  it("accepts a list of incident events", () => {
    const result = v.safeParse(getIncidentEventsResponseSchema, {
      events: [
        {
          id: "event-1",
          incidentId: "incident-1",
          type: "state_changed",
          actorId: "user-1",
          payload: {
            from: "triaging",
            to: "confirmed",
          },
          createdAt: new Date().toISOString(),
        },
      ],
    });

    expect(result.success).toBe(true);
  });
});
