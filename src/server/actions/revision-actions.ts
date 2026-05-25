"use server";

import { revalidatePath } from "next/cache";

import { requireCurrentUser } from "@/lib/auth/current-user";
import type { CorrectionActionState } from "@/lib/forms/action-states";
import { canSubmitRevision } from "@/lib/permissions/letter-permissions";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role-client";
import {
  deleteTemporaryUpload,
  uploadLetterDocument,
  type UploadedLetterDocument,
} from "@/lib/storage/letter-document-storage";
import { parseInitialDocumentFile } from "@/lib/validation/initial-document";
import {
  getParsedRevisionGoogleDocUrl,
  submitRevisionSchema,
} from "@/lib/validation/revision";
import { getServerEnv } from "@/lib/validation/env";
import { LETTER_STATUS, SOURCE_TYPE } from "@/lib/workflow/constants";
import type { LetterStatus } from "@/types/domain";

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Terjadi kesalahan saat mengirim hasil revisi.";
}

export async function submitRevisionAction(
  _previousState: CorrectionActionState,
  formData: FormData,
): Promise<CorrectionActionState> {
  let uploadedRevision: UploadedLetterDocument | null = null;
  let shouldCleanupUploadedRevision = true;

  try {
    const currentUser = await requireCurrentUser();
    const parsedInput = submitRevisionSchema.safeParse({
      letterId: getStringValue(formData, "letterId"),
      googleDocUrl: getStringValue(formData, "googleDocUrl"),
      changeSummary: getStringValue(formData, "changeSummary"),
    });

    if (!parsedInput.success) {
      return {
        status: "error",
        message: "Input hasil revisi belum valid.",
        fieldErrors: parsedInput.error.flatten().fieldErrors,
      };
    }

    const supabase = createSupabaseServiceRoleClient();
    const { data: letter, error: letterError } = await supabase
      .from("letters")
      .select(
        "creator_user_id, team_id, status, revision_round, revision_target_role, google_doc_id, google_doc_url",
      )
      .eq("id", parsedInput.data.letterId)
      .single();

    if (letterError || !letter) {
      return {
        status: "error",
        message: "Draft revisi tidak ditemukan.",
      };
    }

    const permissionLetter = {
      creatorUserId: letter.creator_user_id,
      teamId: letter.team_id,
      status: letter.status as LetterStatus,
    };

    if (!canSubmitRevision(currentUser, permissionLetter)) {
      return {
        status: "error",
        message: "User tidak memiliki akses mengirim revisi ini.",
      };
    }

    if (permissionLetter.status !== LETTER_STATUS.NEEDS_REVISION) {
      return {
        status: "error",
        message: "Hanya draft yang membutuhkan revisi.",
      };
    }

    const env = getServerEnv();
    const revisionDocument = await parseInitialDocumentFile(
      formData.get("revisionDocument"),
      {
        maxDocxUploadMb: env.MAX_DOCX_UPLOAD_MB,
        maxPdfUploadMb: env.MAX_PDF_UPLOAD_MB,
      },
    );
    const parsedGoogleDoc = getParsedRevisionGoogleDocUrl(parsedInput.data);
    const resolvedGoogleDocId =
      parsedGoogleDoc?.googleDocId ?? letter.google_doc_id;
    const resolvedGoogleDocUrl =
      parsedGoogleDoc?.googleDocUrl ?? letter.google_doc_url;

    if (!revisionDocument && !resolvedGoogleDocUrl) {
      return {
        status: "error",
        message: "Hasil revisi wajib memiliki Google Docs atau file revisi.",
        fieldErrors: {
          googleDocUrl: ["Isi link Google Docs atau upload file revisi."],
          revisionDocument: ["Isi link Google Docs atau upload file revisi."],
        },
      };
    }

    if (revisionDocument) {
      uploadedRevision = await uploadLetterDocument({
        letterId: parsedInput.data.letterId,
        versionNumber: letter.revision_round + 1,
        file: revisionDocument.file,
        sourceType: revisionDocument.sourceType,
      });
    }

    const sourceType =
      revisionDocument?.sourceType ??
      (resolvedGoogleDocUrl ? SOURCE_TYPE.GOOGLE_DOCS : null);

    const { data, error } = await supabase.rpc("submit_letter_revision", {
      input_actor_user_id: currentUser.id,
      input_change_summary: parsedInput.data.changeSummary,
      input_checksum_sha256: uploadedRevision?.checksumSha256 ?? null,
      input_file_mime_type: uploadedRevision?.fileMimeType ?? null,
      input_file_size_bytes: uploadedRevision?.fileSizeBytes ?? null,
      input_file_url: null,
      input_google_doc_id: resolvedGoogleDocId,
      input_google_doc_url: resolvedGoogleDocUrl,
      input_letter_id: parsedInput.data.letterId,
      input_source_type: sourceType,
      input_storage_path: uploadedRevision?.storagePath ?? null,
    });

    if (error) {
      throw new Error(error.message);
    }

    shouldCleanupUploadedRevision = false;
    revalidatePath("/dashboard");

    return {
      status: "success",
      letterId: data?.[0]?.letter_id ?? parsedInput.data.letterId,
      message: "Hasil revisi berhasil dikirim.",
    };
  } catch (error) {
    if (uploadedRevision && shouldCleanupUploadedRevision) {
      try {
        await deleteTemporaryUpload(uploadedRevision.storagePath);
      } catch {
        // Cleanup storage best effort; preserve the root cause for the user.
      }
    }

    return {
      status: "error",
      message: getErrorMessage(error),
    };
  }
}
