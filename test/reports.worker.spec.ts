import app from "#server";
import { describe, expect, it } from "vitest";

describe("reports API", () => {
  it("rejects invalid report payload", async () => {
    const response = await app.request("https://example.com/api/reports", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        description: "",
        location: { x: 139.76, y: 35.68 },
        urgency: "high",
      }),
    });

    expect(response.status).toBe(400);
  });
});
