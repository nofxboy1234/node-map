import app from "#server";
import { describe, expect, it } from "vitest";

describe("worker", () => {
  it("responds to /health", async () => {
    const response = await app.request("https://example.com/health");

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
  });
});
