"use client";

import { Ban, FileCheck2 } from "lucide-react";
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
import {
  cancelLetterAction,
  createFinalLetterAction,
} from "@/server/actions/final-letter-actions";

type FinalLetterFormProps = {
  defaultGoogleDocUrl?: string | null;
  letterId: string;
};

type CancelLetterFormProps = {
  letterId: string;
};

export function FinalLetterForm({
  defaultGoogleDocUrl,
  letterId,
}: FinalLetterFormProps) {
  const [state, formAction] = useActionState(
    createFinalLetterAction,
    initialCorrectionActionState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input name="letterId" type="hidden" value={letterId} />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-2">
          <label
            className="text-sm font-medium"
            htmlFor={`finalGoogleDocUrl-${letterId}`}
          >
            Link Google Docs Final
          </label>
          <Input
            aria-describedby={`finalGoogleDocUrl-${letterId}-hint finalGoogleDocUrl-${letterId}-error`}
            aria-invalid={Boolean(state.fieldErrors?.googleDocUrl)}
            defaultValue={defaultGoogleDocUrl ?? ""}
            id={`finalGoogleDocUrl-${letterId}`}
            name="googleDocUrl"
            placeholder="https://docs.google.com/document/d/..."
            type="url"
          />
          <p
            className="text-xs leading-5 text-muted-foreground"
            id={`finalGoogleDocUrl-${letterId}-hint`}
          >
            Opsional jika file final sudah diupload.
          </p>
          <FieldError
            errors={state.fieldErrors?.googleDocUrl}
            id={`finalGoogleDocUrl-${letterId}-error`}
          />
        </div>

        <FileInputField
          errors={state.fieldErrors?.finalDocument}
          hint="DOCX/PDF final internal. Wajib jika tidak memakai link Google Docs final."
          id={`finalDocument-${letterId}`}
          label="File Naskah Final"
          name="finalDocument"
        />

        <div className="flex min-w-0 flex-col gap-2 md:col-span-2">
          <label
            className="text-sm font-medium"
            htmlFor={`finalSummary-${letterId}`}
          >
            Catatan Final Internal
          </label>
          <Textarea
            aria-describedby={`finalSummary-${letterId}-hint finalSummary-${letterId}-error`}
            aria-invalid={Boolean(state.fieldErrors?.finalSummary)}
            id={`finalSummary-${letterId}`}
            maxLength={1000}
            name="finalSummary"
            required
          />
          <p
            className="text-xs leading-5 text-muted-foreground"
            id={`finalSummary-${letterId}-hint`}
          >
            Wajib diisi sebagai ringkasan finalisasi internal dan evidence
            audit.
          </p>
          <FieldError
            errors={state.fieldErrors?.finalSummary}
            id={`finalSummary-${letterId}-error`}
          />
        </div>
      </div>

      <ActionMessage message={state.message} status={state.status} />

      <div className="flex justify-end">
        <ConfirmSubmitButton
          confirmHint="Versi final dikunci sebagai hasil akhir."
          pendingChildren="Membuat final..."
        >
          <FileCheck2 className="h-4 w-4" aria-hidden="true" />
          Buat Final Internal
        </ConfirmSubmitButton>
      </div>
    </form>
  );
}

export function CancelLetterForm({ letterId }: CancelLetterFormProps) {
  const [state, formAction] = useActionState(
    cancelLetterAction,
    initialCorrectionActionState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input name="letterId" type="hidden" value={letterId} />

      <div className="flex min-w-0 flex-col gap-2">
        <label
          className="text-sm font-medium"
          htmlFor={`cancelReason-${letterId}`}
        >
          Alasan Pembatalan
        </label>
        <Textarea
          aria-describedby={`cancelReason-${letterId}-hint cancelReason-${letterId}-error`}
          aria-invalid={Boolean(state.fieldErrors?.cancelReason)}
          id={`cancelReason-${letterId}`}
          maxLength={1000}
          name="cancelReason"
          required
        />
        <p
          className="text-xs leading-5 text-muted-foreground"
          id={`cancelReason-${letterId}-hint`}
        >
          Wajib diisi karena pembatalan mengubah status terminal dan masuk
          audit.
        </p>
        <FieldError
          errors={state.fieldErrors?.cancelReason}
          id={`cancelReason-${letterId}-error`}
        />
      </div>

      <ActionMessage message={state.message} status={state.status} />

      <div className="flex justify-end">
        <ConfirmSubmitButton
          confirmHint="Pembatalan bersifat terminal dan tercatat di audit."
          pendingChildren="Membatalkan..."
          variant="outline"
        >
          <Ban className="h-4 w-4 text-destructive" aria-hidden="true" />
          Batalkan Dokumen
        </ConfirmSubmitButton>
      </div>
    </form>
  );
}
