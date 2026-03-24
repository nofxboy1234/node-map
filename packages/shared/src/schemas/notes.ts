import { createInsertSchema, createSelectSchema } from "drizzle-orm/valibot";
import * as v from "valibot";
import { notes } from "@node-map/db";

export const noteInsertSchema = createInsertSchema(notes, {
  title: v.pipe(v.string(), v.minLength(1)),
});

export const noteSelectSchema = createSelectSchema(notes);
