import { hc } from "hono/client";
import type { NoteDto } from "@node-map/shared";

type GetNotesResponse = {
  notes: NoteDto[];
};

type CreateNoteResponse = {
  note: NoteDto;
};

type CreateNoteInput = {
  title: string;
};

type NotesClient = {
  api: {
    notes: {
      $get: () => Promise<Response>;
      $post: (args: { json: CreateNoteInput }) => Promise<Response>;
    };
  };
};

function createNotesClient(baseUrl: string): NotesClient {
  return hc(baseUrl, {
    init: {
      credentials: "include",
    },
  }) as unknown as NotesClient;
}

export async function getNotes(baseUrl: string): Promise<GetNotesResponse> {
  const client = createNotesClient(baseUrl);
  const res = await client.api.notes.$get();

  if (!res.ok) {
    throw new Error("Failed to load notes");
  }

  return res.json();
}

export async function createNote(
  baseUrl: string,
  input: CreateNoteInput,
): Promise<CreateNoteResponse> {
  const client = createNotesClient(baseUrl);
  const res = await client.api.notes.$post({ json: input });

  if (!res.ok) {
    throw new Error("Failed to create note");
  }

  return res.json();
}
