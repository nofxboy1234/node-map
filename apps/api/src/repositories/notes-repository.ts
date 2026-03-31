import { notes } from "@node-map/db";
import { desc } from "drizzle-orm";
import { getDb } from "../db/client";
import type { AppBindings } from "../env";

type NoteRow = typeof notes.$inferSelect;

export function listNotes(env: AppBindings) {
  return getDb(env).select().from(notes).orderBy(desc(notes.createdAt));
}

export async function createNote(env: AppBindings, title: string): Promise<NoteRow> {
  const rows = await getDb(env).insert(notes).values({ title }).returning();

  return rows[0]!;
}
