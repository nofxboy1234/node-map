import { describe, expect, it } from "vitest";
import * as v from "valibot";
import { noteInsertSchema } from "#src/shared/schemas/notes";

describe("noteInsertSchema", () => {
  it("accepts a valid title", () => {
    const result = v.safeParse(noteInsertSchema, {
      title: "Hello",
    });

    expect(result.success).toBe(true);
  });

  it("rejects an empty title", () => {
    const result = v.safeParse(noteInsertSchema, {
      title: "",
    });

    expect(result.success).toBe(false);
  });
});
