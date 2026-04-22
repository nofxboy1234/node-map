import { describe, expect, it } from "vitest";
import * as v from "valibot";
import { createSightingInputSchema } from "#src/shared";

describe("createSightingInputSchema", () => {
  it("accepts a valid civilian sighting", () => {
    const result = v.safeParse(createSightingInputSchema, {
      position: {
        x: 10,
        y: 20,
      },
      source: "civilian",
      confidence: 0.4,
    });

    expect(result.success).toBe(true);
  });

  it("accepts a valid hunter sighting", () => {
    const result = v.safeParse(createSightingInputSchema, {
      position: {
        x: 11,
        y: 22,
      },
      source: "hunter",
      confidence: 0.8,
    });

    expect(result.success).toBe(true);
  });

  it("rejects an invalid position", () => {
    const result = v.safeParse(createSightingInputSchema, {
      position: {
        x: "10",
        y: 20,
      },
      source: "civilian",
      confidence: 0.4,
    });

    expect(result.success).toBe(false);
  });

  it("rejects an unknown source", () => {
    const result = v.safeParse(createSightingInputSchema, {
      position: {
        x: 10,
        y: 20,
      },
      source: "dog",
      confidence: 0.4,
    });

    expect(result.success).toBe(false);
  });

  it("rejects an invalid confidence value", () => {
    const result = v.safeParse(createSightingInputSchema, {
      position: {
        x: 10,
        y: 20,
      },
      source: "civilian",
      confidence: 3,
    });

    expect(result.success).toBe(false);
  });
});
