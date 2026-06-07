"use client";

import { CheckCircle2, FileCheck2 } from "lucide-react";
import { useActionState } from "react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ActionMessage,
  ConfirmSubmitButton,
  FieldError,
  FileInputField,
} from "@/features/letters/components/review-workflow-ui";
import { initialCorrectionActionState } from "@/lib/forms/action-states";
import { GENERAL_SUBDIVISION_CORRECTION_DECISION } from "@/lib/workflow/constants";
import { completeGeneralSubdivisionCorrectionAction } from "@/server/actions/general-subdivision-correction-actions";
import {
  approveInternalAction,
  completeHeadCorrectionAction,
} from "@/server/actions/head-correction-actions";
import { submitRevisionAction } from "@/server/actions/revision-actions";

type LetterActionProps = {
  letterId: string;
};

function ForwardToHeadForm({ letterId }: LetterActionProps) {
  const [state, formAction] = useActionState(
    completeGeneralSubdivisionCorrectionAction,
    initialCorrectionActionState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input name="letterId" type="hidden" value={letterId} />
      <input
        name="correctionDecision"
        type="hidden"
        value={GENERAL_SUBDIVISION_CORRECTION_DECISION.FORWARD_TO_HEAD}
      />

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium" htmlFor={`forwardNotes-${letterId}`}>
          Catatan Persetujuan
        </label>
        <Textarea
          aria-describedby={`forwardNotes-${letterId}-hint forwardNotes-${letterId}-error`}
          aria-invalid={Boolean(state.fieldErrors?.notes)}
          className="min-h-20"
          id={`forwardNotes-${letterId}`}
          maxLength={1000}
          name="notes"
        />
        <p
          className="text-xs leading-5 text-muted-foreground"
          id={`forwardNotes-${letterId}-hint`}
        >
          Opsional, tercatat sebagai konteks approval Kasubbag Umum.
        </p>
        <FieldError
          errors={state.fieldErrors?.notes}
          id={`forwardNotes-${letterId}-error`}
        />
      </div>

      <ActionMessage message={state.message} status={state.status} />

      <div className="flex justify-end">
        <ConfirmSubmitButton
          confirmHint="Dokumen akan diteruskan ke Kepala BPS."
          pendingChildren="Meneruskan..."
        >
          <FileCheck2 className="h-4 w-4" aria-hidden="true" />
          Lanjut ke Kepala BPS
        </ConfirmSubmitButton>
      </div>
    </form>
  );
}

function RequestRevisionForm({ letterId }: LetterActionProps) {
  const [state, formAction] = useActionState(
    completeGeneralSubdivisionCorrectionAction,
    initialCorrectionActionState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input name="letterId" type="hidden" value={letterId} />
      <input
        name="correctionDecision"
        type="hidden"
        value={GENERAL_SUBDIVISION_CORRECTION_DECISION.REQUEST_REVISION}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <FileInputField
          errors={state.fieldErrors?.snapshotDocument}
          hint="Wajib sebagai evidence koreksi yang perlu diperbaiki Pegawai."
          id={`snapshotDocument-${letterId}`}
          label="Snapshot Koreksi"
          name="snapshotDocument"
          required
        />

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" htmlFor={`notes-${letterId}`}>
            Catatan
          </label>
          <Textarea
            aria-describedby={`notes-${letterId}-error`}
            aria-invalid={Boolean(state.fieldErrors?.notes)}
            id={`notes-${letterId}`}
            maxLength={1000}
            name="notes"
          />
          <FieldError
            errors={state.fieldErrors?.notes}
            id={`notes-${letterId}-error`}
          />
        </div>
      </div>

      <ActionMessage message={state.message} status={state.status} />

      <div className="flex justify-end">
        <ConfirmSubmitButton
          confirmHint="Dokumen dikembalikan ke Pegawai untuk direvisi."
          pendingChildren="Mengirim revisi..."
        >
          <FileCheck2 className="h-4 w-4" aria-hidden="true" />
          Minta Revisi Pegawai
        </ConfirmSubmitButton>
      </div>
    </form>
  );
}

export function GeneralSubdivisionActions({ letterId }: LetterActionProps) {
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <section className="rounded-lg border bg-muted/30 p-4">
        <h3 className="text-sm font-semibold">Teruskan ke Kepala BPS</h3>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          Dokumen layak diteruskan tanpa revisi tambahan.
        </p>
        <div className="mt-4">
          <ForwardToHeadForm letterId={letterId} />
        </div>
      </section>

      <section className="rounded-lg border bg-muted/30 p-4">
        <h3 className="text-sm font-semibold">Minta Revisi Pegawai</h3>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          Kembalikan ke Pegawai dengan snapshot koreksi.
        </p>
        <div className="mt-4">
          <RequestRevisionForm letterId={letterId} />
        </div>
      </section>
    </div>
  );
}

type RevisionActionsProps = LetterActionProps & {
  defaultGoogleDocUrl?: string | null;
};

