"use client";

import { KeyRound } from "lucide-react";

import { ChangePasswordForm } from "@/components/profile/change-password-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/**
 * "Change password" button on the profile card that opens the change-password
 * form in a modal. Credentials accounts only (the page hides it for OAuth users).
 */
export function ChangePasswordDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <KeyRound />
          Change password
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change password</DialogTitle>
          <DialogDescription>
            Enter your current password and choose a new one.
          </DialogDescription>
        </DialogHeader>
        <ChangePasswordForm />
      </DialogContent>
    </Dialog>
  );
}
