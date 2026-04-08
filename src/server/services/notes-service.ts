import type { AppBindings } from "../env";
import { createNote, listNotes, type NoteRow } from "../repositories/notes-repository";

function toNoteDto(note: NoteRow) {
  return {
    id: note.id,
    title: note.title,
    createdAt: note.createdAt.toISOString(),
  };
}

export async function getNotes(env: AppBindings) {
  const notes = await listNotes(env);

  return notes.map(toNoteDto);
}

export async function addNote(env: AppBindings, title: string) {
  const note = await createNote(env, title);

  return toNoteDto(note);
}
