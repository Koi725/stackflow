import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";

// Archivo is kept ONLY as the display face for the logo/hero headline (font-display).
// Body/UI text uses the clean system UI stack (see tailwind.config.ts › fontFamily.sans)
// for a calm, highly-readable, Telegram/native feel.
const archivo = Archivo({ subsets: ["latin"], weight: ["800"], variable: "--font-archivo", display: "swap" });

export const metadata: Metadata = {
  title: "Stackflow",
  description: "Move work. Nothing else.",
  // Private tool — must never be indexed. Next renders this as
  // <meta name="robots" content="noindex, nofollow"> in every page's <head>.
  // Belt-and-suspenders with app/robots.ts and the X-Robots-Tag header.
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={archivo.variable}>
      <body className="font-sans min-h-full flex flex-col">{children}</body>
    </html>
  );
}
