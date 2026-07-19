import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";

import { ResendVerificationForm } from "@/components/auth/resend-verification-form";
import { Button } from "@/components/ui/button";
import { isEmailVerificationEnabled } from "@/lib/flags";
import { verifyEmailToken } from "@/lib/verification";

export const metadata: Metadata = {
  title: "Verify email — DevStash",
};

// Force dynamic: when EMAIL_VERIFICATION_ENABLED is off, this page short-
// circuits to an unconditional redirect with no searchParams read, which
// Next would otherwise prerender as static HTML at build time — freezing
// that redirect in place until the next rebuild, even if the flag is later
// flipped back on and the server restarted.
export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  // With verification disabled there are no tokens to confirm; send stale links
  // to sign-in rather than showing an "invalid link" state.
  if (!isEmailVerificationEnabled()) {
    redirect("/sign-in");
  }

  const params = await searchParams;
  const token = firstValue(params.token) ?? "";
  const result = await verifyEmailToken(token);

  if (result.status === "success") {
    return (
      <div className="space-y-5">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight">Email verified</h1>
          <p className="text-sm text-muted-foreground">
            Your email address is confirmed. You can now sign in to DevStash.
          </p>
        </div>
        <Button asChild className="w-full">
          <Link href="/sign-in?verified=1">Continue to sign in</Link>
        </Button>
      </div>
    );
  }

  if (result.status === "expired") {
    return (
      <div className="space-y-5">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight">Link expired</h1>
          <p className="text-sm text-muted-foreground">
            This verification link has expired. Request a new one below.
          </p>
        </div>
        <ResendVerificationForm email={result.email} />
        <p className="text-center text-sm text-muted-foreground">
          <Link
            href="/sign-in"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Back to sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">Invalid link</h1>
        <p className="text-sm text-muted-foreground">
          This verification link is invalid or has already been used. Try
          signing in — if your email still needs verifying, you can request a new
          link there.
        </p>
      </div>
      <Button asChild variant="outline" className="w-full">
        <Link href="/sign-in">Go to sign in</Link>
      </Button>
    </div>
  );
}
