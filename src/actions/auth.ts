"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { signIn, signOut } from "@/auth";
import {
  requestResetSchema,
  resetPasswordSchema,
  signInSchema,
} from "@/lib/auth-schemas";
import { isEmailVerificationEnabled } from "@/lib/flags";
import {
  issuePasswordResetEmail,
  resetPasswordWithToken,
} from "@/lib/password-reset";
import { prisma } from "@/lib/prisma";
import { issueVerificationEmail } from "@/lib/verification";

export interface SignInState {
  error: string | null;
  /** Set when the credentials are valid but the email is unverified. */
  needsVerification?: boolean;
  /** The email to offer a resend for, when needsVerification is set. */
  email?: string;
}

const DEFAULT_SIGNED_IN_URL = "/dashboard";

/** Only relative paths may be used as a post-sign-in destination. */
function safeCallbackUrl(value: FormDataEntryValue | null): string {
  return typeof value === "string" && value.startsWith("/")
    ? value
    : DEFAULT_SIGNED_IN_URL;
}

export async function signInWithCredentials(
  _prevState: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: "Enter a valid email address and password." };
  }

  const { email, password } = parsed.data;

  // When verification is on and the credentials are correct but the account is
  // unverified, show a specific message + resend option instead of the generic
  // invalid-credentials error that authorize (which also blocks unverified
  // users) would produce.
  if (isEmailVerificationEnabled()) {
    const account = await prisma.user.findUnique({
      where: { email },
      select: { password: true, emailVerified: true },
    });
    if (account?.password && !account.emailVerified) {
      const passwordMatches = await bcrypt.compare(password, account.password);
      if (passwordMatches) {
        return {
          error:
            "Please verify your email address to sign in. Check your inbox for the verification link.",
          needsVerification: true,
          email,
        };
      }
    }
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: safeCallbackUrl(formData.get("callbackUrl")),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        error:
          error.type === "CredentialsSignin"
            ? "Invalid email or password."
            : "Something went wrong. Please try again.",
      };
    }
    // On success signIn redirects by throwing; rethrow everything that is not
    // an auth failure so Next.js can complete the redirect.
    throw error;
  }
  return { error: null };
}

export async function signInWithGitHub(formData: FormData) {
  await signIn("github", {
    redirectTo: safeCallbackUrl(formData.get("callbackUrl")),
  });
}

export async function signOutUser() {
  await signOut({ redirectTo: "/sign-in" });
}

export interface ResendState {
  message: string | null;
  sent: boolean;
}

// Deliberately generic so the response never reveals whether an email is
// registered, already verified, or OAuth-only.
const RESEND_MESSAGE =
  "If that email needs verification, we've sent a new link. Check your inbox.";

/**
 * Re-sends the verification email for an unverified email/password account.
 * Always reports the same generic success to avoid account enumeration.
 */
export async function resendVerificationEmail(
  _prevState: ResendState,
  formData: FormData,
): Promise<ResendState> {
  // No-op when verification is disabled — nothing to resend.
  if (!isEmailVerificationEnabled()) {
    return { sent: true, message: RESEND_MESSAGE };
  }

  const parsed = z
    .email()
    .safeParse(String(formData.get("email") ?? "").trim().toLowerCase());

  if (parsed.success) {
    const user = await prisma.user.findUnique({
      where: { email: parsed.data },
      select: { name: true, password: true, emailVerified: true },
    });
    // Only (re)send for credentials accounts that are still unverified.
    if (user?.password && !user.emailVerified) {
      await issueVerificationEmail({ email: parsed.data, name: user.name });
    }
  }

  return { sent: true, message: RESEND_MESSAGE };
}

export interface RequestResetState {
  message: string | null;
  sent: boolean;
}

// Deliberately generic so the response never reveals whether an email is
// registered (or is an OAuth-only account with no password to reset).
const RESET_REQUEST_MESSAGE =
  "If an account exists for that email, we've sent a password reset link. Check your inbox.";

/**
 * Sends a password-reset email for an email/password account. Always reports the
 * same generic success to avoid account enumeration; only credentials accounts
 * (those with a stored password) actually receive a link.
 */
export async function requestPasswordReset(
  _prevState: RequestResetState,
  formData: FormData,
): Promise<RequestResetState> {
  const parsed = requestResetSchema.safeParse({ email: formData.get("email") });

  if (parsed.success) {
    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
      select: { name: true, password: true },
    });
    // Only credentials accounts have a password to reset; OAuth-only and unknown
    // emails silently no-op.
    if (user?.password) {
      await issuePasswordResetEmail({ email: parsed.data.email, name: user.name });
    }
  }

  return { sent: true, message: RESET_REQUEST_MESSAGE };
}

export interface ResetPasswordState {
  error: string | null;
  fieldErrors?: { password?: string; confirmPassword?: string };
}

/**
 * Sets a new password from a valid reset token, then redirects to sign-in.
 * Invalid/expired tokens and validation failures return a message for the form.
 */
export async function resetPassword(
  _prevState: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const token = String(formData.get("token") ?? "");
  const parsed = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    const { fieldErrors } = z.flattenError(parsed.error);
    return {
      error: null,
      fieldErrors: {
        password: fieldErrors.password?.[0],
        confirmPassword: fieldErrors.confirmPassword?.[0],
      },
    };
  }

  const result = await resetPasswordWithToken({
    token,
    password: parsed.data.password,
  });

  if (result.status === "expired") {
    return {
      error:
        "This reset link has expired. Request a new one from the forgot-password page.",
    };
  }
  if (result.status === "invalid") {
    return {
      error:
        "This reset link is invalid or has already been used. Request a new one from the forgot-password page.",
    };
  }

  // Success — redirect must be called outside any try/catch (it throws
  // NEXT_REDIRECT). useActionState propagates the throw to complete navigation.
  redirect("/sign-in?reset=1");
}
