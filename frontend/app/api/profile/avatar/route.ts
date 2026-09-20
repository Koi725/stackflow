import { randomUUID } from "crypto";
import { mkdir, writeFile, unlink } from "fs/promises";
import { join } from "path";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { toProfile } from "@/lib/serialize";
import {
  AVATAR_DIR,
  AVATAR_URL_PREFIX,
  ALLOWED_EXTENSIONS,
  MAX_AVATAR_BYTES,
  STORED_NAME_RE,
  extFromFilename,
  sniffImage,
} from "@/lib/avatar";

export const runtime = "nodejs"; // needs Node fs/crypto, not the edge runtime

// POST /api/profile/avatar  (multipart, field "avatar")
//
// Hardened, self-only avatar upload. It takes NO target user id — it always
// writes the SESSION user's own avatar (no IDOR). It is a direct file upload,
// never a URL fetch (no SSRF). See lib/avatar.ts for the full threat model.
export async function POST(request: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 });
  }

  const file = form.get("avatar");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "An image file is required" }, { status: 400 });
  }
  if (file.size > MAX_AVATAR_BYTES) {
    return NextResponse.json({ error: "Image too large (max 2 MB)" }, { status: 413 });
  }

  // Extension allowlist on the *claimed* filename (defense in depth). SVG etc. fail here…
  const claimedExt = extFromFilename(file.name || "");
  if (claimedExt && !(ALLOWED_EXTENSIONS as readonly string[]).includes(claimedExt)) {
    return NextResponse.json({ error: "Unsupported file type. Use JPG, PNG, or WebP." }, { status: 415 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.length > MAX_AVATAR_BYTES) {
    return NextResponse.json({ error: "Image too large (max 2 MB)" }, { status: 413 });
  }

  // …and the authoritative check: verify the real bytes. SVG/GIF/HTML/scripts → null → reject.
  const detected = sniffImage(buf);
  if (!detected) {
    return NextResponse.json(
      { error: "Unsupported or unrecognized image. Use JPG, PNG, or WebP (SVG is not allowed)." },
      { status: 415 },
    );
  }

  // Store under a generated UUID name — NEVER the user's filename (no traversal).
  const filename = `${randomUUID()}.${detected.ext}`;
  await mkdir(AVATAR_DIR, { recursive: true });
  await writeFile(join(AVATAR_DIR, filename), buf, { mode: 0o600 });

  const previous = user.avatarUrl;
  const updated = await prisma.user.update({
    where: { id: user.id }, // self only
    data: { avatarUrl: `${AVATAR_URL_PREFIX}${filename}` },
  });

  // Best-effort cleanup of the user's own previous avatar file.
  if (previous && previous.startsWith(AVATAR_URL_PREFIX)) {
    const prevName = previous.slice(AVATAR_URL_PREFIX.length);
    if (STORED_NAME_RE.test(prevName)) {
      await unlink(join(AVATAR_DIR, prevName)).catch(() => {});
    }
  }

  return NextResponse.json(toProfile(updated));
}
