/** @type {import('next').NextConfig} */

const isProd = process.env.NODE_ENV === "production";

// Content-Security-Policy.
//
// Next's App Router injects small inline bootstrap/hydration scripts and Framer
// Motion writes inline styles, so 'unsafe-inline' is required for script/style —
// this is the standard Next-safe baseline (a nonce would need custom middleware).
// In development, React Fast Refresh uses eval(), so 'unsafe-eval' is added ONLY
// there and never ships to production.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isProd ? "" : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:", // avatars are same-origin (/api/avatar); data: for any inline images
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isProd ? ["upgrade-insecure-requests"] : []),
].join("; ");

// Applied to every response (pages + API) via Next's headers().
const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // Served exclusively over HTTPS (Let's Encrypt via nginx). Pin HTTPS for 2y
  // across subdomains so a first-visit downgrade/SSL-strip can't reach the app.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  // Private tool — must never be indexed. Belt-and-suspenders with app/robots.ts
  // and the <meta name="robots"> tag in app/layout.tsx.
  { key: "X-Robots-Tag", value: "noindex, nofollow" },
];

// API responses are per-user and must never be cached by the CDN (WCDN). no-store
// + Vary: Cookie prevent cache poisoning/deception (e.g. /api/cards?x=.jpg) from
// ever serving one user's data to another. The avatar SERVE route is excluded:
// it sets its own `Cache-Control: private, max-age=3600` on immutable UUID files,
// so applying no-store here would clobber that. The negative lookahead matches
// every /api/* path EXCEPT those under /api/avatar/.
const apiNoStoreHeaders = [
  { key: "Cache-Control", value: "no-store" },
  { key: "Vary", value: "Cookie" },
];

const nextConfig = {
  // Emit a self-contained server bundle (.next/standalone/server.js) so the
  // production image can run without dev dependencies or a full node_modules.
  output: "standalone",
  experimental: {
    // Required on Next 14 for instrumentation.ts register() to run at startup
    // (SESSION_SECRET / AUTH_MODE validation). Stable/default in Next 15+.
    instrumentationHook: true,
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Every /api/* route except /api/avatar/* gets no-store + Vary: Cookie.
      { source: "/api/:path((?!avatar/).*)", headers: apiNoStoreHeaders },
    ];
  },
};

export default nextConfig;
