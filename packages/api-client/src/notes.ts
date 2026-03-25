import type { InferRequestType, InferResponseType } from "hono/client";
import { createApiClient } from "./client";

type NotesClient = ReturnType<typeof createApiClient>;
type GetNotesRoute = NotesClient["api"]["notes"]["$get"];
type CreateNoteRoute = NotesClient["api"]["notes"]["$post"];
type GetNotesResponse = InferResponseType<GetNotesRoute, 200>;
type CreateNoteInput = InferRequestType<CreateNoteRoute>["json"];
type CreateNoteResponse = InferResponseType<CreateNoteRoute, 201>;

export async function getNotes(baseUrl: string): Promise<GetNotesResponse> {
  const client = createApiClient(baseUrl);
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
  const client = createApiClient(baseUrl);
  const res = await client.api.notes.$post({ json: input });

  if (!res.ok) {
    throw new Error("Failed to create note");
  }

  return res.json();
}
