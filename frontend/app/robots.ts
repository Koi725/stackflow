import type { MetadataRoute } from "next";

// Stackflow is a private tool — it must never be indexed. This emits a
// /robots.txt that disallows all crawlers on every path. Belt-and-suspenders
// with the X-Robots-Tag header (next.config.mjs) and the <meta name="robots">
// tag in app/layout.tsx.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
  };
}
