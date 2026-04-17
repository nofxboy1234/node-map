import { triageReportsQuery } from "#src/queries/triage-reports.js";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { ensureSession } from "../queries/session";
import { triageReportActionInputSchema } from "#src/shared";
import * as v from "valibot";
import { triageReport } from "../shared/api";
import { apiBaseUrl } from "#src/lib/api-base-url.js";
import { useState } from "react";

type TriageReportActionInput = v.InferOutput<typeof triageReportActionInputSchema>;

export const Route = createFileRoute("/triage")({
  loader: async ({ context, location }) => {
    const session = await ensureSession(context.queryClient);

    if (!session?.user) {
      throw redirect({
        to: "/auth",
        search: { redirect: location.href },
      });
    }

    if (session.user.role !== "internal_user") {
      throw redirect({
        to: "/",
        search: { redirect: location.href },
      });
    }

    await context.queryClient.ensureQueryData({
      ...triageReportsQuery,
      revalidateIfStale: true,
    });
  },
  component: RouteComponent,
});

function RouteComponent() {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery(triageReportsQuery);
  const [incidentTitles, setIncidentTitles] = useState<Record<string, string>>({});

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error.message}</div>;
  }

  if (!data) {
    throw new Error("Missing triage queue data");
  }

  const mutation = useMutation({
    mutationFn: ({
      reportId,
      actionInput,
    }: {
      reportId: string;
      actionInput: TriageReportActionInput;
    }) => triageReport(apiBaseUrl, reportId, actionInput),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: triageReportsQuery.queryKey });
    },
  });

  return (
    <main>
      <ul>
        {data.reports.map((report) => {
          const incidentTitle = incidentTitles[report.id] ?? "";

          return (
            <li key={report.id}>
              <div>{report.description}</div>
              <div>{report.devilType}</div>
              <div>{report.location.x}</div>
              <div>{report.location.y}</div>
              <div>{report.status}</div>
              <div>{report.urgency}</div>
              <button
                onClick={() =>
                  mutation.mutate({
                    reportId: report.id,
                    actionInput: { action: "mark_duplicate" },
                  })
                }
                disabled={mutation.variables?.reportId === report.id && mutation.isPending}
              >
                {mutation.variables?.reportId === report.id &&
                mutation.variables.actionInput.action === "mark_duplicate" &&
                mutation.isPending
                  ? "Marking Duplicate..."
                  : "Mark Duplicate"}
              </button>

              <button
                onClick={() =>
                  mutation.mutate({ reportId: report.id, actionInput: { action: "reject" } })
                }
                disabled={mutation.variables?.reportId === report.id && mutation.isPending}
              >
                {mutation.variables?.reportId === report.id &&
                mutation.variables.actionInput.action === "reject" &&
                mutation.isPending
                  ? "Rejecting..."
                  : "Reject"}
              </button>

              <button
                onClick={() =>
                  mutation.mutate({
                    reportId: report.id,
                    actionInput: { action: "escalate", incidentTitle },
                  })
                }
                disabled={
                  (mutation.variables?.reportId === report.id && mutation.isPending) ||
                  incidentTitle.trim().length === 0
                }
              >
                {mutation.variables?.reportId === report.id &&
                mutation.variables.actionInput.action === "escalate" &&
                mutation.isPending
                  ? "Escalating..."
                  : "Escalate"}
              </button>
              <input
                type="text"
                value={incidentTitle}
                onChange={(event) => {
                  const value = event.currentTarget.value;
                  setIncidentTitles((prev) => ({
                    ...prev,
                    [report.id]: value,
                  }));
                }}
              />
            </li>
          );
        })}
      </ul>
      {mutation.error ? <p>{mutation.error.message}</p> : null}
    </main>
  );
}
