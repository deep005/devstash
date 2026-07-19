import { createElement } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, BarChart3 } from "lucide-react";

import { auth } from "@/auth";
import { ChangePasswordDialog } from "@/components/profile/change-password-dialog";
import { DeleteAccountDialog } from "@/components/profile/delete-account-dialog";
import { UserAvatar } from "@/components/auth/user-avatar";
import { Button } from "@/components/ui/button";
import { getProfileData } from "@/lib/db/profile";
import { formatLongDate } from "@/lib/format";
import { getItemTypeIcon } from "@/lib/item-type-icons";

export const metadata: Metadata = {
  title: "Profile — DevStash",
};

export const dynamic = "force-dynamic";

/** "snippet" → "Snippets" for the breakdown labels. */
function typeLabel(name: string): string {
  return `${name.charAt(0).toUpperCase()}${name.slice(1)}s`;
}

export default async function ProfilePage() {
  const session = await auth();
  // The proxy also guards /profile, but guard here too so session.user is
  // never null when this page renders.
  if (!session?.user?.id) {
    redirect("/sign-in?callbackUrl=/profile");
  }

  const profile = await getProfileData(session.user.id);
  // The account no longer exists (e.g. deleted in another session) — the JWT
  // cookie is stale; send them to sign in.
  if (!profile) {
    redirect("/sign-in?callbackUrl=/profile");
  }

  const { name, email, image, createdAt, hasPassword, itemCount, collectionCount, typeBreakdown } =
    profile;

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/dashboard">
          <ArrowLeft />
          Back to dashboard
        </Link>
      </Button>

      {/* Identity + account actions */}
      <section className="rounded-xl border bg-card p-6">
        <div className="flex items-center gap-4">
          <UserAvatar name={name} email={email} image={image} size="lg" />
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
            <dd className="truncate font-medium">{email}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Member since</dt>
            <dd className="font-medium">{formatLongDate(createdAt)}</dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-wrap gap-2 border-t pt-6">
          {hasPassword && <ChangePasswordDialog />}
          <DeleteAccountDialog />
        </div>
      </section>

      {/* Usage stats */}
      <section className="rounded-xl border bg-card p-6">
        <h2 className="flex items-center gap-2 text-sm font-semibold tracking-tight">
          <BarChart3 className="size-4 text-muted-foreground" />
          Usage
        </h2>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-lg border bg-background p-4 transition-colors hover:border-foreground/20 hover:bg-muted/40">
            <p className="text-2xl font-semibold tabular-nums">{itemCount}</p>
            <p className="text-sm text-muted-foreground">
              {itemCount === 1 ? "Item" : "Items"}
            </p>
          </div>
          <div className="rounded-lg border bg-background p-4 transition-colors hover:border-foreground/20 hover:bg-muted/40">
            <p className="text-2xl font-semibold tabular-nums">
              {collectionCount}
            </p>
            <p className="text-sm text-muted-foreground">
              {collectionCount === 1 ? "Collection" : "Collections"}
            </p>
          </div>
        </div>

        <h3 className="mt-6 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          By type
        </h3>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {typeBreakdown.map((type) => (
            <li
              key={type.name}
              className="flex items-center gap-3 rounded-lg border bg-background px-3 py-2 transition-colors hover:border-foreground/20 hover:bg-muted/40"
            >
              <span
                className="flex size-8 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${type.color}1a` }}
              >
                {createElement(getItemTypeIcon(type.icon), {
                  className: "size-4",
                  style: { color: type.color },
                })}
              </span>
              <span className="flex-1 text-sm">{typeLabel(type.name)}</span>
              <span className="text-sm font-medium tabular-nums text-muted-foreground">
                {type.count}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
