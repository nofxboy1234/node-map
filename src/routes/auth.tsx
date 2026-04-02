import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { authClient } from "../lib/auth-client";
import { sessionQuery } from "../queries/session";

export const Route = createFileRoute("/auth")({
  loader: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(sessionQuery);

    if (session?.user) {
      throw redirect({ to: "/" });
    }
  },
  component: AuthPage,
});

function AuthPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");

  async function onSignIn(provider: "github" | "google") {
    setErrorMessage("");

    const result = await authClient.signIn.social({
      provider,
      callbackURL: window.location.origin,
    });

    if (result.error) {
      setErrorMessage(result.error.message || "Authentication failed");
      return;
    }

    await queryClient.invalidateQueries({ queryKey: sessionQuery.queryKey });
    await navigate({ to: "/" });
  }

  return (
    <main>
      <h1>Sign in</h1>
      <button type="button" onClick={() => onSignIn("google")}>
        Continue with Google
      </button>
      <button type="button" onClick={() => onSignIn("github")}>
        Continue with GitHub
      </button>
      {errorMessage ? <p>{errorMessage}</p> : null}
    </main>
  );
}
