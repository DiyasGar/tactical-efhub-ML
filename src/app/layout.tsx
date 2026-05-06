import type { Metadata } from "next";
import { Inter, Space_Grotesk, Lexend } from "next/font/google";
import AppShell from "@/components/AppShell";
import "./globals.css";

/* ─── Google Fonts (via next/font for zero-CLS) ─── */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const lexend = Lexend({
  subsets: ["latin"],
  variable: "--font-label",
  display: "swap",
});

/* ─── Metadata ─── */
export const metadata: Metadata = {
  title: "EFHub — eFootball Tactical AI Recommender",
  description:
    "AI-powered player recommendations based on elite eFootball tactical data. Outsmart your opponents with predictive analytics and real-time meta adjustments.",
};

/* ─── Root Layout ─── */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${spaceGrotesk.variable} ${lexend.variable} dark`}
    >
      <body suppressHydrationWarning className="min-h-screen overflow-x-hidden antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
