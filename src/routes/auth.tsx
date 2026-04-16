import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import * as v from "valibot";
import { authClient } from "../lib/auth-client";
import { ensureSession, sessionQuery } from "../queries/session";

const authSearchSchema = v.object({
  redirect: v.fallback(v.pipe(v.string(), v.regex(/^\/(?!\/).*/)), "/"),
});

export const Route = createFileRoute("/auth")({
  validateSearch: authSearchSchema,
  beforeLoad: async ({ context, search }) => {
    const session = await ensureSession(context.queryClient);
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
      setErrorMessage(result.error.message!);
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
