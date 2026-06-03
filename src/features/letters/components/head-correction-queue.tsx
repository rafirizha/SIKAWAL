"use client";

import { CheckCircle2, FileCheck2 } from "lucide-react";
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
import {
  approveInternalAction,
  completeHeadCorrectionAction,
} from "@/server/actions/head-correction-actions";
import type { ReviewWorkflowQueueItem } from "@/server/queries/review-workflow-queries";

type HeadCorrectionQueueProps = {
  items: ReviewWorkflowQueueItem[];
};

function HeadCorrectionForm({ letter }: { letter: ReviewWorkflowQueueItem }) {
  const [state, formAction] = useActionState(
    completeHeadCorrectionAction,
    initialCorrectionActionState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input name="letterId" type="hidden" value={letter.id} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <FileInputField
          errors={state.fieldErrors?.snapshotDocument}
          hint="Wajib jika export otomatis tidak aktif atau gagal."
          id={`headSnapshotDocument-${letter.id}`}
          label="Snapshot Koreksi Kepala BPS"
          name="snapshotDocument"
        />

        <div className="flex min-w-0 flex-col gap-2">
          <label
            className="text-sm font-medium"
            htmlFor={`headCorrectionNotes-${letter.id}`}
          >
            Catatan Koreksi
          </label>
          <textarea
            aria-describedby={`headCorrectionNotes-${letter.id}-error`}
            aria-invalid={Boolean(state.fieldErrors?.notes)}
            className="min-h-24 resize-y rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            id={`headCorrectionNotes-${letter.id}`}
            maxLength={1000}
            name="notes"
          />
          <FieldError
            errors={state.fieldErrors?.notes}
            id={`headCorrectionNotes-${letter.id}-error`}
          />
        </div>
      </div>

      <ActionMessage message={state.message} status={state.status} />

      <div className="flex justify-end">
        <SubmitButton pendingChildren="Menyimpan koreksi...">
          <FileCheck2 className="h-4 w-4" aria-hidden="true" />
          Minta Revisi
        </SubmitButton>
      </div>
    </form>
  );
}

function ApproveInternalForm({ letter }: { letter: ReviewWorkflowQueueItem }) {
  const [state, formAction] = useActionState(
    approveInternalAction,
    initialCorrectionActionState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input name="letterId" type="hidden" value={letter.id} />

      <div className="flex min-w-0 flex-col gap-2">
        <label
          className="text-sm font-medium"
          htmlFor={`approveInternalNotes-${letter.id}`}
        >
          Catatan Persetujuan
        </label>
        <textarea
          aria-describedby={`approveInternalNotes-${letter.id}-hint approveInternalNotes-${letter.id}-error`}
          aria-invalid={Boolean(state.fieldErrors?.notes)}
          className="min-h-20 resize-y rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          id={`approveInternalNotes-${letter.id}`}
          maxLength={1000}
          name="notes"
        />
        <p
          className="text-xs leading-5 text-muted-foreground"
          id={`approveInternalNotes-${letter.id}-hint`}
        >
          Opsional, tercatat di audit sebagai konteks persetujuan.
        </p>
        <FieldError
          errors={state.fieldErrors?.notes}
          id={`approveInternalNotes-${letter.id}-error`}
        />
      </div>

      <ActionMessage message={state.message} status={state.status} />

      <div className="flex justify-end">
        <SubmitButton pendingChildren="Menyetujui..." variant="outline">
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          Setujui Internal
        </SubmitButton>
      </div>
    </form>
  );
}

export function HeadCorrectionQueue({ items }: HeadCorrectionQueueProps) {
  if (!items.length) {
    return null;
  }

  return (
    <section className="flex flex-col gap-4">
      <QueueHeader
        count={items.length}
        description="Pilih minta revisi jika masih ada koreksi, atau setujui internal jika naskah sudah layak masuk tahap final."
        title="Antrean Kepala BPS"
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
            <div className="grid gap-3 lg:grid-cols-2">
              <details className="rounded-md border bg-background p-4" open>
                <summary className="cursor-pointer text-sm font-semibold">
                  Minta Revisi
                </summary>
                <div className="mt-4">
                  <HeadCorrectionForm letter={letter} />
                </div>
              </details>
              <details className="rounded-md border bg-background p-4">
                <summary className="cursor-pointer text-sm font-semibold">
                  Setujui Internal
                </summary>
                <div className="mt-4">
                  <ApproveInternalForm letter={letter} />
                </div>
              </details>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
