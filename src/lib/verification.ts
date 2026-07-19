import { randomBytes } from "node:crypto";

import { getBaseUrl } from "@/lib/base-url";
import { sendVerificationEmail } from "@/lib/email/verification-email";
import { PASSWORD_RESET_IDENTIFIER_PREFIX } from "@/lib/password-reset";
import { prisma } from "@/lib/prisma";

// Verification links are valid for 24 hours.
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * Creates a fresh email-verification token for `email`, invalidating any
 * existing ones (a resend supersedes the previous link). Stored in the
 * NextAuth `VerificationToken` table (identifier = email).
 */
async function createEmailVerificationToken(email: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + TOKEN_TTL_MS);

  await prisma.verificationToken.deleteMany({ where: { identifier: email } });
  await prisma.verificationToken.create({
    data: { identifier: email, token, expires },
  });

  return token;
}

/**
 * Issues a verification token for the user and emails them the link. Returns
 * the send result; never throws. Callers create the user first, then call this.
 */
export async function issueVerificationEmail({
  email,
  name,
}: {
  email: string;
  name: string | null;
}): Promise<{ ok: boolean }> {
  const token = await createEmailVerificationToken(email);
  const verifyUrl = `${getBaseUrl()}/verify-email?token=${token}`;
  return sendVerificationEmail({ to: email, name, verifyUrl });
}

export type VerifyEmailResult =
  | { status: "success" }
  | { status: "expired"; email: string }
  | { status: "invalid" };

/**
 * Validates a verification token: on success marks the user's email verified
 * (idempotent) and consumes the token. Expired tokens are deleted and reported
 * so the UI can offer a resend. Unknown tokens / users report "invalid".
 */
export async function verifyEmailToken(
  token: string,
): Promise<VerifyEmailResult> {
  if (!token) {
    return { status: "invalid" };
  }

  const record = await prisma.verificationToken.findUnique({
    where: { token },
  });
  if (!record) {
    return { status: "invalid" };
  }

  // Password-reset tokens share this table under a namespaced identifier — never
  // consume one here (that would burn a valid reset link). Report invalid and
  // leave it untouched for the reset flow.
  if (record.identifier.startsWith(PASSWORD_RESET_IDENTIFIER_PREFIX)) {
    return { status: "invalid" };
  }

  if (record.expires < new Date()) {
    await prisma.verificationToken
      .delete({ where: { token } })
      .catch(() => {});
    return { status: "expired", email: record.identifier };
  }

  const user = await prisma.user.findUnique({
    where: { email: record.identifier },
    select: { id: true, emailVerified: true },
  });
  if (!user) {
    await prisma.verificationToken
      .delete({ where: { token } })
      .catch(() => {});
    return { status: "invalid" };
  }

  // Mark verified before consuming the token, so an interrupted run leaves the
  // user verified (harmless) rather than unverified with the token gone.
  if (!user.emailVerified) {
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
    });
  }
  await prisma.verificationToken.delete({ where: { token } }).catch(() => {});

  return { status: "success" };
}
