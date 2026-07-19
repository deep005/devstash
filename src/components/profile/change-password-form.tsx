"use client";

import * as React from "react";
import { KeyRound } from "lucide-react";

import { changePassword, type ChangePasswordState } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const INITIAL_STATE: ChangePasswordState = { error: null };

/**
 * Lets a credentials user change their password from the profile page.
 * Requires the current password; on success the server action signs the user
 * out and redirects to sign-in. Validation failures surface here as messages.
 */
export function ChangePasswordForm() {
  const [state, formAction, isPending] = React.useActionState(
    changePassword,
    INITIAL_STATE,
  );

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <p
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {state.error}
        </p>
      )}
      <div className="space-y-2">
        <Label htmlFor="currentPassword">Current password</Label>
        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          aria-invalid={state.fieldErrors?.currentPassword ? true : undefined}
          required
        />
        {state.fieldErrors?.currentPassword && (
          <p className="text-sm text-destructive">
            {state.fieldErrors.currentPassword}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="newPassword">New password</Label>
        <Input
          id="newPassword"
          name="password"
          type="password"
          autoComplete="new-password"
          aria-invalid={state.fieldErrors?.password ? true : undefined}
          required
        />
        {state.fieldErrors?.password && (
          <p className="text-sm text-destructive">
            {state.fieldErrors.password}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm new password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          aria-invalid={state.fieldErrors?.confirmPassword ? true : undefined}
          required
        />
        {state.fieldErrors?.confirmPassword && (
          <p className="text-sm text-destructive">
            {state.fieldErrors.confirmPassword}
          </p>
        )}
      </div>
      <Button type="submit" disabled={isPending}>
        <KeyRound />
        {isPending ? "Updating…" : "Update password"}
      </Button>
    </form>
  );
}
