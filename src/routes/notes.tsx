import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import * as v from "valibot";
import { createNote } from "#src/shared/api";
import { noteInsertSchema } from "#src/shared";
import { apiBaseUrl } from "../lib/api-base-url";
import { notesQuery } from "../queries/notes";
import { sessionQuery } from "../queries/session";

export const Route = createFileRoute("/notes")({
  loader: async ({ context, location }) => {
    const session = await context.queryClient.ensureQueryData(sessionQuery);

    if (!session?.user) {
      throw redirect({
        to: "/auth",
        search: { redirect: location.href },
      });
    }

    await context.queryClient.ensureQueryData(notesQuery);
  },
  component: NotesPage,
});

function NotesPage() {
  const queryClient = useQueryClient();
  const { data } = useQuery(notesQuery);
  const [title, setTitle] = useState("");
  const [validationError, setValidationError] = useState("");

  const mutation = useMutation({
    mutationFn: (input: v.InferOutput<typeof noteInsertSchema>) => createNote(apiBaseUrl, input),
    onSuccess: async () => {
      setTitle("");
      await queryClient.invalidateQueries({ queryKey: notesQuery.queryKey });
    },
  });

  return (
    <main>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const result = v.safeParse(noteInsertSchema, { title });

          if (!result.success) {
            setValidationError(result.issues[0]!.message);
            return;
          }

          setValidationError("");
          mutation.mutate(result.output);
        }}
      >
        <input
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
            setValidationError("");
          }}
          placeholder="New note"
        />
        <button type="submit" disabled={mutation.isPending}>
          Add note
        </button>
      </form>
      {validationError ? <p>{validationError}</p> : null}
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </main>
  );
}
