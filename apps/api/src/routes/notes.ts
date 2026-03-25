import { sValidator } from "@hono/standard-validator";
import { noteInsertSchema } from "@node-map/shared";
import { Hono } from "hono";
import { addNote, getNotes } from "../services/notes-service";

export const notesRoutes = new Hono()
  .get("/", async (c) => {
    const notes = await getNotes();
    return c.json({ notes }, 200);
  })
  .post("/", sValidator("json", noteInsertSchema), async (c) => {
    const noteInput = c.req.valid("json");
    const note = await addNote(noteInput.title);
    return c.json({ note }, 201);
  });
