import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { sessionQuery } from "../queries/session";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const { data } = useQuery(sessionQuery);

  return (
    <main>
      <p>{data?.user ? `Signed in as ${data.user.email}` : "Signed out"}</p>
      <Link to="/notes">Notes</Link>
    </main>
  );
}
