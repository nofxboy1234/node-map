import { notes } from "@node-map/db";
import { desc } from "drizzle-orm";
import { getDb } from "../db/client";

type NoteRow = typeof notes.$inferSelect;

export function listNotes(): Promise<NoteRow[]> {
  return getDb().select().from(notes).orderBy(desc(notes.createdAt));
}

export async function createNote(title: string): Promise<NoteRow> {
  const rows = await getDb().insert(notes).values({ title }).returning();

  return rows[0]!;
}
