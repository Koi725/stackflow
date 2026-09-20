import { PrismaClient, type Label, type Priority, type Column } from "@prisma/client";
import bcrypt from "bcryptjs";

// Idempotent seed: generic team members (no real personal data) and ~8 sample
// dev-team cards. Passwords come from env — no hardcoded defaults.

const prisma = new PrismaClient();

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not set — refusing to seed without it`);
  return v;
}

async function main() {
  const adminPassword = requireEnv("SEED_ADMIN_PASSWORD");
  const memberPassword = requireEnv("SEED_MEMBER_PASSWORD");
  const adminHash = await bcrypt.hash(adminPassword, 10);
  const memberHash = await bcrypt.hash(memberPassword, 10);

  const people = [
    { email: "alex@stackflow.dev", name: "Alex Kim", initials: "AK", role: "admin" as const, hash: adminHash },
    { email: "sam@stackflow.dev", name: "Sam Lee", initials: "SL", role: "member" as const, hash: memberHash },
    { email: "jordan@stackflow.dev", name: "Jordan Park", initials: "JP", role: "member" as const, hash: memberHash },
    { email: "riley@stackflow.dev", name: "Riley Chen", initials: "RC", role: "member" as const, hash: memberHash },
  ];

  const users: Record<string, string> = {}; // email -> id
  for (const p of people) {
    const u = await prisma.user.upsert({
      where: { email: p.email },
      update: { name: p.name, initials: p.initials, role: p.role, passwordHash: p.hash },
      create: { email: p.email, name: p.name, initials: p.initials, role: p.role, passwordHash: p.hash },
    });
    users[p.email] = u.id;
  }

  const cards: {
    id: string; title: string; description: string;
    label: Label; priority: Priority; column: Column; owner: string; needsHelp?: boolean;
  }[] = [
    { id: "seed-101", title: "Fix login bug", description: "Session cookie expires immediately on Safari 17. Reproduce with a fresh profile, check SameSite handling.", label: "bug", priority: "high", column: "blocked", owner: "alex@stackflow.dev" },
    { id: "seed-102", title: "Write API docs", description: "Cover auth, boards, cards and the webhook payloads. Keep it to one page per resource.", label: "docs", priority: "med", column: "todo", owner: "sam@stackflow.dev" },
    { id: "seed-103", title: "Deploy v2", description: "Blocked on the database migration review. Ship once the rollback plan is signed off.", label: "feature", priority: "high", column: "progress", owner: "jordan@stackflow.dev" },
    { id: "seed-104", title: "Design landing page", description: "Poster-style hero, one screenshot, install command. Nothing else.", label: "feature", priority: "low", column: "done", owner: "alex@stackflow.dev" },
    { id: "seed-105", title: "Refactor auth", description: "Collapse the three token helpers into one module with tests.", label: "feature", priority: "med", column: "todo", owner: "sam@stackflow.dev" },
    { id: "seed-106", title: "Drag drops cards on touch", description: "Cards jump back on iOS when the finger leaves the column early.", label: "bug", priority: "med", column: "todo", owner: "riley@stackflow.dev", needsHelp: true },
    { id: "seed-107", title: "Keyboard shortcuts", description: "N for new card, arrows to move focus, Enter to open.", label: "feature", priority: "low", column: "progress", owner: "jordan@stackflow.dev" },
    { id: "seed-108", title: "Contributing guide", description: "How to run locally, code style, how to propose a column type.", label: "docs", priority: "low", column: "done", owner: "riley@stackflow.dev" },
  ];

  for (const c of cards) {
    const ownerId = users[c.owner];
    const data = { title: c.title, description: c.description, label: c.label, priority: c.priority, column: c.column, ownerId, needsHelp: c.needsHelp ?? false };
    await prisma.card.upsert({ where: { id: c.id }, update: data, create: { id: c.id, ...data } });
  }

  console.log(`Seeded ${people.length} users and ${cards.length} cards.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
