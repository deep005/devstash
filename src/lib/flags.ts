/**
 * Server-side feature flags.
 *
 * Email verification is ON by default. Set `EMAIL_VERIFICATION_ENABLED=false`
 * to disable it: registration then sends no verification email and marks new
 * accounts verified on creation, sign-in is not gated, and the resend action
 * is a no-op. Changing the env value takes effect after a server restart.
 */
export function isEmailVerificationEnabled(): boolean {
  return process.env.EMAIL_VERIFICATION_ENABLED !== "false";
}
