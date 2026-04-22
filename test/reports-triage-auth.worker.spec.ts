import { beforeEach, describe, expect, it, vi } from "vitest";
import type { getSubmittedReportsForTriage } from "#src/server/services/reports-service";

const getSessionMock = vi.fn<() => Promise<{ user: { id: string; role?: string } } | null>>();
const getSubmittedReportsForTriageMock =
  vi.fn<() => ReturnType<typeof getSubmittedReportsForTriage>>();

vi.mock("#src/server/auth/auth", () => ({
  createAuth: () => ({
    api: {
      getSession: getSessionMock,
    },
  }),
}));

vi.mock("#src/server/services/reports-service", () => ({
  submitReport: () => {
    throw new Error("submitReport should not be called in this test");
  },
  getSubmittedReportsForTriage: getSubmittedReportsForTriageMock,
  applyTriageAction: () => {
    throw new Error("applyTriageAction should not be called in this test");
  },
}));

const { default: app } = await import("#server");

describe("reports triage auth", () => {
  beforeEach(() => {
    getSessionMock.mockReset();
    getSubmittedReportsForTriageMock.mockReset();
    getSubmittedReportsForTriageMock.mockResolvedValue([]);
  });

  it("returns 401 when cookie is missing", async () => {
    const response = await app.request("https://example.com/api/reports/triage");

    expect(response.status).toBe(401);
  });

  it("returns 403 for civilian users", async () => {
    getSessionMock.mockResolvedValue({
      user: {
        id: "user-1",
        role: "civilian",
      },
    });

    const response = await app.request("https://example.com/api/reports/triage", {
      headers: {
        cookie: "session=token",
      },
    });

    expect(response.status).toBe(403);
  });

  it("returns 200 for internal users", async () => {
    getSessionMock.mockResolvedValue({
      user: {
        id: "user-1",
        role: "internal_user",
      },
    });

    const response = await app.request("https://example.com/api/reports/triage", {
      headers: {
        cookie: "session=token",
      },
    });

    expect(response.status).toBe(200);
  });
});
