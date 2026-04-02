import { sValidator } from "@hono/standard-validator";
import { Hono } from "hono";
import { noteInsertSchema } from "#src/shared";
import type { AppBindings } from "../env";
import { addNote, getNotes } from "../services/notes-service";

export const notesRoutes = new Hono<{ Bindings: AppBindings }>()
  .get("/", async (c) => {
    const notes = await getNotes(c.env);
    return c.json({ notes }, 200);
  })
  .post("/", sValidator("json", noteInsertSchema), async (c) => {
    const noteInput = c.req.valid("json");
    const note = await addNote(c.env, noteInput.title);
    return c.json({ note }, 201);
  });
