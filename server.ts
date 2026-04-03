import { Hono } from "hono";
import { createAuth } from "#src/server/auth/auth";
import type { AppBindings } from "#src/server/env";
import { notesRoutes } from "#src/server/routes/notes";

const app = new Hono<{ Bindings: AppBindings }>();

app.on(["GET", "POST"], "/api/auth/*", (c) => createAuth(c.env).handler(c.req.raw));

app.get("/health", (c) => c.json({ ok: true }));
const routes = app.route("/api/notes", notesRoutes);

export type AppType = typeof routes;
export default app;
