import { createNote } from "@node-map/api-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { notesQuery } from "../queries/notes";
import { sessionQuery } from "../queries/session";

export const Route = createFileRoute("/notes")({
  loader: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(sessionQuery);

    if (!session?.user) {
      throw redirect({ to: "/auth" });
    }

    await context.queryClient.ensureQueryData(notesQuery);
  },
  component: NotesPage,
});

function NotesPage() {
  const queryClient = useQueryClient();

  const { data } = useQuery(notesQuery);
  const [title, setTitle] = useState("");

  const mutation = useMutation({
    mutationFn: (nextTitle: string) =>
      createNote(import.meta.env.VITE_API_URL, { title: nextTitle }),
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
          mutation.mutate(title);
        }}
      >
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="New note"
        />
        <button type="submit" disabled={mutation.isPending}>
          Add note
        </button>
      </form>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </main>
  );
}
