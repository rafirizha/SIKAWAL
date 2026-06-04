"use server";

import { revalidatePath } from "next/cache";

import { requireCurrentUser } from "@/lib/auth/current-user";
import type { CorrectionActionState } from "@/lib/forms/action-states";
import {
  canCancelLetter,
  canCreateFinalVersion,
} from "@/lib/permissions/letter-permissions";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role-client";
import {
  deleteTemporaryUpload,
  uploadLetterDocument,
  type UploadedLetterDocument,
} from "@/lib/storage/letter-document-storage";
import { getServerEnv } from "@/lib/validation/env";
import {
  cancelLetterSchema,
  createFinalLetterSchema,
  getParsedFinalGoogleDocUrl,
} from "@/lib/validation/final-letter";
import { parseInitialDocumentFile } from "@/lib/validation/initial-document";
import { LETTER_STATUS, SOURCE_TYPE } from "@/lib/workflow/constants";
import type { LetterStatus } from "@/types/domain";

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Terjadi kesalahan saat memproses finalisasi.";
}

async function getNextVersionNumber(letterId: string) {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("letter_versions")
    .select("version_number")
    .eq("letter_id", letterId)
    .order("version_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error("Versi terakhir belum bisa dibaca.");
  }

  if (!data) {
    throw new Error("Versi sebelumnya tidak ditemukan.");
  }

  return data.version_number + 1;
}

