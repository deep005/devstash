import { EMAIL_FROM, resend } from "./resend";

interface PasswordResetEmailInput {
  to: string;
  name: string | null;
  resetUrl: string;
}

const APP_NAME = "DevStash";

/** Builds the subject, HTML, and plain-text bodies for the password-reset email. */
function buildPasswordResetEmail({
  name,
  resetUrl,
}: Omit<PasswordResetEmailInput, "to">): {
  subject: string;
  html: string;
  text: string;
} {
  const greeting = name ? `Hi ${name},` : "Hi,";
  const subject = `Reset your ${APP_NAME} password`;

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#18181b;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;margin:0 auto;background:#ffffff;border:1px solid #e4e4e7;border-radius:12px;">
      <tr>
        <td style="padding:32px;">
          <h1 style="margin:0 0 16px;font-size:20px;font-weight:600;">Reset your password</h1>
          <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#3f3f46;">${greeting}</p>
          <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#3f3f46;">
            We received a request to reset your ${APP_NAME} password. Click the button below to choose a new one.
          </p>
          <a href="${resetUrl}" style="display:inline-block;padding:10px 20px;background:#18181b;color:#ffffff;font-size:14px;font-weight:500;text-decoration:none;border-radius:8px;">
            Reset password
          </a>
          <p style="margin:24px 0 8px;font-size:12px;line-height:1.6;color:#71717a;">
            Or paste this link into your browser:
          </p>
          <p style="margin:0 0 24px;font-size:12px;line-height:1.6;word-break:break-all;">
            <a href="${resetUrl}" style="color:#2563eb;">${resetUrl}</a>
          </p>
          <p style="margin:0;font-size:12px;line-height:1.6;color:#a1a1aa;">
            This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email — your password won't change.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = `${greeting}

We received a request to reset your ${APP_NAME} password. Open this link to choose a new one:

${resetUrl}

This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email — your password won't change.`;

  return { subject, html, text };
}

/**
 * Sends the password-reset email via Resend. Never throws — returns
 * { ok: false } on failure so callers can decide how to react.
 */
export async function sendPasswordResetEmail({
  to,
  name,
  resetUrl,
}: PasswordResetEmailInput): Promise<{ ok: boolean }> {
  const { subject, html, text } = buildPasswordResetEmail({ name, resetUrl });

  try {
    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject,
      html,
      text,
    });
    if (error) {
      console.error(`Password-reset email failed for ${to}: ${error.name} — ${error.message}`);
      return { ok: false };
    }
    return { ok: true };
  } catch (error) {
    console.error(`Password-reset email threw for ${to}:`, error);
    return { ok: false };
  }
}
