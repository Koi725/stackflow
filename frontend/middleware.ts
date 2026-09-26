import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Single server-side auth choke point for protected pages.
//
// Runs before the page renders (edge runtime), so an unauthenticated request to
// a protected route gets a 307 redirect to /login — it never reaches the page,
// so the page is never served as a 200 shell that a CDN could cache.
//
// This mirrors the session cookie contract in lib/session.ts (same COOKIE_NAME,
// same SESSION_SECRET-signed JWT). It only verifies the token's signature and
// expiry — jose is edge-compatible; Prisma is not, so the authoritative "does
// this user still exist" check stays in the API routes (which already 401).
// lib/session.ts can't be imported here because it pulls in server-only + Prisma.
const COOKIE_NAME = "stackflow_session";

function secret(): Uint8Array {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET is not set");
  return new TextEncoder().encode(s);
}

async function hasValidSession(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, secret());
    return true;
  } catch {
    // Missing secret, bad signature, or expired token → treat as unauthenticated.
    return false;
  }
}

export async function middleware(request: NextRequest) {
  if (await hasValidSession(request)) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.search = "";
  return NextResponse.redirect(url, 307);
}

// Only the authenticated, user-data pages. /login and public routes are untouched,
// and /api/* keeps its own 401 guards.
export const config = {
  matcher: ["/board", "/board/:path*"],
};
