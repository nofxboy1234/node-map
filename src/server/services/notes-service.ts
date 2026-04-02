import type { NoteDto } from "#src/shared";
import type { AppBindings } from "../env";
import { createNote, listNotes } from "../repositories/notes-repository";

export async function getNotes(env: AppBindings): Promise<NoteDto[]> {
  const notes = await listNotes(env);

  return notes.map((note) => ({
    id: note.id,
    title: note.title,
    createdAt: note.createdAt.toISOString(),
  }));
}

export async function addNote(env: AppBindings, title: string): Promise<NoteDto> {
  const note = await createNote(env, title);

  return {
    id: note.id,
    title: note.title,
    createdAt: note.createdAt.toISOString(),
  };
}
