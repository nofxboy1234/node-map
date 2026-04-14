import app from "#server";
import { describe, expect, it } from "vitest";

describe("reports triage API", () => {
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
});
