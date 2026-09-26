import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { toUser } from "@/lib/serialize";
import { canAssign } from "@/lib/rbac";

// GET /api/auth/session -> { user, members }
// members is the roster used to render assignee names/avatars. Only admins (who
// can assign cards to anyone) receive the full roster; a member sees only their
// own record — they only ever view their own cards, so that's all they need, and
// it avoids leaking the org roster + who's an admin. 401 if not signed in.
export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const members = canAssign(user)
    ? await prisma.user.findMany({ orderBy: { name: "asc" } })
    : [user];
  return NextResponse.json({ user: toUser(user), members: members.map(toUser) });
}
