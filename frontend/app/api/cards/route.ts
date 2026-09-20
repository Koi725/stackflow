import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { toCard } from "@/lib/serialize";
import { validateCardInput } from "@/lib/validate";

// GET /api/cards -> Card[]  (any authenticated user sees all cards)
export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const cards = await prisma.card.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json(cards.map(toCard));
}

// POST /api/cards -> Card  (owner is always the session user, never client-sent)
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

  const card = await prisma.card.create({
    data: { ...parsed.value, ownerId: user.id },
  });
  return NextResponse.json(toCard(card), { status: 201 });
}
