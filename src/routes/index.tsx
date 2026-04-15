import { Field, Form, reset, useForm } from "@formisch/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute, useLocation, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import type * as v from "valibot";
import { createReport } from "#src/shared/api";
import { createReportInputSchema, reportUrgencies } from "#src/shared";
import { authClient } from "../lib/auth-client";
import { apiBaseUrl } from "../lib/api-base-url";
import { sessionQuery } from "../queries/session";
import styles from "./index.module.css";

type CreateReportInput = v.InferOutput<typeof createReportInputSchema>;

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const location = useLocation();
  const { data } = useQuery(sessionQuery);
  const [lastReportId, setLastReportId] = useState<string | null>(null);

  const form = useForm({
    schema: createReportInputSchema,
    initialInput: {
      description: "",
      location: { x: 0, y: 0 },
      urgency: "medium",
    },
  });

  const mutation = useMutation({
    mutationFn: (input: CreateReportInput) => createReport(apiBaseUrl, input),
    onMutate: () => {
      setLastReportId(null);
    },
    onSuccess: ({ report }) => {
      setLastReportId(report.id);
      reset(form);
    },
  });

  async function onSignOut() {
    await authClient.signOut({
      fetchOptions: { onSuccess: async () => await navigate({ to: "/goodbye" }) },
    });
    await queryClient.invalidateQueries({ queryKey: sessionQuery.queryKey });
  }

  return (
    <main className={styles.page}>
      <section className={styles.accountSection}>
        <p>{data?.user ? `Signed in as ${data.user.email}` : "Signed out"}</p>
        {data?.user ? (
          <button type="button" onClick={onSignOut}>
            Sign out
          </button>
        ) : (
          <Link to="/auth" search={{ redirect: location.href }}>
            Sign in
          </Link>
        )}
        <Link to="/notes">Notes</Link>
        <Link to="/triage">Triage</Link>
      </section>

      <section className={styles.formSection}>
        <h1>Report a devil sighting</h1>
        <Form
          of={form}
          onSubmit={(output) => {
            mutation.mutate(output);
          }}
          className={styles.formGrid}
        >
          <Field of={form} path={["description"]}>
            {(field) => (
              <label className={styles.fieldLabel}>
                Description
                <textarea
                  {...field.props}
                  className={styles.textarea}
                  value={field.input ?? ""}
                  rows={4}
                  placeholder="What did you see?"
                />
                {field.errors ? <p className={styles.error}>{field.errors[0]}</p> : null}
              </label>
            )}
          </Field>

          <Field of={form} path={["location", "x"]}>
            {(field) => (
              <label className={styles.fieldLabel}>
                Location X
                <input
                  {...field.props}
                  className={styles.input}
                  type="number"
                  step="any"
                  inputMode="decimal"
                  value={field.input ?? ""}
                  onChange={(event) => {
                    field.onChange(event.currentTarget.valueAsNumber);
                  }}
                />
                {field.errors ? <p className={styles.error}>{field.errors[0]}</p> : null}
              </label>
            )}
          </Field>

          <Field of={form} path={["location", "y"]}>
            {(field) => (
              <label className={styles.fieldLabel}>
                Location Y
                <input
                  {...field.props}
                  className={styles.input}
                  type="number"
                  step="any"
                  inputMode="decimal"
                  value={field.input ?? ""}
                  onChange={(event) => {
                    field.onChange(event.currentTarget.valueAsNumber);
                  }}
                />
                {field.errors ? <p className={styles.error}>{field.errors[0]}</p> : null}
              </label>
            )}
          </Field>

          <Field of={form} path={["devilType"]}>
            {(field) => (
              <label className={styles.fieldLabel}>
                Devil type (optional)
                <input
                  {...field.props}
                  className={styles.input}
                  value={field.input ?? ""}
                  placeholder="bat, leech, snake..."
                  onChange={(event) => {
                    const value = event.currentTarget.value;
                    field.onChange(value === "" ? undefined : value);
                  }}
                />
                {field.errors ? <p className={styles.error}>{field.errors[0]}</p> : null}
              </label>
            )}
          </Field>

          <Field of={form} path={["urgency"]}>
            {(field) => (
              <label className={styles.fieldLabel}>
                Urgency
                <select {...field.props} className={styles.select} value={field.input ?? "medium"}>
                  {reportUrgencies.map((urgency) => (
                    <option key={urgency} value={urgency}>
                      {urgency}
                    </option>
                  ))}
                </select>
                {field.errors ? <p className={styles.error}>{field.errors[0]}</p> : null}
              </label>
            )}
          </Field>

          <button type="submit" disabled={mutation.isPending} className={styles.button}>
            {mutation.isPending ? "Submitting..." : "Submit report"}
          </button>
        </Form>

        {mutation.error ? <p className={styles.error}>{mutation.error.message}</p> : null}
        {lastReportId ? <p>Report submitted: {lastReportId}</p> : null}
      </section>
    </main>
  );
}
