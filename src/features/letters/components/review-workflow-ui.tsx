"use client";

import Link from "next/link";
import { ExternalLink, Eye, FileText, Inbox, UploadCloud } from "lucide-react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ReviewQueueItem = {
  id: string;
  subject: string;
  recipient: string;
  letterDate: string;
  status: string;
  revisionRound: number;
  googleDocUrl: string | null;
  storedDocumentLabel: string | null;
  storedDocumentMeta: string | null;
  storedDocumentUrl: string | null;
  correctionNoteLabel?: string | null;
  correctionNote?: string | null;
  creatorName: string;
  teamName: string;
  updatedAt: string;
};

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

type QueueHeaderProps = {
  count: number;
  description: string;
  title: string;
};

type EmptyWorkflowStateProps = {
  description: string;
  title: string;
};

type LetterSummaryProps<TLetter extends ReviewQueueItem> = {
  letter: TLetter;
  roundLabel: string;
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
  if (!message) {
    return null;
  }

  return (
    <div
      aria-live="polite"
      className={cn(
        "rounded-md border px-4 py-3 text-sm",
        status === "success"
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-red-200 bg-red-50 text-red-800",
      )}
      role={status === "error" ? "alert" : "status"}
    >
      {message}
    </div>
  );
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

export function QueueHeader({ count, description, title }: QueueHeaderProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
      <span className="inline-flex w-fit items-center rounded-md bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground">
        {count} dokumen
      </span>
    </div>
  );
}

export function EmptyWorkflowState({
  description,
  title,
}: EmptyWorkflowStateProps) {
  return (
    <section className="rounded-lg border bg-card px-5 py-8 text-center">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
        <Inbox className="h-5 w-5" aria-hidden="true" />
      </div>
      <h2 className="mt-4 text-lg font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </section>
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

export function LetterSummary<TLetter extends ReviewQueueItem>({
  letter,
  roundLabel,
}: LetterSummaryProps<TLetter>) {
  return (
    <>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="min-w-0 break-words text-sm font-medium text-muted-foreground">
              {letter.teamName}
            </p>
            <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
              {letter.status}
            </span>
          </div>
          <h3 className="mt-2 break-words text-xl font-semibold leading-7">
            {letter.subject}
          </h3>
          <dl className="mt-4 grid gap-x-6 gap-y-3 text-sm text-muted-foreground sm:grid-cols-2 lg:grid-cols-4">
            <div className="min-w-0">
              <dt className="font-medium text-foreground">Penyusun</dt>
              <dd className="mt-1 break-words">{letter.creatorName}</dd>
            </div>
            <div className="min-w-0">
              <dt className="font-medium text-foreground">Tujuan</dt>
              <dd className="mt-1 break-words">{letter.recipient}</dd>
            </div>
            <div>
              <dt className="font-medium text-foreground">Tanggal Naskah</dt>
              <dd className="mt-1">{formatDate(letter.letterDate)}</dd>
            </div>
            <div>
              <dt className="font-medium text-foreground">Update</dt>
              <dd className="mt-1">{formatDateTime(letter.updatedAt)}</dd>
            </div>
          </dl>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <span className="rounded-md bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground">
            {roundLabel}
          </span>
          <Button asChild size="sm" variant="outline">
            <Link href={`/letters/${letter.id}`}>
              <Eye className="h-4 w-4" aria-hidden="true" />
              Detail
            </Link>
          </Button>
          {letter.storedDocumentUrl ? (
            <Button asChild size="sm" variant="outline">
              <a
                href={letter.storedDocumentUrl}
                rel="noreferrer"
                target="_blank"
                title={letter.storedDocumentMeta ?? undefined}
              >
                <FileText className="h-4 w-4" aria-hidden="true" />
                {letter.storedDocumentLabel ?? "Unduh Dokumen"}
              </a>
            </Button>
          ) : null}
          {letter.googleDocUrl ? (
            <Button asChild size="sm" variant="outline">
              <a href={letter.googleDocUrl} rel="noreferrer" target="_blank">
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                Google Docs
              </a>
            </Button>
          ) : !letter.storedDocumentUrl ? (
            <span className="rounded-md border px-3 py-2 text-sm text-muted-foreground">
              Dokumen kerja kosong
            </span>
          ) : null}
          {letter.storedDocumentMeta ? (
            <span className="w-full text-right text-xs leading-5 text-muted-foreground">
              {letter.storedDocumentMeta}
            </span>
          ) : null}
        </div>
      </div>

      {letter.correctionNote ? (
        <div className="rounded-md bg-muted/40 px-4 py-3">
          <p className="text-sm font-medium">
            {letter.correctionNoteLabel ?? "Catatan koreksi"}
          </p>
          <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">
            {letter.correctionNote}
          </p>
        </div>
      ) : null}
    </>
  );
}

export function FileInputField({
  errors,
  hint,
  id,
  label,
  name,
  required = false,
}: FileInputFieldProps) {
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
      <div className="relative">
        <UploadCloud
          className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          accept=".docx,.pdf,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          aria-describedby={describedBy || undefined}
          aria-invalid={Boolean(errors?.length)}
          className="min-h-10 w-full rounded-md border bg-background py-2 pl-9 pr-3 text-sm outline-none file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-secondary-foreground focus:ring-2 focus:ring-ring"
          id={id}
          name={name}
          required={required}
          type="file"
        />
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
