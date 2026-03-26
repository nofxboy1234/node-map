import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "./src/auth/auth";
import { notesRoutes } from "./src/routes/notes";

const app = new Hono();

app.use(
  "/api/*",
  cors({
    origin: (origin) => {
      if (origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:")) {
        return origin;
      }

      return undefined;
    },
    credentials: true,
  }),
);

app.on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.get("/health", (c) => c.json({ ok: true }));
const routes = app.route("/api/notes", notesRoutes);

export type AppType = typeof routes;
export default app;
