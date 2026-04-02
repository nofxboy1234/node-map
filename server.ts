import { Hono } from "hono";
import { cors } from "hono/cors";
import { createAuth } from "#src/server/auth/auth";
import { getCorsOrigin } from "#src/server/env";
import type { AppBindings } from "#src/server/env";
import { notesRoutes } from "#src/server/routes/notes";

const app = new Hono<{ Bindings: AppBindings }>();

app.use("/api/*", async (c, next) =>
  cors({
    origin: getCorsOrigin(c.env),
    credentials: true,
  })(c, next),
);

app.on(["GET", "POST"], "/api/auth/*", (c) => createAuth(c.env).handler(c.req.raw));

app.get("/health", (c) => c.json({ ok: true }));
const routes = app.route("/api/notes", notesRoutes);

export type AppType = typeof routes;
export default app;
