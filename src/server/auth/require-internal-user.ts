import { HTTPException } from "hono/http-exception";
import type { AppBindings } from "../env";
import { createAuth } from "./auth";

type AuthContext = {
  env: AppBindings;
  req: {
    raw: Request;
  };
};

export async function requireInternalUser(c: AuthContext) {
  const cookieHeader = c.req.raw.headers.get("cookie");
  if (!cookieHeader) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  const session = await createAuth(c.env).api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session?.user) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  const role = (session.user as { role?: string }).role;
  if (role !== "internal_user") {
    throw new HTTPException(403, { message: "Forbidden" });
  }

  return session.user.id;
}
