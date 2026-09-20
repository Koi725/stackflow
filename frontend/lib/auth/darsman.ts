import "server-only";
import { mapExternalRole } from "./roles";
import { AuthProviderError, type AuthProvider, type ExternalIdentity } from "./types";

// External-auth provider (private deployments only).
//
// Credentials are POSTed as {email, password} to an external login endpoint whose
// URL comes entirely from the DARSMAN_AUTH_URL env var — it is NEVER hardcoded.
// On success the endpoint returns the user's profile; we read back name + role,
// map the role into stackflow's enum, and store NO password in stackflow.
//
// The response shape is kept generic: we look for `name`/`role`/`email` at the top
// level or nested under a `user` / `data` envelope, so this works against a range
// of platforms without embedding anything provider-specific here.

function readField(source: unknown, key: string): unknown {
  if (source && typeof source === "object") {
    const rec = source as Record<string, unknown>;
    if (rec[key] !== undefined) return rec[key];
    for (const envelope of ["user", "data", "profile"]) {
      const inner = rec[envelope];
      if (inner && typeof inner === "object" && (inner as Record<string, unknown>)[key] !== undefined) {
        return (inner as Record<string, unknown>)[key];
      }
    }
  }
  return undefined;
}

export const darsmanProvider: AuthProvider = {
  mode: "darsman",

  async verifyCredentials(email: string, password: string): Promise<ExternalIdentity | null> {
    const url = process.env.DARSMAN_AUTH_URL;
    if (!url) {
      // Fail clearly rather than silently falling back to another mode.
      throw new AuthProviderError(
        "AUTH_MODE=darsman but DARSMAN_AUTH_URL is not set — external auth is misconfigured.",
      );
    }

    let res: Response;
    try {
      res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email, password }),
        cache: "no-store",
      });
    } catch (cause) {
      throw new AuthProviderError(`External auth service is unreachable: ${(cause as Error).message}`);
    }

    // Genuine credential rejection -> null (401). Upstream faults -> throw (5xx).
    if (res.status === 401 || res.status === 403) return null;
    if (!res.ok) throw new AuthProviderError(`External auth service returned ${res.status}`);

    let payload: unknown;
    try {
      payload = await res.json();
    } catch {
      throw new AuthProviderError("External auth service returned a non-JSON response");
    }

    const name = readField(payload, "name");
    const role = readField(payload, "role");
    // Prefer the email echoed back by the provider; fall back to the submitted one.
    const returnedEmail = readField(payload, "email");

    if (typeof name !== "string" || !name.trim()) {
      throw new AuthProviderError("External auth response is missing the user's name");
    }
    if (typeof role !== "string" || !role.trim()) {
      throw new AuthProviderError("External auth response is missing the user's role");
    }

    return {
      email: (typeof returnedEmail === "string" && returnedEmail.trim() ? returnedEmail : email).toLowerCase(),
      name: name.trim(),
      role: mapExternalRole(role),
    };
  },
};
