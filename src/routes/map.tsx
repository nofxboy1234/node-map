import { ensureSession } from "#src/queries/session";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { PixiMap } from "./-pixi-map";
import { mapIncidentsQuery } from "#src/queries/map-incidents";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/map")({
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
      ...mapIncidentsQuery,
      revalidateIfStale: true,
    });
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { data, isLoading, error } = useQuery(mapIncidentsQuery);

  if (isLoading) {
    return <main>Loading...</main>;
  }

  if (error) {
    return <main>{error.message}</main>;
  }

  if (!data) {
    throw new Error("Missing map incidents data");
  }

  return (
    <main>
      <h1>Tactical Map</h1>
      <PixiMap incidents={data.incidents} />
    </main>
  );
}
