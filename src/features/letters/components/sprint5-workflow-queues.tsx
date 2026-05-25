"use client";

import {
  CheckCircle2,
  ExternalLink,
  FileCheck2,
  UploadCloud,
} from "lucide-react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { initialCorrectionActionState } from "@/lib/forms/action-states";
import {
  approveInternalAction,
  completeHeadCorrectionAction,
} from "@/server/actions/head-correction-actions";
import { submitRevisionAction } from "@/server/actions/revision-actions";
import type { Sprint5WorkflowQueueItem } from "@/server/queries/sprint5-workflow-queries";

type QueueProps = {
  items: Sprint5WorkflowQueueItem[];
};

type FieldErrorProps = {
  errors?: string[];
};

function FieldError({ errors }: FieldErrorProps) {
  if (!errors?.length) {
    return null;
  }

  return <p className="text-sm text-destructive">{errors[0]}</p>;
}

function formatDate(value: string) {
  const [year, month, date] = value.split("-").map(Number);

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
  }).format(new Date(year, month - 1, date));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function SubmitButton({
  children,
  variant,
}: {
  children: React.ReactNode;
  variant?: "default" | "outline";
}) {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending} type="submit" variant={variant}>
      {children}
    </Button>
  );
}

function LetterSummary({ letter }: { letter: Sprint5WorkflowQueueItem }) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0">
        <p className="text-sm font-medium text-muted-foreground">
          {letter.teamName}
        </p>
        <h3 className="mt-1 break-words text-xl font-semibold">
          {letter.subject}
        </h3>
        <dl className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="font-medium text-foreground">Penyusun</dt>
            <dd>{letter.creatorName}</dd>
          </div>
          <div>
            <dt className="font-medium text-foreground">Tujuan</dt>
            <dd>{letter.recipient}</dd>
          </div>
          <div>
            <dt className="font-medium text-foreground">Tanggal Naskah</dt>
            <dd>{formatDate(letter.letterDate)}</dd>
          </div>
          <div>
            <dt className="font-medium text-foreground">Update</dt>
            <dd>{formatDateTime(letter.updatedAt)}</dd>
          </div>
        </dl>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <span className="rounded-md bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground">
          Putaran {letter.revisionRound}
        </span>
        {letter.googleDocUrl ? (
          <Button asChild size="sm" variant="outline">
            <a href={letter.googleDocUrl} rel="noreferrer" target="_blank">
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              Google Docs
            </a>
          </Button>
        ) : (
          <span className="rounded-md border px-3 py-2 text-sm text-muted-foreground">
            Google Docs kosong
          </span>
        )}
      </div>
    </div>
  );
}

function ActionMessage({
  message,
  status,
}: {
  message: string;
  status: "idle" | "success" | "error";
}) {
  if (!message) {
    return null;
  }

  return (
    <div
      className={
        status === "success"
          ? "rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
          : "rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
      }
    >
      {message}
    </div>
  );
}

function RevisionForm({ letter }: { letter: Sprint5WorkflowQueueItem }) {
  const [state, formAction] = useActionState(
    submitRevisionAction,
    initialCorrectionActionState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4 border-t pt-4">
      <input name="letterId" type="hidden" value={letter.id} />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label
            className="text-sm font-medium"
            htmlFor={`revisionGoogleDocUrl-${letter.id}`}
          >
            Link Google Docs Revisi
          </label>
          <input
            className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            defaultValue={letter.googleDocUrl ?? ""}
            id={`revisionGoogleDocUrl-${letter.id}`}
            name="googleDocUrl"
            placeholder="https://docs.google.com/document/d/..."
            type="url"
          />
          <FieldError errors={state.fieldErrors?.googleDocUrl} />
        </div>

        <div className="flex flex-col gap-2">
          <label
            className="text-sm font-medium"
            htmlFor={`revisionDocument-${letter.id}`}
          >
            File Revisi
          </label>
          <div className="relative">
            <UploadCloud
              className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              accept=".docx,.pdf,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="w-full rounded-md border bg-background py-2 pl-9 pr-3 text-sm outline-none file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-secondary-foreground focus:ring-2 focus:ring-ring"
              id={`revisionDocument-${letter.id}`}
              name="revisionDocument"
              type="file"
            />
          </div>
          <FieldError errors={state.fieldErrors?.revisionDocument} />
        </div>

        <div className="flex flex-col gap-2 md:col-span-2">
          <label
            className="text-sm font-medium"
            htmlFor={`changeSummary-${letter.id}`}
          >
            Ringkasan Perubahan
          </label>
          <textarea
            className="min-h-24 resize-y rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            id={`changeSummary-${letter.id}`}
            maxLength={1000}
            name="changeSummary"
            required
          />
          <FieldError errors={state.fieldErrors?.changeSummary} />
        </div>
      </div>

      <ActionMessage message={state.message} status={state.status} />

      <div className="flex justify-end">
        <SubmitButton>
          <FileCheck2 className="h-4 w-4" aria-hidden="true" />
          Kirim Revisi
        </SubmitButton>
      </div>
    </form>
  );
}

