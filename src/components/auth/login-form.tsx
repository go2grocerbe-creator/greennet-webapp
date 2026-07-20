"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login, type LoginState } from "@/lib/auth/actions";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState<LoginState, FormData>(login, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      {state?.error && (
        <div
          role="alert"
          className="border-destructive/40 bg-destructive/10 text-destructive rounded-lg border p-3 text-sm"
        >
          {state.error}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          aria-required="true"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-required="true"
        />
      </div>

      <Button
        type="submit"
        data-testid="login-submit"
        disabled={isPending}
        aria-busy={isPending}
        className="mt-1"
      >
        {isPending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
