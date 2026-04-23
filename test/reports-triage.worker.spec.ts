import type { AppBindings } from "#src/server/env";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { applyTriageAction } from "#src/server/services/reports-service";

const getSessionMock = vi.fn<() => Promise<{ user: { id: string; role?: string } } | null>>();
const applyTriageActionMock = vi.fn<typeof applyTriageAction>();

function assertNever(value: never): never {
  throw new Error(`Unexpected triage action: ${JSON.stringify(value)}`);
}

vi.mock("#src/server/auth/auth", () => ({
  createAuth: (_env: AppBindings) => ({
    api: {
      getSession: getSessionMock,
    },
  }),
}));

vi.mock("#src/server/services/reports-service", () => ({
  submitReport: () => {
    throw new Error("submitReport should not be called in this test");
  },
  getSubmittedReportsForTriage: () => {
    throw new Error("getSubmittedReportsForTriage should not be called in this test");
  },
  applyTriageAction: applyTriageActionMock,
}));

const { default: app } = await import("#server");

describe("reports triage API", () => {
  beforeEach(() => {
    getSessionMock.mockReset();
    applyTriageActionMock.mockReset();

    getSessionMock.mockResolvedValue({
      user: {
        id: "internal-1",
        role: "internal_user",
      },
    });

    applyTriageActionMock.mockImplementation(async (_env, reportId, input) => {
      if (reportId === "already-triaged") {
        return {
          kind: "already_triaged",
          status: "duplicate",
        };
      }

      if (input.action === "mark_duplicate") {
        return {
          kind: "success",
          value: {
            report: {
              id: reportId,
              description: "Test report",
              location: { x: 0, y: 0 },
              devilType: null,
              urgency: "medium",
              status: "duplicate",
              createdAt: new Date().toISOString(),
            },
            incidentId: null,
          },
        };
      }

      if (input.action === "reject") {
        return {
          kind: "success",
          value: {
            report: {
              id: reportId,
              description: "Test report",
              location: { x: 0, y: 0 },
              devilType: null,
              urgency: "medium",
              status: "rejected",
              createdAt: new Date().toISOString(),
            },
            incidentId: null,
          },
        };
      }

      if (input.action === "escalate") {
        return {
          kind: "success",
          value: {
            report: {
              id: reportId,
              description: "Test report",
              location: { x: 0, y: 0 },
              devilType: null,
              urgency: "medium",
              status: "escalated",
              createdAt: new Date().toISOString(),
            },
            incidentId: "incident-1",
          },
        };
      }

      return assertNever(input);
    });
  });

  it("requires auth for triage queue", async () => {
    const response = await app.request("https://example.com/api/reports/triage");
    expect(response.status).toBe(401);
  });

  it("rejects invalid triage action payload", async () => {
    const response = await app.request("https://example.com/api/reports/report-1/triage", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        action: "invalid_action",
      }),
    });

    expect(response.status).toBe(400);
  });

  it("marks a report as duplicate", async () => {
    const response = await app.request("https://example.com/api/reports/report-1/triage", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: "session=token",
      },
      body: JSON.stringify({
        action: "mark_duplicate",
      }),
    });

    expect(response.status).toBe(200);
    expect(applyTriageActionMock).toHaveBeenCalledWith(undefined, "report-1", {
      action: "mark_duplicate",
      actorId: "internal-1",
    });

    const body = await response.json();
    expect(body).toMatchObject({
      report: {
        id: "report-1",
        status: "duplicate",
      },
      incidentId: null,
    });
  });

  it("rejects a report", async () => {
    const response = await app.request("https://example.com/api/reports/report-2/triage", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: "session=token",
      },
      body: JSON.stringify({
        action: "reject",
      }),
    });

    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body).toMatchObject({
      report: {
        id: "report-2",
        status: "rejected",
      },
      incidentId: null,
    });
  });

  it("escalates a report and returns incident id", async () => {
    const response = await app.request("https://example.com/api/reports/report-3/triage", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: "session=token",
      },
      body: JSON.stringify({
        action: "escalate",
        incidentTitle: "Alpha",
      }),
    });

    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body).toMatchObject({
      report: {
        id: "report-3",
        status: "escalated",
      },
      incidentId: "incident-1",
    });
  });

  it("returns 409 when report is already triaged", async () => {
    const response = await app.request("https://example.com/api/reports/already-triaged/triage", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: "session=token",
      },
      body: JSON.stringify({
        action: "mark_duplicate",
      }),
    });

    expect(await response.json()).toEqual({ message: "Report already triaged as duplicate" });
    expect(response.status).toBe(409);
  });
});
