import "server-only";
import { join } from "path";

// Avatar upload hardening — the security-critical core, kept in one place.
//
// Threat model & mitigations:
//  - XSS via SVG:        SVG is NOT in the allowlist and fails the magic-byte
//                        sniff below, so it can never be stored or served.
//  - Spoofed type:       we verify real content by magic bytes, never trusting
//                        the client's MIME type or file extension.
//  - Path traversal:     stored files are named "<uuidv4>.<ext>" and the serve
//                        route validates that pattern strictly (STORED_NAME_RE).
//  - Oversized uploads:  MAX_AVATAR_BYTES cap, checked on both size and buffer.
//  - MIME sniffing:      served with the verified Content-Type + nosniff.
//  - SSRF/IDOR:          upload is a direct file only (no URL fetch) and always
//                        targets the session user's own record (no id input).

/** Where avatar files live — OUTSIDE ./public so they are only ever served
 *  through the hardened route (which sets nosniff), never as raw static files. */
export const AVATAR_DIR = process.env.AVATAR_UPLOAD_DIR || join(process.cwd(), "var", "avatars");

/** Hard size cap for an uploaded avatar. */
export const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // 2 MB

/** Extensions we accept on the *incoming* filename (defense in depth; the
 *  magic-byte sniff is the authoritative check). Note: no "svg". */
export const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp"] as const;

export type DetectedImage = { ext: "jpg" | "png" | "webp"; contentType: string };

/**
 * Identify an image strictly by its magic bytes. Returns the canonical stored
 * extension + Content-Type, or null if the bytes are not a JPEG/PNG/WebP.
 * Anything else — including SVG, GIF, HTML, scripts — returns null and is rejected.
 */
export function sniffImage(buf: Buffer): DetectedImage | null {
  // JPEG: FF D8 FF
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return { ext: "jpg", contentType: "image/jpeg" };
  }
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buf.length >= 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47 &&
    buf[4] === 0x0d && buf[5] === 0x0a && buf[6] === 0x1a && buf[7] === 0x0a
  ) {
    return { ext: "png", contentType: "image/png" };
  }
  // WebP: "RIFF" .... "WEBP"
  if (buf.length >= 12 && buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") {
    return { ext: "webp", contentType: "image/webp" };
  }
  return null;
}

const CONTENT_TYPE_BY_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

/** Content-Type for a server-generated stored extension (trusted input). */
export function contentTypeForStoredExt(ext: string): string | null {
  return CONTENT_TYPE_BY_EXT[ext] ?? null;
}

/** Stored files are exactly "<uuidv4>.<jpg|png|webp>" — used to reject traversal on serve. */
export const STORED_NAME_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp)$/;

/** Lowercased extension from a filename, or null. */
export function extFromFilename(name: string): string | null {
  const m = /\.([A-Za-z0-9]+)$/.exec(name);
  return m ? m[1].toLowerCase() : null;
}

export const AVATAR_URL_PREFIX = "/api/avatar/";
