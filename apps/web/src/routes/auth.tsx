import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import type { SyntheticEvent } from "react";
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

  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function onSubmit(event: SyntheticEvent<HTMLFormElement, SubmitEvent>) {
    event.preventDefault();
    setErrorMessage("");

    const result =
      mode === "sign-up"
        ? await authClient.signUp.email({
            name,
            email,
            password,
          })
        : await authClient.signIn.email({
            email,
            password,
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
      <h1>{mode === "sign-in" ? "Sign in" : "Sign up"}</h1>
      <button
        type="button"
        onClick={() => {
          setErrorMessage("");
          setMode(mode === "sign-in" ? "sign-up" : "sign-in");
        }}
      >
        {mode === "sign-in" ? "Need an account?" : "Already have an account?"}
      </button>
      <form onSubmit={onSubmit}>
        {mode === "sign-up" ? (
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Name"
          />
        ) : null}
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email"
          type="email"
        />
        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          type="password"
        />
        <button type="submit">{mode === "sign-in" ? "Sign in" : "Sign up"}</button>
      </form>
      {errorMessage ? <p>{errorMessage}</p> : null}
    </main>
  );
}
