import type { AppBindings } from "#src/server/env";
import type { getIncidentEvents } from "#src/server/services/incident-events-service";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getSessionMock = vi.fn<() => Promise<{ user: { id: string; role?: string } } | null>>();
const getIncidentEventsMock = vi.fn<typeof getIncidentEvents>();

vi.mock("#src/server/auth/auth", () => ({
  createAuth: (_env: AppBindings) => ({
    api: {
      getSession: getSessionMock,
    },
  }),
}));

vi.mock("#src/server/services/incident-events-service", () => ({
  getIncidentEvents: getIncidentEventsMock,
}));

const { default: app } = await import("#server");

describe("incident events API", () => {
  beforeEach(() => {
    getSessionMock.mockReset();
    getIncidentEventsMock.mockReset();

    getSessionMock.mockResolvedValue({
      user: {
        id: "internal-1",
        role: "internal_user",
      },
    });
    getIncidentEventsMock.mockResolvedValue({
      kind: "success",
      value: {
        events: [],
      },
    });
  });

  it("returns 401 when cookie is missing", async () => {
    const response = await app.request("https://example.com/api/incidents/incident-1/events");

    expect(response.status).toBe(401);
  });

  it("returns 403 for civilian users", async () => {
    getSessionMock.mockResolvedValue({
      user: {
        id: "civilian-1",
        role: "civilian",
      },
    });

    const response = await app.request("https://example.com/api/incidents/incident-1/events", {
      headers: {
        cookie: "session=token",
      },
    });

    expect(response.status).toBe(403);
  });

  it("returns 404 when incident is not found", async () => {
    getIncidentEventsMock.mockResolvedValue({
      kind: "incident_not_found",
    });

    const response = await app.request("https://example.com/api/incidents/missing/events", {
      headers: {
        cookie: "session=token",
      },
    });

    expect(response.status).toBe(404);

    const body = await response.json();
    expect(body).toEqual({ message: "Incident not found" });
  });

  it("returns 200 for internal users", async () => {
    getIncidentEventsMock.mockResolvedValue({
      kind: "success",
      value: {
        events: [
          {
            id: "event-1",
            incidentId: "incident-1",
            type: "sighting_added",
            actorId: "internal-1",
            payload: {
              sightingId: "sighting-1",
            },
            createdAt: new Date().toISOString(),
          },
        ],
      },
    });

    const response = await app.request("https://example.com/api/incidents/incident-1/events", {
      headers: {
        cookie: "session=token",
      },
    });

    expect(response.status).toBe(200);
    expect(getIncidentEventsMock).toHaveBeenCalledWith(undefined, "incident-1");

    const body = await response.json();
    expect(body).toMatchObject({
      events: [
        {
          id: "event-1",
          incidentId: "incident-1",
          type: "sighting_added",
          payload: {
            sightingId: "sighting-1",
          },
        },
      ],
    });
  });
});
