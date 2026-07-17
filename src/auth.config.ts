import GitHub from "next-auth/providers/github";
import type { NextAuthConfig } from "next-auth";

// Edge-compatible config: providers only, no adapter. Imported by both
// auth.ts (full config) and proxy.ts (route protection) so the adapter
// never needs to load in the proxy runtime.
export default {
  providers: [GitHub],
} satisfies NextAuthConfig;
