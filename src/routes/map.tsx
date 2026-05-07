import { ensureSession } from "#src/queries/session";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { PixiMap } from "./-pixi-map";
import { mapIncidentsQuery } from "#src/queries/map-incidents";
import { useQueries, useQuery } from "@tanstack/react-query";
import { incidentSightingsQuery } from "#src/queries/incident-sightings";

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

    const data = await context.queryClient.ensureQueryData({
      ...mapIncidentsQuery,
      revalidateIfStale: true,
    });

    await Promise.all(
      data.incidents.map((incident) =>
        context.queryClient.ensureQueryData({
          ...incidentSightingsQuery(incident.id),
          revalidateIfStale: true,
        }),
      ),
    );
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { data, isLoading, error } = useQuery(mapIncidentsQuery);

  const sightingQueries = useQueries({
    queries: data?.incidents.map((incident) => incidentSightingsQuery(incident.id)) ?? [],
  });

  if (isLoading) {
    return <main>Loading...</main>;
  }

  if (error) {
    return <main>{error.message}</main>;
  }

  if (!data) {
    throw new Error("Missing map incidents data");
  }

  const sightingError = sightingQueries.find((query) => query.error)?.error;

  if (sightingError) {
    return <main>{sightingError.message}</main>;
  }

  if (sightingQueries.some((query) => !query.data)) {
    return <main>Loading...</main>;
  }

  const sightingsByIncidentId = Object.fromEntries(
    data.incidents.map((incident, index) => {
      const sightings = sightingQueries[index]?.data?.sightings;

      if (!sightings) {
        throw new Error(`Missing sightings data for incident ${incident.id}`);
      }

      return [incident.id, sightings];
    }),
  );

  return (
    <main>
      <h1>Tactical Map</h1>
      <PixiMap incidents={data.incidents} sightingsByIncidentId={sightingsByIncidentId} />
    </main>
  );
}
