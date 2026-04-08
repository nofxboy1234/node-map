import { createInsertSchema } from "drizzle-orm/valibot";
import * as v from "valibot";
import { notes } from "#src/shared/db/schema";

export const noteInsertSchema = createInsertSchema(notes, {
  title: v.pipe(v.string(), v.minLength(1)),
});

const noteDtoSchema = v.object({
  id: v.string(),
  title: v.string(),
  createdAt: v.string(),
});

export const getNotesResponseSchema = v.object({
  notes: v.array(noteDtoSchema),
});

export const createNoteResponseSchema = v.object({
  note: noteDtoSchema,
});
