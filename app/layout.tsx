import type { Metadata } from "next";
import { DM_Sans, DM_Mono } from "next/font/google";
import LayoutShell from "@/components/layout/LayoutShell";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const dmMono = DM_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "KyLaw — LSAT 2026 Prep Platform",
  description: "Study smarter. Score higher. The most accurate 2026 LSAT simulator available.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${dmMono.variable}`}>
      <body style={{ fontFamily: "var(--font-sans)", margin: 0 }}>
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
