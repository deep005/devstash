import { prisma } from "@/lib/prisma";

// TODO(auth): scope queries by the signed-in user once NextAuth lands. Until
// then, all data belongs to the seeded demo user.
export const DEMO_USER_EMAIL = "demo@devstash.io";

export interface DemoUser {
  name: string | null;
  email: string;
  image: string | null;
}

/** The demo user's display fields for the sidebar footer. */
export async function getDemoUser(): Promise<DemoUser | null> {
  return prisma.user.findUnique({
    where: { email: DEMO_USER_EMAIL },
    select: { name: true, email: true, image: true },
  });
}
