import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { sessionQuery } from "../queries/session";
import { authClient } from "../lib/auth-client";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const queryClient = useQueryClient();
  const { data } = useQuery(sessionQuery);

  async function onSignOut() {
    await authClient.signOut();
    await queryClient.invalidateQueries({ queryKey: sessionQuery.queryKey });
  }

  return (
    <main>
      <p>{data?.user ? `Signed in as ${data.user.email}` : "Signed out"}</p>
      {data?.user ? (
        <button type="button" onClick={onSignOut}>
          Sign out
        </button>
      ) : (
        <Link to="/auth" search={{ redirect: "/" }}>
          Sign in
        </Link>
      )}
      <Link to="/notes">Notes</Link>
    </main>
  );
}
