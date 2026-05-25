"use client";

import { ExternalLink, FileCheck2, UploadCloud } from "lucide-react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { initialCorrectionActionState } from "@/lib/forms/action-states";
import { GENERAL_SUBDIVISION_CORRECTION_DECISION } from "@/lib/workflow/constants";
import { completeGeneralSubdivisionCorrectionAction } from "@/server/actions/general-subdivision-correction-actions";
import type { GeneralSubdivisionCorrectionQueueItem } from "@/server/queries/general-subdivision-correction-queries";

type GeneralSubdivisionQueueProps = {
  items: GeneralSubdivisionCorrectionQueueItem[];
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

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending} type="submit">
      <FileCheck2 className="h-4 w-4" aria-hidden="true" />
      {pending ? "Memproses..." : "Selesai Koreksi"}
    </Button>
  );
}

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

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label
            className="text-sm font-medium"
            htmlFor={`correctionDecision-${letter.id}`}
          >
            Hasil Koreksi
          </label>
          <select
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
          <FieldError errors={state.fieldErrors?.correctionDecision} />
        </div>

        <div className="flex flex-col gap-2">
          <label
            className="text-sm font-medium"
            htmlFor={`snapshotDocument-${letter.id}`}
          >
            Snapshot Koreksi
          </label>
          <div className="relative">
            <UploadCloud
              className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              accept=".docx,.pdf,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="w-full rounded-md border bg-background py-2 pl-9 pr-3 text-sm outline-none file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-secondary-foreground focus:ring-2 focus:ring-ring"
              id={`snapshotDocument-${letter.id}`}
              name="snapshotDocument"
              type="file"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            DOCX/PDF hasil koreksi.
          </p>
          <FieldError errors={state.fieldErrors?.snapshotDocument} />
        </div>

        <div className="flex flex-col gap-2 md:col-span-2">
          <label className="text-sm font-medium" htmlFor={`notes-${letter.id}`}>
            Catatan
          </label>
          <textarea
            className="min-h-24 resize-y rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            id={`notes-${letter.id}`}
            maxLength={1000}
            name="notes"
          />
          <FieldError errors={state.fieldErrors?.notes} />
        </div>
      </div>

      {state.message ? (
        <div
          className={
            state.status === "success"
              ? "rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
              : "rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          }
        >
          {state.message}
        </div>
      ) : null}

      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}

export function GeneralSubdivisionQueue({
  items,
}: GeneralSubdivisionQueueProps) {
  if (!items.length) {
    return (
      <section className="rounded-lg border bg-card p-5">
        <h2 className="text-lg font-semibold">Antrean Kasubbag Umum</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Tidak ada dokumen yang menunggu koreksi Kasubbag Umum.
        </p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold">Antrean Kasubbag Umum</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {items.length} dokumen menunggu koreksi.
        </p>
      </div>

      <div className="grid gap-4">
        {items.map((letter) => (
          <article
            className="flex flex-col gap-4 rounded-lg border bg-card p-5"
            key={letter.id}
          >
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
                    <dt className="font-medium text-foreground">
                      Tanggal Naskah
                    </dt>
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
                  Putaran {letter.revisionRound + 1}
                </span>
                {letter.googleDocUrl ? (
                  <Button asChild size="sm" variant="outline">
                    <a
                      href={letter.googleDocUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
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

            <CorrectionForm letter={letter} />
          </article>
        ))}
      </div>
    </section>
  );
}
