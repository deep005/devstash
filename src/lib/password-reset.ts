import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";

import { getBaseUrl } from "@/lib/base-url";
import { sendPasswordResetEmail } from "@/lib/email/password-reset-email";
import { prisma } from "@/lib/prisma";

// Password-reset links are valid for 1 hour — shorter than the 24h email
// verification window, which is the norm for resets.
const TOKEN_TTL_MS = 60 * 60 * 1000;

// Match the bcrypt cost used by registration and the seed.
const BCRYPT_ROUNDS = 12;

/**
 * Reset tokens share the NextAuth `VerificationToken` table with email-
 * verification tokens (which store the bare email as `identifier`). We namespace
 * the reset identifier so the two flows never clobber or consume each other's
 * tokens. `verifyEmailToken` reciprocally ignores this prefix.
 */
export const PASSWORD_RESET_IDENTIFIER_PREFIX = "password-reset:";

function toIdentifier(email: string): string {
  return `${PASSWORD_RESET_IDENTIFIER_PREFIX}${email}`;
}

/**
 * Creates a fresh password-reset token for `email`, invalidating any existing
 * ones (a new request supersedes the previous link).
 */
async function createPasswordResetToken(email: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + TOKEN_TTL_MS);
  const identifier = toIdentifier(email);

  await prisma.verificationToken.deleteMany({ where: { identifier } });
  await prisma.verificationToken.create({
    data: { identifier, token, expires },
  });

  return token;
}

/**
 * Issues a reset token for the user and emails them the link. Returns the send
 * result; never throws. Callers verify the account exists (and has a password)
 * first, then call this.
 */
export async function issuePasswordResetEmail({
  email,
  name,
}: {
  email: string;
  name: string | null;
}): Promise<{ ok: boolean }> {
  const token = await createPasswordResetToken(email);
  const resetUrl = `${getBaseUrl()}/reset-password?token=${token}`;
  return sendPasswordResetEmail({ to: email, name, resetUrl });
}

export type PasswordResetTokenStatus =
  | { status: "valid"; email: string }
  | { status: "expired" }
  | { status: "invalid" };

/**
 * Read-only validation of a reset token — used to decide whether to render the
 * reset form. Deliberately does NOT consume the token (so an email prefetch/scan
 * of the link can't burn it); consumption happens on submit in
 * `resetPasswordWithToken`. Only recognises reset-namespaced tokens.
 */
export async function checkPasswordResetToken(
  token: string,
): Promise<PasswordResetTokenStatus> {
  if (!token) {
    return { status: "invalid" };
  }

  const record = await prisma.verificationToken.findUnique({
    where: { token },
  });
  if (!record || !record.identifier.startsWith(PASSWORD_RESET_IDENTIFIER_PREFIX)) {
    return { status: "invalid" };
  }

  if (record.expires < new Date()) {
    return { status: "expired" };
  }

  const email = record.identifier.slice(PASSWORD_RESET_IDENTIFIER_PREFIX.length);
  return { status: "valid", email };
}

export type ResetPasswordResult =
  | { status: "success" }
  | { status: "expired" }
  | { status: "invalid" };

/**
 * Consumes a reset token and sets a new password: re-validates the token, hashes
 * the password (bcrypt @ 12 rounds), updates the user, and marks their email
 * verified if it wasn't already (clicking the emailed link proves inbox control).
 * The token is single-use — deleted after a successful reset.
 */
export async function resetPasswordWithToken({
  token,
  password,
}: {
  token: string;
  password: string;
}): Promise<ResetPasswordResult> {
  const check = await checkPasswordResetToken(token);
  if (check.status !== "valid") {
    return check.status === "expired"
      ? { status: "expired" }
      : { status: "invalid" };
  }

  const user = await prisma.user.findUnique({
    where: { email: check.email },
    select: { id: true, emailVerified: true },
  });
  if (!user) {
    return { status: "invalid" };
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: passwordHash,
      // Resetting via an emailed link proves control of the inbox, so verify the
      // email if it wasn't already — the account is then immediately usable.
      ...(user.emailVerified ? {} : { emailVerified: new Date() }),
    },
  });
  await prisma.verificationToken.delete({ where: { token } }).catch(() => {});

  return { status: "success" };
}
