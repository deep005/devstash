"use client";

import * as React from "react";
import { toast } from "sonner";

import { requestPasswordReset, type RequestResetState } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const INITIAL_STATE: RequestResetState = { message: null, sent: false };

/**
 * Requests a password-reset email. The response is deliberately generic (no
 * account enumeration), so on submit we simply show the confirmation message.
 */
export function ForgotPasswordForm() {
  const [state, formAction, isPending] = React.useActionState(
    requestPasswordReset,
    INITIAL_STATE,
  );

  React.useEffect(() => {
    if (state.rateLimited && state.message) {
      toast.error(state.message);
    }
  }, [state]);

  if (state.sent) {
    return (
      <p className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
        {state.message}
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Sending…" : "Send reset link"}
      </Button>
    </form>
  );
}
