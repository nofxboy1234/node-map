import { describe, expect, it } from "vitest";
import * as v from "valibot";
import { createReportInputSchema } from "#src/shared/schemas/reports";

describe("createReportInputSchema", () => {
  it("accepts a valid civilian report", () => {
    const result = v.safeParse(createReportInputSchema, {
      description: "Large winged devil near station",
      location: { x: 139.76, y: 35.68 },
      urgency: "high",
      devilType: "bat",
    });

    expect(result.success).toBe(true);
  });

  it("rejects an unknown urgency", () => {
    const result = v.safeParse(createReportInputSchema, {
      description: "Unknown devil near mall",
      location: { x: 10, y: 20 },
      urgency: "critical",
    });

    expect(result.success).toBe(false);
  });
});
