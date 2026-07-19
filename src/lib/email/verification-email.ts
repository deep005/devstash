import { EMAIL_FROM, resend } from "./resend";

interface VerificationEmailInput {
  to: string;
  name: string | null;
  verifyUrl: string;
}

const APP_NAME = "DevStash";

/** Builds the subject, HTML, and plain-text bodies for the verification email. */
function buildVerificationEmail({
  name,
  verifyUrl,
}: Omit<VerificationEmailInput, "to">): {
  subject: string;
  html: string;
  text: string;
} {
  const greeting = name ? `Hi ${name},` : "Hi,";
  const subject = `Verify your ${APP_NAME} email address`;

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#18181b;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;margin:0 auto;background:#ffffff;border:1px solid #e4e4e7;border-radius:12px;">
      <tr>
        <td style="padding:32px;">
          <h1 style="margin:0 0 16px;font-size:20px;font-weight:600;">Verify your email</h1>
          <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#3f3f46;">${greeting}</p>
          <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#3f3f46;">
            Thanks for signing up for ${APP_NAME}. Confirm this email address to activate your account.
          </p>
          <a href="${verifyUrl}" style="display:inline-block;padding:10px 20px;background:#18181b;color:#ffffff;font-size:14px;font-weight:500;text-decoration:none;border-radius:8px;">
            Verify email address
          </a>
          <p style="margin:24px 0 8px;font-size:12px;line-height:1.6;color:#71717a;">
            Or paste this link into your browser:
          </p>
          <p style="margin:0 0 24px;font-size:12px;line-height:1.6;word-break:break-all;">
            <a href="${verifyUrl}" style="color:#2563eb;">${verifyUrl}</a>
          </p>
          <p style="margin:0;font-size:12px;line-height:1.6;color:#a1a1aa;">
            This link expires in 24 hours. If you didn't create a ${APP_NAME} account, you can ignore this email.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = `${greeting}

Thanks for signing up for ${APP_NAME}. Confirm this email address to activate your account:

${verifyUrl}

This link expires in 24 hours. If you didn't create a ${APP_NAME} account, you can ignore this email.`;

  return { subject, html, text };
}

/**
 * Sends the account-verification email via Resend. Never throws — returns
 * { ok: false } on failure so callers can decide how to react.
 */
export async function sendVerificationEmail({
  to,
  name,
  verifyUrl,
}: VerificationEmailInput): Promise<{ ok: boolean }> {
  const { subject, html, text } = buildVerificationEmail({ name, verifyUrl });

  try {
    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject,
      html,
      text,
    });
    if (error) {
      console.error(`Verification email failed for ${to}: ${error.name} — ${error.message}`);
      return { ok: false };
    }
    return { ok: true };
  } catch (error) {
    console.error(`Verification email threw for ${to}:`, error);
    return { ok: false };
  }
}