function HeadCorrectionForm({ letter }: { letter: Sprint5WorkflowQueueItem }) {
  const [state, formAction] = useActionState(
    completeHeadCorrectionAction,
    initialCorrectionActionState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4 border-t pt-4">
      <input name="letterId" type="hidden" value={letter.id} />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label
            className="text-sm font-medium"
            htmlFor={`headSnapshotDocument-${letter.id}`}
          >
            Snapshot Koreksi Kepala BPS
          </label>
          <div className="relative">
            <UploadCloud
              className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              accept=".docx,.pdf,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="w-full rounded-md border bg-background py-2 pl-9 pr-3 text-sm outline-none file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-secondary-foreground focus:ring-2 focus:ring-ring"
              id={`headSnapshotDocument-${letter.id}`}
              name="snapshotDocument"
              type="file"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Wajib jika export otomatis tidak aktif.
          </p>
          <FieldError errors={state.fieldErrors?.snapshotDocument} />
        </div>

        <div className="flex flex-col gap-2">
          <label
            className="text-sm font-medium"
            htmlFor={`headCorrectionNotes-${letter.id}`}
          >
            Catatan Koreksi
          </label>
          <textarea
            className="min-h-24 resize-y rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            id={`headCorrectionNotes-${letter.id}`}
            maxLength={1000}
            name="notes"
          />
          <FieldError errors={state.fieldErrors?.notes} />
        </div>
      </div>

      <ActionMessage message={state.message} status={state.status} />

      <div className="flex justify-end">
        <SubmitButton>
          <FileCheck2 className="h-4 w-4" aria-hidden="true" />
          Minta Revisi
        </SubmitButton>
      </div>
    </form>
  );
}

function ApproveInternalForm({ letter }: { letter: Sprint5WorkflowQueueItem }) {
  const [state, formAction] = useActionState(
    approveInternalAction,
    initialCorrectionActionState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4 border-t pt-4">
      <input name="letterId" type="hidden" value={letter.id} />

      <div className="flex flex-col gap-2">
        <label
          className="text-sm font-medium"
          htmlFor={`approveInternalNotes-${letter.id}`}
        >
          Catatan Persetujuan
        </label>
        <textarea
          className="min-h-20 resize-y rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          id={`approveInternalNotes-${letter.id}`}
          maxLength={1000}
          name="notes"
        />
        <FieldError errors={state.fieldErrors?.notes} />
      </div>

      <ActionMessage message={state.message} status={state.status} />

      <div className="flex justify-end">
        <SubmitButton variant="outline">
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          Setujui Internal
        </SubmitButton>
      </div>
    </form>
  );
}

export function RevisionQueue({ items }: QueueProps) {
  if (!items.length) {
    return null;
  }

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold">Revisi Pegawai</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {items.length} dokumen membutuhkan hasil revisi.
        </p>
      </div>

      <div className="grid gap-4">
        {items.map((letter) => (
          <article
            className="flex flex-col gap-4 rounded-lg border bg-card p-5"
            key={letter.id}
          >
            <LetterSummary letter={letter} />
            <RevisionForm letter={letter} />
          </article>
        ))}
      </div>
    </section>
  );
}

export function HeadCorrectionQueue({ items }: QueueProps) {
  if (!items.length) {
    return null;
  }

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold">Antrean Kepala BPS</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {items.length} dokumen menunggu koreksi atau persetujuan internal.
        </p>
      </div>

      <div className="grid gap-4">
        {items.map((letter) => (
          <article
            className="flex flex-col gap-4 rounded-lg border bg-card p-5"
            key={letter.id}
          >
            <LetterSummary letter={letter} />
            <HeadCorrectionForm letter={letter} />
            <ApproveInternalForm letter={letter} />
          </article>
        ))}
      </div>
    </section>
  );
}
