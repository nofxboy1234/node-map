import { createInsertSchema } from "drizzle-orm/valibot";
import * as v from "valibot";
import { notes } from "#src/shared/db/schema";

export const noteInsertSchema = createInsertSchema(notes, {
  title: v.pipe(v.string(), v.minLength(1)),
});
