import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { toUser } from "@/lib/serialize";

// GET /api/auth/session -> { user, members }
// members = all users (used for avatars). 401 if not signed in.
export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const members = await prisma.user.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json({ user: toUser(user), members: members.map(toUser) });
}
