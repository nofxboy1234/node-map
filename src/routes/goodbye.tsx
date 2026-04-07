import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/goodbye")({
  component: Goodbye,
});

function Goodbye() {
  return <div>goodbye!</div>;
}
