import type { AppBindings } from "#src/server/env";
import type { getIncidentSightings, submitSighting } from "#src/server/services/sighting-service";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getSessionMock = vi.fn<() => Promise<{ user: { id: string; role?: string } } | null>>();

vi.mock("#src/server/auth/auth", () => ({
  createAuth: (_env: AppBindings) => ({
    api: {
      getSession: getSessionMock,
    },
  }),
}));

const submitSightingMock = vi.fn<typeof submitSighting>();

const getIncidentSightingsMock = vi.fn<typeof getIncidentSightings>();

vi.mock("#src/server/services/sighting-service", () => ({
  submitSighting: submitSightingMock,
  getIncidentSightings: getIncidentSightingsMock,
}));

const { default: app } = await import("#server");

describe("sightings API", () => {
  beforeEach(() => {
    getSessionMock.mockReset();
    submitSightingMock.mockReset();
    getIncidentSightingsMock.mockReset();

    getSessionMock.mockResolvedValue({
      user: {
        id: "internal-1",
        role: "internal_user",
      },
    });
    getIncidentSightingsMock.mockResolvedValue({
      kind: "success",
      value: {
        sightings: [],
      },
    });
  });

  it("requires auth for creating a sighting", async () => {
    const response = await app.request("https://example.com/api/incidents/incident-1/sightings", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        position: {
          x: 10,
          y: 20,
        },
        source: "civilian",
        confidence: 0.4,
      }),
    });

    expect(response.status).toBe(401);
  });

  it("rejects invalid sighting creation payload", async () => {
    const response = await app.request("https://example.com/api/incidents/incident-1/sightings", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: "session=token",
      },
      body: JSON.stringify({
        position: {
          x: 10,
          y: 20,
        },
        source: "dog",
        confidence: 0.4,
      }),
    });

    expect(response.status).toBe(400);
  });

  it("returns 404 when creating a sighting and incident is not found", async () => {
    submitSightingMock.mockResolvedValue({
      kind: "incident_not_found",
    });

    const response = await app.request("https://example.com/api/incidents/missing/sightings", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: "session=token",
      },
      body: JSON.stringify({
        position: {
          x: 10,
          y: 20,
        },
        source: "civilian",
        confidence: 0.4,
      }),
    });

    expect(response.status).toBe(404);

    const body = await response.json();
    expect(body).toEqual({ message: "Incident not found" });
  });

  it("returns 404 when listing sightings and incident is not found", async () => {
    getIncidentSightingsMock.mockResolvedValue({
      kind: "incident_not_found",
    });

    const response = await app.request("https://example.com/api/incidents/missing/sightings", {
      method: "GET",
      headers: {
        "content-type": "application/json",
        cookie: "session=token",
      },
    });

    expect(response.status).toBe(404);

    const body = await response.json();
    expect(body).toEqual({ message: "Incident not found" });
  });

  it("returns 201 when sighting is created", async () => {
    submitSightingMock.mockImplementation(async (_env, incidentId, input) => ({
      kind: "success",
      value: {
        sighting: {
          id: "sighting-1",
          confidence: input.confidence,
          incidentId,
          position: {
            x: input.position.x,
            y: input.position.y,
          },
          source: input.source,
          createdAt: new Date().toISOString(),
        },
      },
    }));

    const response = await app.request("https://example.com/api/incidents/incident-1/sightings", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: "session=token",
      },
      body: JSON.stringify({
        position: {
          x: 10,
          y: 20,
        },
        source: "civilian",
        confidence: 0.4,
      }),
    });

    expect(response.status).toBe(201);
    expect(submitSightingMock).toHaveBeenCalledWith(undefined, "incident-1", {
      position: {
        x: 10,
        y: 20,
      },
      source: "civilian",
      confidence: 0.4,
      actorId: "internal-1",
    });

    const body = await response.json();
    expect(body).toMatchObject({
      sighting: {
        id: "sighting-1",
        incidentId: "incident-1",
        position: {
          x: 10,
          y: 20,
        },
        source: "civilian",
        confidence: 0.4,
      },
    });
  });

  it("returns 200 for internal users", async () => {
    const response = await app.request("https://example.com/api/incidents/incident-1/sightings", {
      method: "GET",
      headers: {
        "content-type": "application/json",
        cookie: "session=token",
      },
    });

    expect(response.status).toBe(200);
  });

  it("returns 403 for civilian users", async () => {
    getSessionMock.mockResolvedValue({
      user: {
        id: "civilian-1",
        role: "civilian",
      },
    });

    const response = await app.request("https://example.com/api/incidents/incident-1/sightings", {
      method: "GET",
      headers: {
        "content-type": "application/json",
        cookie: "session=token",
      },
    });

    expect(response.status).toBe(403);
  });
});
