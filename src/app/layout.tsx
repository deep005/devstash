import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DevStash",
  description: "Your developer knowledge hub",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Dark mode is the default (see project UI/UX guidelines). A light-mode
  // toggle can be layered on in a later phase.
  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        {/* Forced dark: this app has no next-themes provider, only the
            hardcoded `dark` class above, so Toaster's own theme detection
            would default to "system" and mismatch. */}
        <Toaster theme="dark" />
      </body>
    </html>
  );
}
