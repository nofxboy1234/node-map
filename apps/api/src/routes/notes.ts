import { noteInsertSchema } from "@node-map/shared";
import { safeParse } from "valibot";
import { Hono } from "hono";
import { addNote, getNotes } from "../services/notes-service";

export const notesRoutes = new Hono()
  .get("/", async (c) => {
    const notes = await getNotes();
    return c.json({ notes });
  })
  .post("/", async (c) => {
    const json = await c.req.json();
    const result = safeParse(noteInsertSchema, json);

    if (!result.success) {
      return c.json({ error: "Invalid input" }, 400);
    }

    const note = await addNote(result.output.title);
    return c.json({ note }, 201);
  });
