import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";

// Edge-compatible config: providers only, no adapter. Imported by both
// auth.ts (full config) and proxy.ts (route protection) so the adapter
// never needs to load in the proxy runtime.
//
// Credentials here is a placeholder (authorize always fails): the real
// bcrypt + Prisma validation lives in auth.ts, which overrides this
// provider. Keeping the shape here lets the proxy and the default
// sign-in page know the provider exists without pulling Node-only
// dependencies into the edge bundle.
export default {
  pages: {
    signIn: "/sign-in",
  },
  providers: [
    GitHub,
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: () => null,
    }),
  ],
} satisfies NextAuthConfig;
