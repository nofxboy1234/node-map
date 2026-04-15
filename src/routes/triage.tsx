import { triageReportsQuery } from "#src/queries/triage-reports.js";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/triage")({
  loader: async ({ context, location }) => {
    if (!context.session?.user) {
      throw redirect({
        to: "/auth",
        search: { redirect: location.href },
      });
    }

    if (context.session.user.role !== "internal_user") {
      throw redirect({
        to: "/",
        search: { redirect: location.href },
      });
    }

    await context.queryClient.ensureQueryData(triageReportsQuery);
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { data, isLoading, error } = useQuery(triageReportsQuery);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error.message}</div>;
  }

  if (!data) {
    throw new Error("Missing triage queue data");
  }

  return (
    <main>
      <ul>
        {data.reports.map((report) => (
          <li key={report.id}>
            <div>{report.description}</div>
            <div>{report.devilType}</div>
            <div>{report.location.x}</div>
            <div>{report.location.y}</div>
            <div>{report.status}</div>
            <div>{report.urgency}</div>
          </li>
        ))}
      </ul>
    </main>
  );
}
