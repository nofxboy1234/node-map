import * as v from "valibot";
import { createNoteResponseSchema, getNotesResponseSchema } from "#src/shared";
import type { InferRequestType } from "hono/client";
import { createApiClient } from "./client";

type NotesClient = ReturnType<typeof createApiClient>;
type CreateNoteRoute = NotesClient["api"]["notes"]["$post"];
type CreateNoteInput = InferRequestType<CreateNoteRoute>["json"];
type GetNotesResponse = v.InferOutput<typeof getNotesResponseSchema>;
type CreateNoteResponse = v.InferOutput<typeof createNoteResponseSchema>;

export async function getNotes(baseUrl: string): Promise<GetNotesResponse> {
  const client = createApiClient(baseUrl);
  const res = await client.api.notes.$get();

  if (!res.ok) {
    throw new Error("Failed to load notes");
  }

  return v.parse(getNotesResponseSchema, await res.json());
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

  return v.parse(createNoteResponseSchema, await res.json());
}
