import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Field, Form, reset, useForm } from "@formisch/react";
import { createNote } from "#src/shared/api";
import { noteInsertSchema } from "#src/shared";
import { apiBaseUrl } from "../lib/api-base-url";
import { notesQuery } from "../queries/notes";
import { ensureSession } from "../queries/session";

export const Route = createFileRoute("/notes")({
  loader: async ({ context, location }) => {
    const session = await ensureSession(context.queryClient);

    if (!session?.user) {
      throw redirect({
        to: "/auth",
        search: { redirect: location.href },
      });
    }

    await context.queryClient.ensureQueryData({
      ...notesQuery,
      revalidateIfStale: true,
    });
  },
  component: NotesPage,
});

function NotesPage() {
  const queryClient = useQueryClient();
  const { data } = useQuery(notesQuery);

  const form = useForm({
    schema: noteInsertSchema,
    initialInput: { title: "" },
  });

  if (!data) {
    throw new Error("Missing notes data");
  }

  const mutation = useMutation({
    mutationFn: (input: { title: string }) => createNote(apiBaseUrl, input),
    onSuccess: async () => {
      reset(form);
      await queryClient.invalidateQueries({ queryKey: notesQuery.queryKey });
    },
  });

  return (
    <main>
      <Form
        of={form}
        onSubmit={(output) => {
          mutation.mutate(output);
        }}
      >
        <Field of={form} path={["title"]}>
          {(field) => (
            <>
              <input {...field.props} value={field.input} placeholder="New note" />
              {field.errors ? <p>{field.errors[0]}</p> : null}
            </>
          )}
        </Field>
        <button type="submit" disabled={mutation.isPending}>
          Add note
        </button>
      </Form>
      {mutation.error ? <p>{mutation.error.message}</p> : null}

      {data.notes.length === 0 ? (
        <p>No notes yet.</p>
      ) : (
        <ul>
          {data.notes.map((note) => (
            <li key={note.id}>{note.title}</li>
          ))}
        </ul>
      )}
    </main>
  );
}
