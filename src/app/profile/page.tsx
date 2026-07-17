import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { auth } from "@/auth";
import { UserAvatar } from "@/components/auth/user-avatar";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Profile — DevStash",
};

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();
  // The proxy also guards /profile, but guard here too so session.user is
  // never null when this page renders.
  if (!session?.user) {
    redirect("/sign-in?callbackUrl=/profile");
  }

  const { name, email, image } = session.user;

  return (
    <div className="mx-auto max-w-lg p-6">
      <Button variant="ghost" size="sm" className="mb-6" asChild>
        <Link href="/dashboard">
          <ArrowLeft />
          Back to dashboard
        </Link>
      </Button>

      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-center gap-4">
          <UserAvatar
            name={name}
            email={email ?? ""}
            image={image}
            size="lg"
          />
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold tracking-tight">
              {name ?? "Account"}
            </h1>
            <p className="truncate text-sm text-muted-foreground">{email}</p>
          </div>
        </div>

        <dl className="mt-6 space-y-4 border-t pt-6 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Name</dt>
            <dd className="truncate font-medium">{name ?? "—"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Email</dt>
            <dd className="truncate font-medium">{email ?? "—"}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