export function RevisionActions({
  letterId,
  defaultGoogleDocUrl,
}: RevisionActionsProps) {
  const [state, formAction] = useActionState(
    submitRevisionAction,
    initialCorrectionActionState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input name="letterId" type="hidden" value={letterId} />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-2">
          <label
            className="text-sm font-medium"
            htmlFor={`revisionGoogleDocUrl-${letterId}`}
          >
            Link Google Docs Revisi
          </label>
          <Input
            aria-describedby={`revisionGoogleDocUrl-${letterId}-error`}
            aria-invalid={Boolean(state.fieldErrors?.googleDocUrl)}
            defaultValue={defaultGoogleDocUrl ?? ""}
            id={`revisionGoogleDocUrl-${letterId}`}
            name="googleDocUrl"
            placeholder="https://docs.google.com/document/d/..."
            type="url"
          />
          <FieldError
            errors={state.fieldErrors?.googleDocUrl}
            id={`revisionGoogleDocUrl-${letterId}-error`}
          />
        </div>

        <FileInputField
          errors={state.fieldErrors?.revisionDocument}
          hint="Opsional jika revisi tetap dikerjakan di link Google Docs yang sama."
          id={`revisionDocument-${letterId}`}
          label="File Revisi"
          name="revisionDocument"
        />

        <div className="flex min-w-0 flex-col gap-2 lg:col-span-2">
          <label
            className="text-sm font-medium"
            htmlFor={`changeSummary-${letterId}`}
          >
            Ringkasan Perubahan
          </label>
          <Textarea
            aria-describedby={`changeSummary-${letterId}-hint changeSummary-${letterId}-error`}
            aria-invalid={Boolean(state.fieldErrors?.changeSummary)}
            id={`changeSummary-${letterId}`}
            maxLength={1000}
            name="changeSummary"
            required
          />
          <p
            className="text-xs leading-5 text-muted-foreground"
            id={`changeSummary-${letterId}-hint`}
          >
            Wajib diisi sebagai bukti apa saja yang sudah diperbaiki.
          </p>
          <FieldError
            errors={state.fieldErrors?.changeSummary}
            id={`changeSummary-${letterId}-error`}
          />
        </div>
      </div>

      <ActionMessage message={state.message} status={state.status} />

      <div className="flex justify-end">
        <ConfirmSubmitButton
          confirmHint="Hasil revisi dikirim kembali ke pemeriksa."
          pendingChildren="Mengirim revisi..."
        >
          <FileCheck2 className="h-4 w-4" aria-hidden="true" />
          Kirim Revisi
        </ConfirmSubmitButton>
      </div>
    </form>
  );
}

function HeadCorrectionForm({ letterId }: LetterActionProps) {
  const [state, formAction] = useActionState(
    completeHeadCorrectionAction,
    initialCorrectionActionState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input name="letterId" type="hidden" value={letterId} />

      <FileInputField
        errors={state.fieldErrors?.snapshotDocument}
        hint="Wajib jika export otomatis tidak aktif atau gagal."
        id={`headSnapshotDocument-${letterId}`}
        label="Snapshot Koreksi Kepala BPS"
        name="snapshotDocument"
      />

      <div className="flex min-w-0 flex-col gap-2">
        <label
          className="text-sm font-medium"
          htmlFor={`headCorrectionNotes-${letterId}`}
        >
          Catatan Koreksi
        </label>
        <Textarea
          aria-describedby={`headCorrectionNotes-${letterId}-error`}
          aria-invalid={Boolean(state.fieldErrors?.notes)}
          id={`headCorrectionNotes-${letterId}`}
          maxLength={1000}
          name="notes"
        />
        <FieldError
          errors={state.fieldErrors?.notes}
          id={`headCorrectionNotes-${letterId}-error`}
        />
      </div>

      <ActionMessage message={state.message} status={state.status} />

      <div className="flex justify-end">
        <ConfirmSubmitButton
          confirmHint="Dokumen dikembalikan untuk direvisi."
          pendingChildren="Menyimpan koreksi..."
        >
          <FileCheck2 className="h-4 w-4" aria-hidden="true" />
          Minta Revisi
        </ConfirmSubmitButton>
      </div>
    </form>
  );
}

function ApproveInternalForm({ letterId }: LetterActionProps) {
  const [state, formAction] = useActionState(
    approveInternalAction,
    initialCorrectionActionState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input name="letterId" type="hidden" value={letterId} />

      <div className="flex min-w-0 flex-col gap-2">
        <label
          className="text-sm font-medium"
          htmlFor={`approveInternalNotes-${letterId}`}
        >
          Catatan Persetujuan
        </label>
        <Textarea
          aria-describedby={`approveInternalNotes-${letterId}-hint approveInternalNotes-${letterId}-error`}
          aria-invalid={Boolean(state.fieldErrors?.notes)}
          className="min-h-20"
          id={`approveInternalNotes-${letterId}`}
          maxLength={1000}
          name="notes"
        />
        <p
          className="text-xs leading-5 text-muted-foreground"
          id={`approveInternalNotes-${letterId}-hint`}
        >
          Opsional, tercatat di audit sebagai konteks persetujuan.
        </p>
        <FieldError
          errors={state.fieldErrors?.notes}
          id={`approveInternalNotes-${letterId}-error`}
        />
      </div>

      <ActionMessage message={state.message} status={state.status} />

      <div className="flex justify-end">
        <ConfirmSubmitButton
          confirmHint="Naskah disetujui internal dan siap difinalisasi."
          pendingChildren="Menyetujui..."
          variant="outline"
        >
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          Setujui Internal
        </ConfirmSubmitButton>
      </div>
    </form>
  );
}

export function HeadCorrectionActions({ letterId }: LetterActionProps) {
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <section className="rounded-lg border bg-muted/30 p-4">
        <h3 className="text-sm font-semibold">Minta Revisi</h3>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          Gunakan jika Kepala BPS masih memberi koreksi akhir.
        </p>
        <div className="mt-4">
          <HeadCorrectionForm letterId={letterId} />
        </div>
      </section>

      <section className="rounded-lg border bg-muted/30 p-4">
        <h3 className="text-sm font-semibold">Setujui Internal</h3>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          Gunakan jika dokumen sudah layak difinalisasi.
        </p>
        <div className="mt-4">
          <ApproveInternalForm letterId={letterId} />
        </div>
      </section>
    </div>
  );
}
