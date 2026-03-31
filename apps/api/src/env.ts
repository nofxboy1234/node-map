export type AppBindings = Env;

export function getCorsOrigins(env: AppBindings) {
  if (!env.CORS_ORIGIN) {
    throw new Error("Missing CORS_ORIGIN");
  }

  const origins = env.CORS_ORIGIN.split(",").map((origin) => origin.trim());
  if (!origins[0]) {
    throw new Error("Missing CORS_ORIGIN");
  }

  return origins;
}
