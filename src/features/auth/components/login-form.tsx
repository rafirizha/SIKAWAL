"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { initialAuthActionState } from "@/lib/forms/action-states";
import { loginAction } from "@/server/actions/auth-actions";

type LoginFormProps = {
  nextPath: string;
};

function LoginButton() {
  const { pending } = useFormStatus();

  return (
    <Button className="w-full shadow-sm" disabled={pending} type="submit">
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
        <Input autoComplete="email" id="email" name="email" required type="email" />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium" htmlFor="password">
          Password
        </label>
        <Input
          autoComplete="current-password"
          id="password"
          name="password"
          required
          type="password"
        />
      </div>

      <FormMessage message={state.message} status={state.status} />

      <LoginButton />
    </form>
  );
}
