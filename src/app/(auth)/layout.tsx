import Link from "next/link";
import { Layers } from "lucide-react";

/**
 * Shared shell for the auth pages (/sign-in, /register): brand mark above a
 * centered card on a full-height page.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 p-6">
      <Link href="/" className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Layers className="size-4.5" />
        </span>
        <span className="text-lg font-semibold tracking-tight">DevStash</span>
      </Link>
      <div className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-sm">
        {children}
      </div>
    </div>
  );
}
