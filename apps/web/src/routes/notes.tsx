import { createNote } from "@node-map/api-client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { notesQuery } from "../queries/notes";

export const Route = createFileRoute("/notes")({
  loader: ({ context }) => context.queryClient.ensureQueryData(notesQuery),
  component: NotesPage,
});

function NotesPage() {
  const { data } = useQuery(notesQuery);
  const { queryClient } = Route.useRouteContext();
  const [title, setTitle] = useState("");

  const mutation = useMutation({
    mutationFn: (nextTitle: string) =>
      createNote(import.meta.env.VITE_API_URL, { title: nextTitle }),
    onSuccess: async () => {
      setTitle("");
      await queryClient.invalidateQueries({ queryKey: ["notes"] });
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
