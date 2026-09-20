import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { toCard } from "@/lib/serialize";
import { canMove } from "@/lib/rbac";
import { validateColumn } from "@/lib/validate";

type Params = { params: { id: string } };

// POST /api/cards/[id]/move  { column } -> Card  (admin OR owner; else 403)
export async function POST(request: Request, { params }: Params) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const card = await prisma.card.findUnique({ where: { id: params.id } });
  if (!card) return NextResponse.json({ error: "Card not found" }, { status: 404 });
  if (!canMove(user, card)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = validateColumn(body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const updated = await prisma.card.update({ where: { id: params.id }, data: { column: parsed.value } });
  return NextResponse.json(toCard(updated));
}
