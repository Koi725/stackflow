import { readFile } from "fs/promises";
import { join } from "path";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { AVATAR_DIR, STORED_NAME_RE, contentTypeForStoredExt } from "@/lib/avatar";

export const runtime = "nodejs"; // needs Node fs

// GET /api/avatar/<uuid>.<ext>
//
// Serves a stored avatar with the VERIFIED Content-Type and X-Content-Type-Options:
// nosniff so a browser can never re-interpret/execute it. The filename must match
// the strict "<uuidv4>.<ext>" pattern, which blocks any path traversal. Requires a
// session (avatars are shown to signed-in teammates), but is not owner-scoped.
export async function GET(_request: Request, { params }: { params: { file: string } }) {
  const session = await getSession();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const name = params.file;
  if (!STORED_NAME_RE.test(name)) {
    return new NextResponse("Not found", { status: 404 });
  }
  const ext = name.slice(name.lastIndexOf(".") + 1);
  const contentType = contentTypeForStoredExt(ext);
  if (!contentType) return new NextResponse("Not found", { status: 404 });

  let data: Buffer;
  try {
    data = await readFile(join(AVATAR_DIR, name));
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(new Uint8Array(data), {
    headers: {
      "Content-Type": contentType,
      "X-Content-Type-Options": "nosniff",
      "Content-Disposition": "inline",
      "Content-Length": String(data.length),
      "Cache-Control": "private, max-age=3600",
    },
  });
}
