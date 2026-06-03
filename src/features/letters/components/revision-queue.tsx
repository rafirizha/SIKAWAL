"use client";

import { FileCheck2 } from "lucide-react";
import { useActionState } from "react";

import {
  ActionMessage,
  FieldError,
  FileInputField,
  LetterSummary,
  QueueHeader,
  SubmitButton,
} from "@/features/letters/components/review-workflow-ui";
import { initialCorrectionActionState } from "@/lib/forms/action-states";
import { submitRevisionAction } from "@/server/actions/revision-actions";
import type { ReviewWorkflowQueueItem } from "@/server/queries/review-workflow-queries";

type RevisionQueueProps = {
  items: ReviewWorkflowQueueItem[];
};

function RevisionForm({ letter }: { letter: ReviewWorkflowQueueItem }) {
  const [state, formAction] = useActionState(
    submitRevisionAction,
    initialCorrectionActionState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4 border-t pt-4">
      <input name="letterId" type="hidden" value={letter.id} />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-2">
          <label
            className="text-sm font-medium"
            htmlFor={`revisionGoogleDocUrl-${letter.id}`}
          >
            Link Google Docs Revisi
          </label>
          <input
            aria-describedby={`revisionGoogleDocUrl-${letter.id}-error`}
            aria-invalid={Boolean(state.fieldErrors?.googleDocUrl)}
            className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            defaultValue={letter.googleDocUrl ?? ""}
            id={`revisionGoogleDocUrl-${letter.id}`}
            name="googleDocUrl"
            placeholder="https://docs.google.com/document/d/..."
            type="url"
          />
          <FieldError
            errors={state.fieldErrors?.googleDocUrl}
            id={`revisionGoogleDocUrl-${letter.id}-error`}
          />
        </div>

        <FileInputField
          errors={state.fieldErrors?.revisionDocument}
          hint="Opsional jika revisi tetap dikerjakan di link Google Docs yang sama."
          id={`revisionDocument-${letter.id}`}
          label="File Revisi"
          name="revisionDocument"
        />

        <div className="flex min-w-0 flex-col gap-2 md:col-span-2">
          <label
            className="text-sm font-medium"
            htmlFor={`changeSummary-${letter.id}`}
          >
            Ringkasan Perubahan
          </label>
          <textarea
            aria-describedby={`changeSummary-${letter.id}-hint changeSummary-${letter.id}-error`}
            aria-invalid={Boolean(state.fieldErrors?.changeSummary)}
            className="min-h-24 resize-y rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            id={`changeSummary-${letter.id}`}
            maxLength={1000}
            name="changeSummary"
            required
          />
          <p
            className="text-xs leading-5 text-muted-foreground"
            id={`changeSummary-${letter.id}-hint`}
          >
            Wajib diisi sebagai bukti apa saja yang sudah diperbaiki.
          </p>
          <FieldError
            errors={state.fieldErrors?.changeSummary}
            id={`changeSummary-${letter.id}-error`}
          />
        </div>
      </div>

      <ActionMessage message={state.message} status={state.status} />

      <div className="flex justify-end">
        <SubmitButton pendingChildren="Mengirim revisi...">
          <FileCheck2 className="h-4 w-4" aria-hidden="true" />
          Kirim Revisi
        </SubmitButton>
      </div>
    </form>
  );
}

export function RevisionQueue({ items }: RevisionQueueProps) {
  if (!items.length) {
    return null;
  }

  return (
    <section className="flex flex-col gap-4">
      <QueueHeader
        count={items.length}
        description="Kirim hasil revisi setelah perbaikan selesai, dengan ringkasan perubahan sebagai evidence proses."
        title="Revisi Pegawai"
      />

      <div className="grid gap-4">
        {items.map((letter) => (
          <article
            className="flex flex-col gap-4 rounded-lg border bg-card p-5"
            key={letter.id}
          >
            <LetterSummary
              letter={letter}
              roundLabel={`Putaran ${letter.revisionRound}`}
            />
            <RevisionForm letter={letter} />
          </article>
        ))}
      </div>
    </section>
  );
}
