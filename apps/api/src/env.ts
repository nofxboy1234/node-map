export type AppBindings = Env;

export function getCorsOrigin(env: AppBindings) {
  if (!env.CORS_ORIGIN) {
    throw new Error("Missing CORS_ORIGIN");
  }

  return env.CORS_ORIGIN;
}
