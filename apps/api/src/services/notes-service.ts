import type { NoteDto } from "@node-map/shared";
import { createNote, listNotes } from "../repositories/notes-repository";

export async function getNotes(): Promise<NoteDto[]> {
  const notes = await listNotes();

  return notes.map((note) => ({
    id: note.id,
    title: note.title,
    createdAt: note.createdAt.toISOString(),
  }));
}

export async function addNote(title: string): Promise<NoteDto> {
  const note = await createNote(title);

  return {
    id: note.id,
    title: note.title,
    createdAt: note.createdAt.toISOString(),
  };
}
