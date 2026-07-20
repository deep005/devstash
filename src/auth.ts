import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";

import authConfig from "@/auth.config";
import { signInSchema } from "@/lib/auth-schemas";
import { isEmailVerificationEnabled } from "@/lib/flags";
import { prisma } from "@/lib/prisma";
import {
  checkRateLimit,
  formatRetryAfter,
  getClientIp,
  loginRateLimiter,
} from "@/lib/rate-limit";

// Thrown from authorize() when the sign-in rate limit is exceeded, so the
// signInWithCredentials action can show a distinct message instead of the
// generic "invalid credentials" one. authorize() is the single choke point
// for every credentials attempt — both the app's own sign-in action and any
// direct POST to /api/auth/callback/credentials funnel through it — so this
// is the one place that reliably rate-limits both paths.
export class RateLimitedError extends CredentialsSignin {
  code = "rate_limited";
  constructor(public retryAfter: string) {
    super();
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  // Replace the placeholder Credentials provider from auth.config.ts with the
  // real bcrypt + Prisma validation, which cannot live in the edge-safe config.
  providers: [
    ...authConfig.providers.filter(
      (provider) =>
        typeof provider === "function" || provider.id !== "credentials",
    ),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials, request) => {
        const parsed = signInSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;

        const ip = getClientIp(request.headers);
        const { success, reset } = await checkRateLimit(
          loginRateLimiter,
          `${ip}:${email}`,
        );
        if (!success) {
          throw new RateLimitedError(formatRetryAfter(reset));
        }

        const user = await prisma.user.findUnique({ where: { email } });
        // Reject unknown emails and OAuth-only accounts (no stored hash).
        if (!user?.password) {
          return null;
        }

        const passwordMatches = await bcrypt.compare(password, user.password);
        if (!passwordMatches) {
          return null;
        }

        // Block unverified email/password accounts when verification is on.
        // This is the security gate (it also protects the raw
        // /callback/credentials endpoint); the sign-in server action separately
        // surfaces a friendly "verify your email" message. OAuth users never
        // reach this authorize.
        if (isEmailVerificationEnabled() && !user.emailVerified) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
