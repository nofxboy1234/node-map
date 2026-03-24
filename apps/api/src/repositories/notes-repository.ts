import { notes } from "@node-map/db";
import { desc } from "drizzle-orm";
import { getDb } from "../db/client";

type NoteRow = typeof notes.$inferSelect;

export function listNotes(): Promise<NoteRow[]> {
  return getDb()
    .select()
    .from(notes as never)
    .orderBy(desc(notes.createdAt as never)) as Promise<NoteRow[]>;
}

export async function createNote(title: string): Promise<NoteRow> {
  const rows = (await getDb()
    .insert(notes as never)
    .values({ title } as never)
    .returning()) as NoteRow[];

  return rows[0]!;
}
