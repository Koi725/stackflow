import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { toCard } from "@/lib/serialize";
import { canAssign } from "@/lib/rbac";
import { validateCardInput } from "@/lib/validate";

// GET /api/cards -> Card[]
// Admin sees ALL cards; a member sees only the cards assigned to them.
export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const cards = await prisma.card.findMany({
    where: user.role === "admin" ? undefined : { ownerId: user.id },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(cards.map(toCard));
}

// POST /api/cards -> Card
// Members always create cards owned by themselves. Admins may assign on create by
// passing ownerId (any existing user). Any needsHelp flag applies to the new card.
export async function POST(request: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = validateCardInput(body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const { ownerId: requestedOwnerId, needsHelp, ...fields } = parsed.value;

  // Resolve the assignee. Default = self. Only admins may target someone else,
  // and only an existing user.
  let ownerId = user.id;
  if (requestedOwnerId && requestedOwnerId !== user.id) {
    if (!canAssign(user)) {
      return NextResponse.json({ error: "Members cannot assign cards to other users" }, { status: 403 });
    }
    const target = await prisma.user.findUnique({ where: { id: requestedOwnerId } });
    if (!target) return NextResponse.json({ error: "Assignee not found" }, { status: 400 });
    ownerId = target.id;
  }

  const card = await prisma.card.create({
    data: { ...fields, ownerId, ...(needsHelp !== undefined ? { needsHelp } : {}) },
  });
  return NextResponse.json(toCard(card), { status: 201 });
}
