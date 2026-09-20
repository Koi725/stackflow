import "server-only";
import type { User } from "@prisma/client";
import { localProvider } from "./local";
import { darsmanProvider } from "./darsman";
import { upsertMirroredUser } from "./mirror";
import { AuthProviderError, type AuthMode, type AuthProvider } from "./types";

export { AuthProviderError } from "./types";
export type { AuthMode, AuthProvider, ExternalIdentity } from "./types";

// Provider selection is driven entirely by the AUTH_MODE env var and defaults to
// the public "local" mode. Nothing about any private deployment lives in code —
// the only external coupling is the URL read from env inside the darsman provider.

const PROVIDERS: Record<AuthMode, AuthProvider> = {
  local: localProvider,
  darsman: darsmanProvider,
};

/** Resolve the configured auth provider (default: local). */
export function getAuthProvider(): AuthProvider {
  const mode = (process.env.AUTH_MODE ?? "local").trim().toLowerCase();
  if (mode === "local" || mode === "darsman") return PROVIDERS[mode];
  throw new AuthProviderError(`Unknown AUTH_MODE "${mode}" — expected "local" or "darsman".`);
}

/**
 * Full login: verify credentials with the configured provider and, on success,
 * mirror the identity into stackflow's User table. Returns the stackflow User
 * (from which the session is minted) or null when the credentials are rejected.
 * Throws {@link AuthProviderError} for misconfiguration / upstream faults.
 */
export async function authenticate(email: string, password: string): Promise<User | null> {
  const provider = getAuthProvider();
  const identity = await provider.verifyCredentials(email, password);
  if (!identity) return null;
  return upsertMirroredUser(identity);
}
