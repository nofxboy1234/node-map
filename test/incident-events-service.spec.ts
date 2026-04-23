import type { AppBindings } from "#src/server/env";
import type {
  createIncidentEvent,
  IncidentEventRow,
  listIncidentEvents,
} from "#src/server/repositories/incident-events-repository";
import type { findIncidentById, IncidentRow } from "#src/server/repositories/incidents-repository";
import { beforeEach, describe, expect, it, vi } from "vitest";

const findIncidentByIdMock = vi.fn<typeof findIncidentById>();
const createIncidentEventMock = vi.fn<typeof createIncidentEvent>();
const listIncidentEventsMock = vi.fn<typeof listIncidentEvents>();

vi.mock("#src/server/repositories/incidents-repository", () => ({
  findIncidentById: findIncidentByIdMock,
}));

vi.mock("#src/server/repositories/incident-events-repository", () => ({
  createIncidentEvent: createIncidentEventMock,
  listIncidentEvents: listIncidentEventsMock,
}));

const { getIncidentEvents, recordIncidentEvent } =
  await import("#src/server/services/incident-events-service");

const env = {} as AppBindings;

function createEventRow(overrides: Partial<IncidentEventRow> = {}): IncidentEventRow {
  return {
    id: "event-1",
    incidentId: "incident-1",
    type: "sighting_added",
    actorId: "user-1",
    payload: JSON.stringify({
      sightingId: "sighting-1",
    }),
    createdAt: new Date("2026-04-22T10:00:00.000Z"),
    ...overrides,
  };
}

function createIncidentRow(overrides: Partial<IncidentRow> = {}): IncidentRow {
  return {
    id: "incident-1",
    title: "Incident Alpha",
    status: "submitted",
    createdAt: new Date("2026-04-22T10:00:00.000Z"),
    ...overrides,
  };
}

describe("incident events service", () => {
  beforeEach(() => {
    findIncidentByIdMock.mockReset();
    createIncidentEventMock.mockReset();
    listIncidentEventsMock.mockReset();
  });

  it("records an incident event with a JSON payload", async () => {
    createIncidentEventMock.mockResolvedValue(createEventRow());

    const event = await recordIncidentEvent(env, {
      incidentId: "incident-1",
      type: "sighting_added",
      actorId: "user-1",
      payload: {
        sightingId: "sighting-1",
      },
    });

    expect(createIncidentEventMock).toHaveBeenCalledWith(env, {
      incidentId: "incident-1",
      type: "sighting_added",
      actorId: "user-1",
      payload: JSON.stringify({
        sightingId: "sighting-1",
      }),
    });
    expect(event).toMatchObject({
      id: "event-1",
      payload: {
        sightingId: "sighting-1",
      },
    });
  });

  it("returns incident events with parsed payloads", async () => {
    findIncidentByIdMock.mockResolvedValue(createIncidentRow());
    listIncidentEventsMock.mockResolvedValue([createEventRow()]);

    const outcome = await getIncidentEvents(env, "incident-1");

    expect(outcome).toMatchObject({
      kind: "success",
      value: {
        events: [
          {
            id: "event-1",
            payload: {
              sightingId: "sighting-1",
            },
          },
        ],
      },
    });
  });

  it("returns incident_not_found when listing events for a missing incident", async () => {
    findIncidentByIdMock.mockResolvedValue(undefined);

    const outcome = await getIncidentEvents(env, "missing");

    expect(outcome).toEqual({
      kind: "incident_not_found",
    });
  });
});
