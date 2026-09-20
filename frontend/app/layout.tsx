import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";

const archivo = Archivo({ subsets: ["latin"], weight: ["400", "600", "800"], variable: "--font-archivo" });

export const metadata: Metadata = { title: "Stackflow", description: "Move work. Nothing else." };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={archivo.variable}>
      <body className="font-sans min-h-full flex flex-col">{children}</body>
    </html>
  );
}
