import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { toCard } from "@/lib/serialize";
import { canEdit, canDelete } from "@/lib/rbac";
import { validateCardPatch } from "@/lib/validate";

type Params = { params: { id: string } };

// PATCH /api/cards/[id] -> Card  (admin OR owner; else 403)
export async function PATCH(request: Request, { params }: Params) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const card = await prisma.card.findUnique({ where: { id: params.id } });
  if (!card) return NextResponse.json({ error: "Card not found" }, { status: 404 });
  if (!canEdit(user, card)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = validateCardPatch(body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const updated = await prisma.card.update({ where: { id: params.id }, data: parsed.value });
  return NextResponse.json(toCard(updated));
}

// DELETE /api/cards/[id]  (admin only; else 403)
export async function DELETE(_request: Request, { params }: Params) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (!canDelete(user)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const card = await prisma.card.findUnique({ where: { id: params.id } });
  if (!card) return NextResponse.json({ error: "Card not found" }, { status: 404 });

  await prisma.card.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}
