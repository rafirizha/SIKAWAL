"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  FieldError,
  FileInputField,
} from "@/features/letters/components/review-workflow-ui";
import { initialDraftActionState } from "@/lib/forms/action-states";
import { createDraftLetterAction } from "@/server/actions/draft-letter-actions";

export type DraftTeamOption = {
  id: string;
  name: string;
};

type DraftLetterFormProps = {
  teamOptions?: DraftTeamOption[];
};

function SubmitButtons() {
  const { pending } = useFormStatus();

  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
      <Button
        disabled={pending}
        name="submitAfterCreate"
        type="submit"
        value="false"
        variant="secondary"
      >
        {pending ? "Memproses..." : "Simpan Draft"}
      </Button>
      <Button
        disabled={pending}
        name="submitAfterCreate"
        type="submit"
        value="true"
      >
        {pending ? "Memproses..." : "Ajukan ke Kasubbag Umum"}
      </Button>
    </div>
  );
}

export function DraftLetterForm({ teamOptions = [] }: DraftLetterFormProps) {
  const [state, formAction] = useActionState(
    createDraftLetterAction,
    initialDraftActionState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="grid gap-5 md:grid-cols-2">
        <div className="flex flex-col gap-2 md:col-span-2">
          <label className="text-sm font-medium" htmlFor="subject">
            Perihal
          </label>
          <Input id="subject" name="subject" required type="text" />
          <FieldError errors={state.fieldErrors?.subject} />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" htmlFor="recipient">
            Tujuan
          </label>
          <Input id="recipient" name="recipient" required type="text" />
          <FieldError errors={state.fieldErrors?.recipient} />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" htmlFor="letterDate">
            Tanggal Naskah
          </label>
          <Input id="letterDate" name="letterDate" required type="date" />
          <FieldError errors={state.fieldErrors?.letterDate} />
        </div>

        {teamOptions.length ? (
          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-sm font-medium" htmlFor="teamId">
              Tim/Unit
            </label>
            <Select id="teamId" name="teamId" required>
              <option value="">Pilih tim/unit</option>
              {teamOptions.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </Select>
            <FieldError errors={state.fieldErrors?.teamId} />
          </div>
        ) : null}

        <div className="flex flex-col gap-2 md:col-span-2">
          <label className="text-sm font-medium" htmlFor="googleDocUrl">
            Link Google Docs
          </label>
          <Input
            id="googleDocUrl"
            name="googleDocUrl"
            placeholder="https://docs.google.com/document/d/..."
            type="url"
          />
          <FieldError errors={state.fieldErrors?.googleDocUrl} />
        </div>

        <div className="md:col-span-2">
          <FileInputField
            errors={state.fieldErrors?.initialDocument}
            id="initialDocument"
            label="Dokumen Awal"
            name="initialDocument"
          />
        </div>
      </div>

      <FormMessage message={state.message} status={state.status} />

      <SubmitButtons />
    </form>
  );
}
