import type { Metadata } from "next";
import { DM_Serif_Display, Source_Serif_4, DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";

const dmSerifDisplay = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-serif-display",
});

const sourceSerif4 = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif-body",
});

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${dmSerifDisplay.variable} ${sourceSerif4.variable} ${dmSans.variable} ${dmMono.variable} h-full`}
    >
      <body
        className="min-h-full flex flex-col"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        {children}
      </body>
    </html>
  );
}
