import { Resend } from "resend";

// Shared Resend client. The API key is read from RESEND_API_KEY; the SDK does
// not throw when it is missing — sends fail at call time — so importing this
// module is safe during build.
export const resend = new Resend(process.env.RESEND_API_KEY);

// Sender identity for outbound mail. onboarding@resend.dev is Resend's shared
// test sender (delivers only to your Resend account email); override EMAIL_FROM
// with a verified-domain address in production.
export const EMAIL_FROM = process.env.EMAIL_FROM ?? "DevStash <onboarding@resend.dev>";
