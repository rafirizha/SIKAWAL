"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { initialAuthActionState } from "@/lib/forms/action-states";
import { loginAction } from "@/server/actions/auth-actions";

type LoginFormProps = {
  nextPath: string;
};

function LoginButton() {
  const { pending } = useFormStatus();

  return (
    <Button className="w-full" disabled={pending} type="submit">
      {pending ? "Masuk..." : "Masuk"}
    </Button>
  );
}

export function LoginForm({ nextPath }: LoginFormProps) {
  const [state, formAction] = useActionState(
    loginAction,
    initialAuthActionState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input name="next" type="hidden" value={nextPath} />

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium" htmlFor="email">
          Email
        </label>
        <input
          autoComplete="email"
          className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          id="email"
          name="email"
          required
          type="email"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium" htmlFor="password">
          Password
        </label>
        <input
          autoComplete="current-password"
          className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          id="password"
          name="password"
          required
          type="password"
        />
      </div>

      {state.message ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {state.message}
        </div>
      ) : null}

      <LoginButton />
    </form>
  );
}
