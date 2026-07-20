"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";

import { signInWithCredentials, type SignInState } from "@/actions/auth";
import { ResendVerificationForm } from "@/components/auth/resend-verification-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const INITIAL_STATE: SignInState = { error: null };

interface SignInFormProps {
  callbackUrl?: string;
}

/** Email/password sign-in form backed by the credentials server action. */
export function SignInForm({ callbackUrl }: SignInFormProps) {
  const [state, formAction, isPending] = React.useActionState(
    signInWithCredentials,
    INITIAL_STATE,
  );

  React.useEffect(() => {
    if (state.rateLimited && state.error) {
      toast.error(state.error);
    }
  }, [state]);

  // A nested <form> is invalid HTML, so the resend form renders as a sibling
  // below the sign-in form (which stays usable for a retry after verifying).
  return (
    <div className="space-y-4">
      <form action={formAction} className="space-y-4">
        {state.error && !state.needsVerification && !state.rateLimited && (
          <p
            role="alert"
            className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {state.error}
          </p>
        )}
        <input type="hidden" name="callbackUrl" value={callbackUrl ?? ""} />
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
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      {state.needsVerification && state.email && (
        <div className="space-y-2">
          <p
            role="alert"
            className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-500"
          >
            {state.error}
          </p>
          <ResendVerificationForm email={state.email} />
        </div>
      )}
    </div>
  );
}
