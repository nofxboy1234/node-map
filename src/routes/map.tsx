import { ensureSession } from "#src/queries/session";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { PixiMap } from "./-pixi-map";

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
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <div>Hello "/map"!</div>
      <PixiMap />
    </div>
  );
}
