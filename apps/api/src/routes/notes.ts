import { sValidator } from "@hono/standard-validator";
import { noteInsertSchema } from "@node-map/shared";
import { Hono } from "hono";
import { addNote, getNotes } from "../services/notes-service";
import type { AppBindings } from "../env";

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
