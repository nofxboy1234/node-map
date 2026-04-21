import { beforeEach, describe, expect, it, vi } from "vitest";

const getSessionMock = vi.fn<() => Promise<{ user: { id: string; role?: string } } | null>>();

type TransitionIncidentStateInput = {
  nextStatus: "triaging" | "confirmed" | "in_operation" | "resolved";
};

type TransitionIncidentStateOutcome =
  | {
      kind: "success";
      value: {
        incident: {
          id: string;
          title: string;
          status: "submitted" | "triaging" | "confirmed" | "in_operation" | "resolved";
          createdAt: string;
        };
      };
    }
  | {
      kind: "not_found";
    }
  | {
      kind: "invalid_transition";
      currentStatus: "submitted" | "triaging" | "confirmed" | "in_operation" | "resolved";
      nextStatus: "triaging" | "confirmed" | "in_operation" | "resolved";
    }
  | {
      kind: "rule_violation";
      reason: "missing_linked_reports_for_confirmation";
    };

const transitionIncidentStateMock =
  vi.fn<
    (
      env: unknown,
      incidentId: string,
      input: TransitionIncidentStateInput,
    ) => Promise<TransitionIncidentStateOutcome>
  >();

vi.mock("#src/server/auth/auth", () => ({
  createAuth: () => ({
    api: {
      getSession: getSessionMock,
    },
  }),
}));

vi.mock("#src/server/services/incidents-service", () => ({
  transitionIncidentState: transitionIncidentStateMock,
}));

const { default: app } = await import("#server");

describe("incident state transition API", () => {
  beforeEach(() => {
    getSessionMock.mockReset();
    transitionIncidentStateMock.mockReset();

    getSessionMock.mockResolvedValue({
      user: {
        id: "internal-1",
        role: "internal_user",
      },
    });

    transitionIncidentStateMock.mockImplementation(async (_env, incidentId, input) => ({
      kind: "success",
      value: {
        incident: {
          id: incidentId,
          title: "Incident Alpha",
          status: input.nextStatus,
          createdAt: new Date().toISOString(),
        },
      },
    }));
  });

  it("returns 401 when cookie is missing", async () => {
    const response = await app.request("https://example.com/api/incidents/incident-1/state", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        nextStatus: "triaging",
      }),
    });

    expect(response.status).toBe(401);
  });

  it("returns 403 for civilian users", async () => {
    getSessionMock.mockResolvedValue({
      user: {
        id: "civilian-1",
        role: "civilian",
      },
    });

    const response = await app.request("https://example.com/api/incidents/incident-1/state", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: "session=token",
      },
      body: JSON.stringify({
        nextStatus: "triaging",
      }),
    });

    expect(response.status).toBe(403);
  });

  it("returns 404 when incident is not found", async () => {
    transitionIncidentStateMock.mockResolvedValue({
      kind: "not_found",
    });

    const response = await app.request("https://example.com/api/incidents/missing/state", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: "session=token",
      },
      body: JSON.stringify({
        nextStatus: "triaging",
      }),
    });

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ message: "Incident not found" });
  });

  it("returns 409 for invalid transitions", async () => {
    transitionIncidentStateMock.mockResolvedValue({
      kind: "invalid_transition",
      currentStatus: "submitted",
      nextStatus: "resolved",
    });

    const response = await app.request("https://example.com/api/incidents/incident-1/state", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: "session=token",
      },
      body: JSON.stringify({
        nextStatus: "resolved",
      }),
    });

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({
      message: "Cannot transition incident from submitted to resolved",
    });
  });

  it("returns 409 when confirming without linked reports", async () => {
    transitionIncidentStateMock.mockResolvedValue({
      kind: "rule_violation",
      reason: "missing_linked_reports_for_confirmation",
    });

    const response = await app.request("https://example.com/api/incidents/incident-1/state", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: "session=token",
      },
      body: JSON.stringify({
        nextStatus: "confirmed",
      }),
    });

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({
      message: "Cannot confirm incident without at least one linked report",
    });
  });

  it("returns 200 for a valid transition", async () => {
    const response = await app.request("https://example.com/api/incidents/incident-1/state", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: "session=token",
      },
      body: JSON.stringify({
        nextStatus: "triaging",
      }),
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      incident: {
        id: "incident-1",
        status: "triaging",
      },
    });
  });
});
