"use client";

import * as React from "react";
import { Trash2, TriangleAlert } from "lucide-react";

import { deleteAccount, type DeleteAccountState } from "@/actions/auth";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const INITIAL_STATE: DeleteAccountState = { error: null };
const CONFIRM_WORD = "DELETE";

/**
 * "Delete account" button on the profile card that opens a confirmation modal.
 * Requires typing DELETE before the delete button enables; on success the server
 * action deletes the user, signs them out, and redirects to sign-in.
 */
export function DeleteAccountDialog() {
  const [state, formAction, isPending] = React.useActionState(
    deleteAccount,
    INITIAL_STATE,
  );
  const [open, setOpen] = React.useState(false);
  const [confirm, setConfirm] = React.useState("");

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setConfirm("");
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 />
          Delete account
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <form action={formAction} className="grid gap-4">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2.5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <TriangleAlert className="size-4" />
              </span>
              Delete account?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes your account and all your items,
              collections, and custom types. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {state.error && (
            <p
              role="alert"
              className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {state.error}
            </p>
          )}

          <div className="space-y-2">
            <Label htmlFor="confirm">
              Type{" "}
              <span className="font-semibold text-foreground">
                {CONFIRM_WORD}
              </span>{" "}
              to confirm
            </Label>
            <Input
              id="confirm"
              name="confirm"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              required
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
            <Button
              type="submit"
              variant="destructive"
              disabled={confirm !== CONFIRM_WORD || isPending}
            >
              <Trash2 />
              {isPending ? "Deleting…" : "Delete account"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
