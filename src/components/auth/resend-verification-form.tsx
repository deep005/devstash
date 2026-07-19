"use client";

import * as React from "react";

import { resendVerificationEmail, type ResendState } from "@/actions/auth";
import { Button } from "@/components/ui/button";

const INITIAL_STATE: ResendState = { message: null, sent: false };

/**
 * Requests a fresh verification email for `email`. Used on the sign-in page
 * (correct-but-unverified login) and the verify-email page (expired link).
 */
export function ResendVerificationForm({ email }: { email: string }) {
  const [state, formAction, isPending] = React.useActionState(
    resendVerificationEmail,
    INITIAL_STATE,
  );

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="email" value={email} />
      <Button
        type="submit"
        variant="outline"
        className="w-full"
        disabled={isPending || state.sent}
      >
        {isPending
          ? "Sending…"
          : state.sent
            ? "Verification email sent"
            : "Resend verification email"}
      </Button>
      {state.message && (
        <p className="text-sm text-muted-foreground">{state.message}</p>
      )}
    </form>
  );
}