export async function createFinalLetterAction(
  _previousState: CorrectionActionState,
  formData: FormData,
): Promise<CorrectionActionState> {
  let uploadedFinalDocument: UploadedLetterDocument | null = null;
  let shouldCleanupUploadedFinalDocument = true;

  try {
    const currentUser = await requireCurrentUser();
    const parsedInput = createFinalLetterSchema.safeParse({
      letterId: getStringValue(formData, "letterId"),
      googleDocUrl: getStringValue(formData, "googleDocUrl"),
      finalSummary: getStringValue(formData, "finalSummary"),
    });

    if (!parsedInput.success) {
      return {
        status: "error",
        message: "Input finalisasi belum valid.",
        fieldErrors: parsedInput.error.flatten().fieldErrors,
      };
    }

    const supabase = createSupabaseServiceRoleClient();
    const { data: letter, error: letterError } = await supabase
      .from("letters")
      .select("creator_user_id, team_id, status")
      .eq("id", parsedInput.data.letterId)
      .single();

    if (letterError || !letter) {
      return {
        status: "error",
        message: "Draft final tidak ditemukan.",
      };
    }

    const permissionLetter = {
      creatorUserId: letter.creator_user_id,
      teamId: letter.team_id,
      status: letter.status as LetterStatus,
    };

    if (!canCreateFinalVersion(currentUser, permissionLetter)) {
      return {
        status: "error",
        message: "User tidak memiliki akses membuat naskah final.",
      };
    }

    if (permissionLetter.status !== LETTER_STATUS.INTERNALLY_APPROVED) {
      return {
        status: "error",
        message:
          "Naskah final hanya dapat dibuat dari status Disetujui Internal.",
      };
    }

    const env = getServerEnv();
    const finalDocument = await parseInitialDocumentFile(
      formData.get("finalDocument"),
      {
        maxDocxUploadMb: env.MAX_DOCX_UPLOAD_MB,
        maxPdfUploadMb: env.MAX_PDF_UPLOAD_MB,
      },
    );
    const parsedGoogleDoc = getParsedFinalGoogleDocUrl(parsedInput.data);

    if (!finalDocument && !parsedGoogleDoc) {
      return {
        status: "error",
        message:
          "Naskah final wajib memiliki file final atau link Google Docs final.",
        fieldErrors: {
          finalDocument: ["Upload file final atau isi link Google Docs final."],
          googleDocUrl: ["Upload file final atau isi link Google Docs final."],
        },
      };
    }

    if (finalDocument) {
      const nextVersionNumber = await getNextVersionNumber(
        parsedInput.data.letterId,
      );

      uploadedFinalDocument = await uploadLetterDocument({
        letterId: parsedInput.data.letterId,
        versionNumber: nextVersionNumber,
        file: finalDocument.file,
        sourceType: finalDocument.sourceType,
      });
    }

    const sourceType =
      finalDocument?.sourceType ??
      (parsedGoogleDoc ? SOURCE_TYPE.GOOGLE_DOCS : null);

    const { data, error } = await supabase.rpc("create_final_letter", {
      input_actor_user_id: currentUser.id,
      input_checksum_sha256: uploadedFinalDocument?.checksumSha256 ?? null,
      input_file_mime_type: uploadedFinalDocument?.fileMimeType ?? null,
      input_file_size_bytes: uploadedFinalDocument?.fileSizeBytes ?? null,
      input_file_url: null,
      input_final_summary: parsedInput.data.finalSummary,
      input_google_doc_id: parsedGoogleDoc?.googleDocId ?? null,
      input_google_doc_url: parsedGoogleDoc?.googleDocUrl ?? null,
      input_letter_id: parsedInput.data.letterId,
      input_source_type: sourceType,
      input_storage_path: uploadedFinalDocument?.storagePath ?? null,
    });

    if (error) {
      throw new Error(error.message);
    }

    shouldCleanupUploadedFinalDocument = false;
    revalidatePath("/dashboard");
    revalidatePath("/letters");
    revalidatePath(`/letters/${parsedInput.data.letterId}`);

    return {
      status: "success",
      letterId: data?.[0]?.letter_id ?? parsedInput.data.letterId,
      message: "Naskah final internal berhasil dibuat.",
    };
  } catch (error) {
    if (uploadedFinalDocument && shouldCleanupUploadedFinalDocument) {
      try {
        await deleteTemporaryUpload(uploadedFinalDocument.storagePath);
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

export async function cancelLetterAction(
  _previousState: CorrectionActionState,
  formData: FormData,
): Promise<CorrectionActionState> {
  try {
    const currentUser = await requireCurrentUser();
    const parsedInput = cancelLetterSchema.safeParse({
      letterId: getStringValue(formData, "letterId"),
      cancelReason: getStringValue(formData, "cancelReason"),
    });

    if (!parsedInput.success) {
      return {
        status: "error",
        message: "Input pembatalan belum valid.",
        fieldErrors: parsedInput.error.flatten().fieldErrors,
      };
    }

    const supabase = createSupabaseServiceRoleClient();
    const { data: letter, error: letterError } = await supabase
      .from("letters")
      .select("creator_user_id, team_id, status")
      .eq("id", parsedInput.data.letterId)
      .single();

    if (letterError || !letter) {
      return {
        status: "error",
        message: "Dokumen yang akan dibatalkan tidak ditemukan.",
      };
    }

    const permissionLetter = {
      creatorUserId: letter.creator_user_id,
      teamId: letter.team_id,
      status: letter.status as LetterStatus,
    };

    if (!canCancelLetter(currentUser, permissionLetter)) {
      return {
        status: "error",
        message: "User tidak memiliki akses membatalkan dokumen ini.",
      };
    }

    const { data, error } = await supabase.rpc("cancel_letter", {
      input_actor_user_id: currentUser.id,
      input_cancel_reason: parsedInput.data.cancelReason,
      input_letter_id: parsedInput.data.letterId,
    });

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/dashboard");
    revalidatePath("/letters");
    revalidatePath(`/letters/${parsedInput.data.letterId}`);

    return {
      status: "success",
      letterId: data?.[0]?.letter_id ?? parsedInput.data.letterId,
      message: "Dokumen berhasil dibatalkan.",
    };
  } catch (error) {
    return {
      status: "error",
      message: getErrorMessage(error),
    };
  }
}
