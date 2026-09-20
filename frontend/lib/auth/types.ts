import type { Role } from "@prisma/client";

// Pluggable authentication.
//
// A provider verifies a set of credentials and, on success, returns the identity
// as stackflow understands it: an email, a display name, and a stackflow role.
// It NEVER returns or persists a password. The login route is responsible for
// mirroring this identity into stackflow's own User table and minting the session.

export type AuthMode = "local" | "darsman";

export interface ExternalIdentity {
  email: string;
  name: string;
  role: Role; // already mapped to stackflow's enum (admin | member)
}

export interface AuthProvider {
  readonly mode: AuthMode;
  /**
   * Verify credentials.
   * - Resolves to an {@link ExternalIdentity} on success.
   * - Resolves to `null` when the credentials are simply wrong (→ 401).
   * - Throws {@link AuthProviderError} when the provider is misconfigured or the
   *   upstream service is unreachable (→ 5xx), so the two are never conflated.
   */
  verifyCredentials(email: string, password: string): Promise<ExternalIdentity | null>;
}

/** Thrown for configuration/availability failures — distinct from bad credentials. */
export class AuthProviderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthProviderError";
  }
}
