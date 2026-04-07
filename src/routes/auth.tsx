import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { authClient } from "../lib/auth-client";
import { sessionQuery } from "../queries/session";

type AuthSearch = {
  redirect: string;
};

function toRedirect(value: unknown): string {
  if (typeof value === "string" && value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }
  return "/";
}

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): AuthSearch => ({
    redirect: toRedirect(search.redirect),
  }),
  beforeLoad: async ({ context, search }) => {
    const session = await context.queryClient.ensureQueryData(sessionQuery);

    if (session?.user) {
      throw redirect({ href: search.redirect });
    }
  },
  component: AuthPage,
});

function AuthPage() {
  const { redirect: redirectTo } = Route.useSearch();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");

  async function onSignIn(provider: "github" | "google") {
    setErrorMessage("");

    const result = await authClient.signIn.social({
      provider,
      callbackURL: window.location.href,
    });

    if (result.error) {
      setErrorMessage(result.error.message || "Authentication failed");
      return;
    }

    await queryClient.invalidateQueries({ queryKey: sessionQuery.queryKey });
    await navigate({ href: redirectTo });
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
