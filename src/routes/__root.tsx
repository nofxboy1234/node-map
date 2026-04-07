import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import type { RouterContext } from "../app/router-context";
import { sessionQuery } from "../queries/session";

export const Route = createRootRouteWithContext<RouterContext>()({
  loader: ({ context }) => context.queryClient.ensureQueryData(sessionQuery),
  component: Root,
});

function Root() {
  return <Outlet />;
}
