// Startup validation — runs once when the server boots, BEFORE it accepts any
// traffic (Next.js instrumentation hook; enabled via experimental.instrumentationHook
// in next.config.mjs). The point is to fail fast on insecure auth configuration
// rather than booting into an exploitable state. This does NOT run during
// `next build` (secrets are injected only at runtime), only at server start.
export async function register() {
  // Only validate in the Node.js server runtime, not the edge/middleware runtime.
  if (process.env.NEXT_RUNTIME && process.env.NEXT_RUNTIME !== "nodejs") return;

  // The value historically shipped in .env.example — must never be a live secret.
  const SESSION_SECRET_PLACEHOLDER = "change-me-to-a-long-random-string";
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32 || secret === SESSION_SECRET_PLACEHOLDER) {
    throw new Error(
      "SESSION_SECRET is missing, shorter than 32 characters, or still the .env.example " +
        "placeholder. Set a strong random value (e.g. `openssl rand -hex 32`) before starting.",
    );
  }

  // In production, AUTH_MODE must be chosen explicitly. Silently defaulting to
  // "local" would re-enable the bcrypt path (and any seeded local accounts),
  // creating a backdoor around darsman auth. Fail closed instead.
  if (process.env.NODE_ENV === "production" && !process.env.AUTH_MODE) {
    throw new Error(
      'AUTH_MODE must be set explicitly in production ("local" or "darsman") — ' +
        "refusing to default to local.",
    );
  }
}
