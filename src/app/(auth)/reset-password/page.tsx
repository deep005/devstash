import type { Metadata } from "next";
import Link from "next/link";

import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Button } from "@/components/ui/button";
import { checkPasswordResetToken } from "@/lib/password-reset";

export const metadata: Metadata = {
  title: "Reset password — DevStash",
};

// Force dynamic: the token is validated against the database on every request,
// so this page must never be statically prerendered or cached.
export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const token = firstValue(params.token) ?? "";
  // Read-only check — the token is only consumed when the form is submitted.
  const result = await checkPasswordResetToken(token);

  if (result.status === "valid") {
    return (
      <div className="space-y-5">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight">
            Set a new password
          </h1>
          <p className="text-sm text-muted-foreground">
            Choose a new password for your DevStash account.
          </p>
        </div>
        <ResetPasswordForm token={token} />
      </div>
    );
  }

  const expired = result.status === "expired";

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">
          {expired ? "Link expired" : "Invalid link"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {expired
            ? "This password reset link has expired. Request a new one below."
            : "This password reset link is invalid or has already been used. Request a new one below."}
        </p>
      </div>
      <Button asChild className="w-full">
        <Link href="/forgot-password">Request a new link</Link>
      </Button>
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
