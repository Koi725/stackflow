import { NextResponse } from "next/server";
import { authenticate, AuthProviderError } from "@/lib/auth";
import { createSession } from "@/lib/session";
import { toUser } from "@/lib/serialize";

// POST /api/auth/login  { email, password } -> User
//
// Verifies credentials with the configured auth provider (AUTH_MODE: local |
// darsman), mirrors the identity into stackflow's User table, sets the session
// cookie, and returns the User. The session is always minted from stackflow's own
// DB record — the provider only vouches for the credentials.
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { email, password } = (body ?? {}) as { email?: unknown; password?: unknown };
  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    return NextResponse.json({ error: "email and password are required" }, { status: 400 });
  }

  let user;
  try {
    user = await authenticate(email, password);
  } catch (err) {
    if (err instanceof AuthProviderError) {
      // Misconfiguration or an unreachable upstream — never a credential verdict.
      console.error("Auth provider error:", err.message);
      return NextResponse.json({ error: "Authentication is unavailable" }, { status: 503 });
    }
    throw err;
  }

  // Same generic 401 whether the email is unknown or the password is wrong.
  if (!user) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  await createSession(user);
  return NextResponse.json(toUser(user));
}
