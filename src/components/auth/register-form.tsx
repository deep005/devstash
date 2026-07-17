"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerSchema } from "@/lib/auth-schemas";

type FieldName = "name" | "email" | "password" | "confirmPassword";

interface FieldConfig {
  name: FieldName;
  label: string;
  type: string;
  autoComplete: string;
  placeholder?: string;
}

const FIELDS: FieldConfig[] = [
  {
    name: "name",
    label: "Name",
    type: "text",
    autoComplete: "name",
    placeholder: "Ada Lovelace",
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    autoComplete: "email",
    placeholder: "you@example.com",
  },
  {
    name: "password",
    label: "Password",
    type: "password",
    autoComplete: "new-password",
  },
  {
    name: "confirmPassword",
    label: "Confirm password",
    type: "password",
    autoComplete: "new-password",
  },
];

interface RegisterFormState {
  fieldErrors: Partial<Record<FieldName, string>>;
  formError: string | null;
}

const INITIAL_STATE: RegisterFormState = { fieldErrors: {}, formError: null };

/**
 * Registration form. Validates with the shared registerSchema, then submits
 * to POST /api/auth/register (per the spec — the endpoint already existed
 * from auth phase 2) and redirects to /sign-in on success.
 */
export function RegisterForm() {
  const router = useRouter();
  const [state, setState] = React.useState<RegisterFormState>(INITIAL_STATE);
  const [isPending, setIsPending] = React.useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = registerSchema.safeParse(
      Object.fromEntries(new FormData(event.currentTarget)),
    );
    if (!parsed.success) {
      const { fieldErrors } = z.flattenError(parsed.error);
      setState({
        fieldErrors: {
          name: fieldErrors.name?.[0],
          email: fieldErrors.email?.[0],
          password: fieldErrors.password?.[0],
          confirmPassword: fieldErrors.confirmPassword?.[0],
        },
        formError: null,
      });
      return;
    }

    setState(INITIAL_STATE);
    setIsPending(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (response.status === 201) {
        // Keep the pending state through the navigation.
        router.push("/sign-in?registered=1");
        return;
      }
      const body: { error?: string } = await response.json().catch(() => ({}));
      setState({
        fieldErrors: {},
        formError: body.error ?? "Registration failed. Please try again.",
      });
    } catch {
      setState({
        fieldErrors: {},
        formError: "Registration failed. Please try again.",
      });
    }
    setIsPending(false);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {state.formError && (
        <p
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {state.formError}
        </p>
      )}
      {FIELDS.map((field) => {
        const error = state.fieldErrors[field.name];
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>{field.label}</Label>
            <Input
              id={field.name}
              name={field.name}
              type={field.type}
              autoComplete={field.autoComplete}
              placeholder={field.placeholder}
              aria-invalid={error ? true : undefined}
              required
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        );
      })}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
