import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import type { User } from "@prisma/client";
import { prisma } from "./db";

// Cookie-based session: a signed JWT (jose) in an httpOnly cookie.
// The token carries only the user id — role and identity are always re-loaded
// from the database in getSession(), so the client can never assert who it is.

const COOKIE_NAME = "stackflow_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function secret(): Uint8Array {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET is not set");
  return new TextEncoder().encode(s);
}

/** Sign a JWT for this user and store it in an httpOnly cookie. */
export async function createSession(user: { id: string }): Promise<void> {
  const token = await new SignJWT({ sub: user.id })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secret());

  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

/**
 * Return the current user (full DB record) or null.
 * Verifies the cookie's JWT, then loads the user fresh from the DB — never
 * trusts any role/id supplied by the client.
 */
export async function getSession(): Promise<User | null> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    const id = payload.sub;
    if (typeof id !== "string") return null;
    return await prisma.user.findUnique({ where: { id } });
  } catch {
    return null;
  }
}

/** Remove the session cookie. */
export function clearSession(): void {
  cookies().set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
