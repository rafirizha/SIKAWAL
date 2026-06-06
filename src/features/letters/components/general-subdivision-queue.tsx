"use client";

import { FileCheck2 } from "lucide-react";
import { useActionState } from "react";

import { Textarea } from "@/components/ui/textarea";
import {
  ActionMessage,
  FieldError,
  FileInputField,
  LetterSummary,
  QueueHeader,
  SubmitButton,
} from "@/features/letters/components/review-workflow-ui";
import { initialCorrectionActionState } from "@/lib/forms/action-states";
import { GENERAL_SUBDIVISION_CORRECTION_DECISION } from "@/lib/workflow/constants";
import { completeGeneralSubdivisionCorrectionAction } from "@/server/actions/general-subdivision-correction-actions";
import type { GeneralSubdivisionCorrectionQueueItem } from "@/server/queries/general-subdivision-correction-queries";

type GeneralSubdivisionQueueProps = {
  items: GeneralSubdivisionCorrectionQueueItem[];
};

function ForwardToHeadForm({
  letter,
}: {
  letter: GeneralSubdivisionCorrectionQueueItem;
}) {
  const [state, formAction] = useActionState(
    completeGeneralSubdivisionCorrectionAction,
    initialCorrectionActionState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input name="letterId" type="hidden" value={letter.id} />
      <input
        name="correctionDecision"
        type="hidden"
        value={GENERAL_SUBDIVISION_CORRECTION_DECISION.FORWARD_TO_HEAD}
      />

      <div className="flex flex-col gap-2">
        <label
          className="text-sm font-medium"
          htmlFor={`forwardNotes-${letter.id}`}
        >
          Catatan Persetujuan
        </label>
        <Textarea
          aria-describedby={`forwardNotes-${letter.id}-hint forwardNotes-${letter.id}-error`}
          aria-invalid={Boolean(state.fieldErrors?.notes)}
          className="min-h-20"
          id={`forwardNotes-${letter.id}`}
          maxLength={1000}
          name="notes"
        />
        <p
          className="text-xs leading-5 text-muted-foreground"
          id={`forwardNotes-${letter.id}-hint`}
        >
          Opsional, tercatat sebagai konteks approval Kasubbag Umum.
        </p>
        <FieldError
          errors={state.fieldErrors?.notes}
          id={`forwardNotes-${letter.id}-error`}
        />
      </div>

      <ActionMessage message={state.message} status={state.status} />

      <div className="flex justify-end">
        <SubmitButton pendingChildren="Meneruskan...">
          <FileCheck2 className="h-4 w-4" aria-hidden="true" />
          Lanjut ke Kepala BPS
        </SubmitButton>
      </div>
    </form>
  );
}

function RequestRevisionForm({
  letter,
}: {
  letter: GeneralSubdivisionCorrectionQueueItem;
}) {
  const [state, formAction] = useActionState(
    completeGeneralSubdivisionCorrectionAction,
    initialCorrectionActionState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input name="letterId" type="hidden" value={letter.id} />
      <input
        name="correctionDecision"
        type="hidden"
        value={GENERAL_SUBDIVISION_CORRECTION_DECISION.REQUEST_REVISION}
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <FileInputField
          errors={state.fieldErrors?.snapshotDocument}
          hint="Wajib sebagai evidence koreksi yang perlu diperbaiki Pegawai."
          id={`snapshotDocument-${letter.id}`}
          label="Snapshot Koreksi"
          name="snapshotDocument"
          required
        />

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" htmlFor={`notes-${letter.id}`}>
            Catatan
          </label>
          <Textarea
            aria-describedby={`notes-${letter.id}-error`}
            aria-invalid={Boolean(state.fieldErrors?.notes)}
            id={`notes-${letter.id}`}
            maxLength={1000}
            name="notes"
          />
          <FieldError
            errors={state.fieldErrors?.notes}
            id={`notes-${letter.id}-error`}
          />
        </div>
      </div>

      <ActionMessage message={state.message} status={state.status} />

      <div className="flex justify-end">
        <SubmitButton pendingChildren="Mengirim revisi...">
          <FileCheck2 className="h-4 w-4" aria-hidden="true" />
          Minta Revisi Pegawai
        </SubmitButton>
      </div>
    </form>
  );
}

export function GeneralSubdivisionQueue({
  items,
}: GeneralSubdivisionQueueProps) {
  if (!items.length) {
    return null;
  }

  return (
    <section className="flex flex-col gap-4">
      <QueueHeader
        count={items.length}
        description="Periksa dokumen kerja, simpan snapshot koreksi, lalu tentukan apakah perlu revisi atau lanjut ke Kepala BPS."
        title="Antrean Kasubbag Umum"
      />

      <div className="grid gap-4">
        {items.map((letter) => (
          <article
            className="flex flex-col gap-4 rounded-lg border bg-card p-5"
            key={letter.id}
          >
            <LetterSummary
              letter={letter}
              roundLabel={`Putaran ${letter.revisionRound + 1}`}
            />
            <div className="grid gap-3 border-t pt-4 lg:grid-cols-2">
              <section className="rounded-md border bg-emerald-50/50 p-4">
                <h4 className="text-sm font-semibold text-emerald-900">
                  Approve Kasubbag
                </h4>
                <p className="mt-1 text-xs leading-5 text-emerald-800">
                  Dokumen layak diteruskan ke Kepala BPS.
                </p>
                <div className="mt-4">
                  <ForwardToHeadForm letter={letter} />
                </div>
              </section>

              <section className="rounded-md border bg-background p-4">
                <h4 className="text-sm font-semibold">Minta Revisi</h4>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Dokumen perlu dikembalikan ke Pegawai dengan snapshot koreksi.
                </p>
                <div className="mt-4">
                  <RequestRevisionForm letter={letter} />
                </div>
              </section>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
