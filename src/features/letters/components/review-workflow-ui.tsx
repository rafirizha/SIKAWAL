"use client";

import { UploadCloud } from "lucide-react";
import { useState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";

type FieldErrorProps = {
  errors?: string[];
  id?: string;
};

type ActionMessageProps = {
  message: string;
  status: "idle" | "success" | "error";
};

type SubmitButtonProps = {
  children: React.ReactNode;
  pendingChildren?: React.ReactNode;
  variant?: "default" | "outline" | "secondary" | "ghost";
};

type FileInputFieldProps = {
  errors?: string[];
  hint?: string;
  id: string;
  label: string;
  name: string;
  required?: boolean;
};

export function FieldError({ errors, id }: FieldErrorProps) {
  if (!errors?.length) {
    return null;
  }

  return (
    <p className="text-sm text-destructive" id={id}>
      {errors[0]}
    </p>
  );
}

export function ActionMessage({ message, status }: ActionMessageProps) {
  return <FormMessage message={message} status={status} />;
}

export function SubmitButton({
  children,
  pendingChildren = "Memproses...",
  variant,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending} type="submit" variant={variant}>
      {pending ? pendingChildren : children}
    </Button>
  );
}

type ConfirmSubmitButtonProps = SubmitButtonProps & {
  /** Short reason shown when armed, e.g. "Ini mengubah status dokumen." */
  confirmHint?: string;
};

/**
 * Inline confirm gate for status-changing actions. First click "arms" the
 * action; the real submit only fires on the confirm click. Purely a UI guard
 * against accidental clicks; the server action remains the authority.
 */
export function ConfirmSubmitButton({
  children,
  pendingChildren,
  variant,
  confirmHint = "Tindakan ini mengubah status dokumen.",
}: ConfirmSubmitButtonProps) {
  const [armed, setArmed] = useState(false);

  if (!armed) {
    return (
      <Button onClick={() => setArmed(true)} type="button" variant={variant}>
        {children}
      </Button>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <span className="text-xs leading-5 text-muted-foreground">
        {confirmHint}
      </span>
      <Button onClick={() => setArmed(false)} type="button" variant="ghost">
        Batal
      </Button>
      <SubmitButton pendingChildren={pendingChildren} variant={variant}>
        {children}
      </SubmitButton>
    </div>
  );
}

export function formatDate(value: string) {
  const [year, month, date] = value.split("-").map(Number);

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
  }).format(new Date(year, month - 1, date));
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function FileInputField({
  errors,
  hint,
  id,
  label,
  name,
  required = false,
}: FileInputFieldProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [hint ? hintId : null, errors?.length ? errorId : null]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <label className="text-sm font-medium" htmlFor={id}>
        {label}
      </label>
      <div className="flex min-w-0 flex-wrap items-center gap-3">
        <input
          accept=".docx,.pdf,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          aria-describedby={describedBy || undefined}
          aria-invalid={Boolean(errors?.length)}
          className="peer sr-only"
          id={id}
          name={name}
          onChange={(event) =>
            setFileName(event.target.files?.[0]?.name ?? null)
          }
          required={required}
          type="file"
        />
        <label
          className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-muted peer-focus-visible:ring-2 peer-focus-visible:ring-ring"
          htmlFor={id}
        >
          <UploadCloud className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          Pilih file
        </label>
        <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
          {fileName ?? "Belum ada file dipilih"}
        </span>
      </div>
      {hint ? (
        <p className="text-xs leading-5 text-muted-foreground" id={hintId}>
          {hint}
        </p>
      ) : null}
      <FieldError errors={errors} id={errorId} />
    </div>
  );
}
