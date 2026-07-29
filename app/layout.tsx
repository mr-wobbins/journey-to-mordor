import type { Metadata } from "next";
import { Figtree, Libre_Baskerville } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-sans",
});

const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Journey to Mordor",
  description:
    "Walk Hobbiton to Mount Doom with friends — sync foot miles from Strava and track your fellowship.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "h-full antialiased",
        figtree.variable,
        libreBaskerville.variable,
      )}
    >
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
