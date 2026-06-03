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
import { GENERAL_SUBDIVISION_CORRECTION_DECISION } from "@/lib/workflow/constants";
import { completeGeneralSubdivisionCorrectionAction } from "@/server/actions/general-subdivision-correction-actions";
import type { GeneralSubdivisionCorrectionQueueItem } from "@/server/queries/general-subdivision-correction-queries";

type GeneralSubdivisionQueueProps = {
  items: GeneralSubdivisionCorrectionQueueItem[];
};

function CorrectionForm({
  letter,
}: {
  letter: GeneralSubdivisionCorrectionQueueItem;
}) {
  const [state, formAction] = useActionState(
    completeGeneralSubdivisionCorrectionAction,
    initialCorrectionActionState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4 border-t pt-4">
      <input name="letterId" type="hidden" value={letter.id} />

      <div className="grid gap-4 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="flex flex-col gap-2">
          <label
            className="text-sm font-medium"
            htmlFor={`correctionDecision-${letter.id}`}
          >
            Hasil Koreksi
          </label>
          <select
            aria-describedby={`correctionDecision-${letter.id}-error`}
            aria-invalid={Boolean(state.fieldErrors?.correctionDecision)}
            className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            defaultValue=""
            id={`correctionDecision-${letter.id}`}
            name="correctionDecision"
            required
          >
            <option value="" disabled>
              Pilih hasil koreksi
            </option>
            <option
              value={GENERAL_SUBDIVISION_CORRECTION_DECISION.FORWARD_TO_HEAD}
            >
              Lanjut ke Kepala BPS
            </option>
            <option
              value={GENERAL_SUBDIVISION_CORRECTION_DECISION.REQUEST_REVISION}
            >
              Perlu Revisi Pegawai
            </option>
          </select>
          <FieldError
            errors={state.fieldErrors?.correctionDecision}
            id={`correctionDecision-${letter.id}-error`}
          />
        </div>

        <FileInputField
          errors={state.fieldErrors?.snapshotDocument}
          hint="Wajib jika meminta revisi Pegawai. Opsional saat hanya meneruskan ke Kepala BPS."
          id={`snapshotDocument-${letter.id}`}
          label="Snapshot Koreksi"
          name="snapshotDocument"
        />

        <div className="flex flex-col gap-2 md:col-span-2">
          <label className="text-sm font-medium" htmlFor={`notes-${letter.id}`}>
            Catatan
          </label>
          <textarea
            aria-describedby={`notes-${letter.id}-error`}
            aria-invalid={Boolean(state.fieldErrors?.notes)}
            className="min-h-24 resize-y rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
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
        <SubmitButton>
          <FileCheck2 className="h-4 w-4" aria-hidden="true" />
          Selesai Koreksi
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
            <CorrectionForm letter={letter} />
          </article>
        ))}
      </div>
    </section>
  );
}
