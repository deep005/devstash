import type { Metadata } from "next";
import Link from "next/link";

import { signInWithGitHub } from "@/actions/auth";
import { GitHubIcon } from "@/components/auth/github-icon";
import { SignInForm } from "@/components/auth/sign-in-form";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Sign in — DevStash",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

// Friendly copy for NextAuth error codes forwarded via ?error= (OAuth
// failures redirect here since this page is registered as pages.signIn).
const ERROR_MESSAGES: Record<string, string> = {
  CredentialsSignin: "Invalid email or password.",
  OAuthAccountNotLinked:
    "This email is already registered with a different sign-in method.",
  AccessDenied: "Access denied. Please use a different account.",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const callbackUrl = firstValue(params.callbackUrl);
  const registered = firstValue(params.registered) === "1";
  const verified = firstValue(params.verified) === "1";
  const errorCode = firstValue(params.error);
  const errorMessage = errorCode
    ? (ERROR_MESSAGES[errorCode] ?? "Sign-in failed. Please try again.")
    : null;

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">Sign in</h1>
        <p className="text-sm text-muted-foreground">
          Welcome back to your knowledge hub.
        </p>
      </div>

      {registered && (
        <p className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
          Account created. Check your email for a verification link, then sign
          in.
        </p>
      )}
      {verified && (
        <p className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
          Email verified. You can now sign in.
        </p>
      )}
      {errorMessage && (
        <p
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {errorMessage}
        </p>
      )}

      <SignInForm callbackUrl={callbackUrl} />

      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground uppercase">or</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <form action={signInWithGitHub}>
        <input type="hidden" name="callbackUrl" value={callbackUrl ?? ""} />
        <Button type="submit" variant="outline" className="w-full">
          <GitHubIcon className="size-4" />
          Sign in with GitHub
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Register
        </Link>
      </p>
    </div>
  );
}
