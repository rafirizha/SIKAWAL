"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
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

type FieldErrorProps = {
  errors?: string[];
};

function FieldError({ errors }: FieldErrorProps) {
  if (!errors?.length) {
    return null;
  }

  return <p className="text-sm text-destructive">{errors[0]}</p>;
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
          <input
            className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            id="subject"
            name="subject"
            required
            type="text"
          />
          <FieldError errors={state.fieldErrors?.subject} />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" htmlFor="recipient">
            Tujuan
          </label>
          <input
            className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            id="recipient"
            name="recipient"
            required
            type="text"
          />
          <FieldError errors={state.fieldErrors?.recipient} />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" htmlFor="letterDate">
            Tanggal Naskah
          </label>
          <input
            className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            id="letterDate"
            name="letterDate"
            required
            type="date"
          />
          <FieldError errors={state.fieldErrors?.letterDate} />
        </div>

        {teamOptions.length ? (
          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-sm font-medium" htmlFor="teamId">
              Tim/Unit
            </label>
            <select
              className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              id="teamId"
              name="teamId"
              required
            >
              <option value="">Pilih tim/unit</option>
              {teamOptions.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
            <FieldError errors={state.fieldErrors?.teamId} />
          </div>
        ) : null}

        <div className="flex flex-col gap-2 md:col-span-2">
          <label className="text-sm font-medium" htmlFor="googleDocUrl">
            Link Google Docs
          </label>
          <input
            className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            id="googleDocUrl"
            name="googleDocUrl"
            placeholder="https://docs.google.com/document/d/..."
            type="url"
          />
          <FieldError errors={state.fieldErrors?.googleDocUrl} />
        </div>

        <div className="flex flex-col gap-2 md:col-span-2">
          <label className="text-sm font-medium" htmlFor="initialDocument">
            Dokumen Awal
          </label>
          <input
            accept=".docx,.pdf,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="rounded-md border bg-background px-3 py-2 text-sm outline-none file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-secondary-foreground focus:ring-2 focus:ring-ring"
            id="initialDocument"
            name="initialDocument"
            type="file"
          />
          <FieldError errors={state.fieldErrors?.initialDocument} />
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

      <SubmitButtons />
    </form>
  );
}
