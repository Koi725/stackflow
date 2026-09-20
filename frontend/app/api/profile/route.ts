import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { toProfile } from "@/lib/serialize";
import { validateProfilePatch } from "@/lib/validate";
import { initialsFrom } from "@/lib/auth/mirror";

// GET /api/profile -> the SESSION user's own profile (identity from the session,
// never from the client). There is no :id param, so no one can read another user.
export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  return NextResponse.json(toProfile(user));
}

// PATCH /api/profile -> update ONLY the session user's own firstName/lastName/age.
// Role and email are never read from the body, so they cannot be changed here.
export async function PATCH(request: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = validateProfilePatch(body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const data: { firstName?: string | null; lastName?: string | null; age?: number | null; name?: string; initials?: string } = {
    ...parsed.value,
  };

  // Keep the display name + initials in sync with first/last name so the avatar
  // fallback and board reflect the change. name is required, so only set it when
  // the derived value is non-empty.
  const first = parsed.value.firstName !== undefined ? parsed.value.firstName : user.firstName;
  const last = parsed.value.lastName !== undefined ? parsed.value.lastName : user.lastName;
  const derivedName = [first, last].filter(Boolean).join(" ").trim();
  if (derivedName) {
    data.name = derivedName;
    data.initials = initialsFrom(derivedName);
  }

  const updated = await prisma.user.update({ where: { id: user.id }, data });
  return NextResponse.json(toProfile(updated));
}
