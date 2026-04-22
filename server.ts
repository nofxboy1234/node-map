import { Hono } from "hono";
import { createAuth } from "#src/server/auth/auth";
import type { AppBindings } from "#src/server/env";
import { incidentsRoutes } from "#src/server/routes/incidents";
import { notesRoutes } from "#src/server/routes/notes";
import { reportsRoutes } from "#src/server/routes/reports";
import { sightingsRoutes } from "#src/server/routes/sightings";

const app = new Hono<{ Bindings: AppBindings }>();

app.on(["GET", "POST"], "/api/auth/*", (c) => createAuth(c.env).handler(c.req.raw));

app.get("/health", (c) => c.json({ ok: true }));
const routes = app
  .route("/api/incidents", incidentsRoutes)
  .route("/api/incidents", sightingsRoutes)
  .route("/api/notes", notesRoutes)
  .route("/api/reports", reportsRoutes);

export type AppType = typeof routes;
export default app;
