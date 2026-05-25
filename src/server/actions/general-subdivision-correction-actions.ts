"use server";

import { revalidatePath } from "next/cache";

import { requireCurrentUser } from "@/lib/auth/current-user";
import type { CorrectionActionState } from "@/lib/forms/action-states";
import { exportCorrectionSnapshotWithAppsScript } from "@/lib/google/apps-script-export";
import { canCompleteGeneralSubdivisionCorrection } from "@/lib/permissions/letter-permissions";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role-client";
import {
  deleteTemporaryUpload,
  uploadCorrectionSnapshot,
  type UploadedLetterDocument,
} from "@/lib/storage/letter-document-storage";
import { completeGeneralSubdivisionCorrectionSchema } from "@/lib/validation/general-subdivision-correction";
import { parseCorrectionSnapshotFile } from "@/lib/validation/initial-document";
import { getServerEnv } from "@/lib/validation/env";
import {
  GOOGLE_INTEGRATION_MODE,
  LETTER_STATUS,
  SOURCE_TYPE,
  USER_ROLE,
} from "@/lib/workflow/constants";
import type { LetterStatus, SourceType } from "@/types/domain";
import type { Json } from "@/types/supabase";

type SupabaseServiceClient = ReturnType<typeof createSupabaseServiceRoleClient>;
type SnapshotJobStatus = "FAILED" | "FALLBACK_REQUIRED";

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Terjadi kesalahan saat menyelesaikan koreksi.";
}

async function createCorrectionSnapshotJob({
  googleDocId,
  letterId,
  requestedByUserId,
  supabase,
}: {
  googleDocId: string | null;
  letterId: string;
  requestedByUserId: string;
  supabase: SupabaseServiceClient;
}) {
  const { data, error } = await supabase
    .from("correction_snapshot_jobs")
    .insert({
      letter_id: letterId,
      requested_by_user_id: requestedByUserId,
      reviewer_role: USER_ROLE.GENERAL_SUBDIVISION_HEAD,
      source_google_doc_id: googleDocId,
      status: "PENDING",
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error("Gagal mencatat job export snapshot otomatis.");
  }

  return data.id;
}

async function markCorrectionSnapshotJobFailed({
  errorMessage,
  jobId,
  status,
  supabase,
}: {
  errorMessage: string;
  jobId: string;
  status: SnapshotJobStatus;
  supabase: SupabaseServiceClient;
}) {
  await supabase
    .from("correction_snapshot_jobs")
    .update({
      completed_at: new Date().toISOString(),
      error_message: errorMessage,
      status,
    })
    .eq("id", jobId);
}

export async function completeGeneralSubdivisionCorrectionAction(
  _previousState: CorrectionActionState,
  formData: FormData,
): Promise<CorrectionActionState> {
  let uploadedSnapshot: UploadedLetterDocument | null = null;
  let shouldCleanupUploadedSnapshot = true;
  let commentsJson: Json | null = null;
  let exportedAt: string | null = null;
  let snapshotSourceType: SourceType = SOURCE_TYPE.MANUAL_SNAPSHOT_UPLOAD;
  let snapshotJobId: string | null = null;
  let snapshotJobFinalized = false;

  try {
    const currentUser = await requireCurrentUser();
    const parsedInput = completeGeneralSubdivisionCorrectionSchema.safeParse({
      letterId: getStringValue(formData, "letterId"),
      correctionDecision: getStringValue(formData, "correctionDecision"),
      notes: getStringValue(formData, "notes"),
    });

    if (!parsedInput.success) {
      return {
        status: "error",
        message: "Input penyelesaian koreksi belum valid.",
        fieldErrors: parsedInput.error.flatten().fieldErrors,
      };
    }

    const supabase = createSupabaseServiceRoleClient();
    const { data: letter, error: letterError } = await supabase
      .from("letters")
      .select(
        "creator_user_id, team_id, status, revision_round, google_doc_id, google_doc_url",
      )
      .eq("id", parsedInput.data.letterId)
      .single();

    if (letterError || !letter) {
      return {
        status: "error",
        message: "Draft koreksi tidak ditemukan.",
      };
    }

    const permissionLetter = {
      creatorUserId: letter.creator_user_id,
      teamId: letter.team_id,
      status: letter.status as LetterStatus,
    };

    if (
      !canCompleteGeneralSubdivisionCorrection(currentUser, permissionLetter)
    ) {
      return {
        status: "error",
        message: "User tidak memiliki akses menyelesaikan koreksi ini.",
      };
    }

    if (
      permissionLetter.status !==
      LETTER_STATUS.WAITING_GENERAL_SUBDIVISION_CORRECTION
    ) {
      return {
        status: "error",
        message: "Hanya draft yang menunggu koreksi Kasubbag Umum.",
      };
    }

    const env = getServerEnv();
    const snapshotDocument = await parseCorrectionSnapshotFile(
      formData.get("snapshotDocument"),
      {
        maxDocxUploadMb: env.MAX_DOCX_UPLOAD_MB,
        maxPdfUploadMb: env.MAX_PDF_UPLOAD_MB,
      },
    );

    const nextRevisionRound = letter.revision_round + 1;
    const hasGoogleDocSource = Boolean(
      letter.google_doc_id || letter.google_doc_url,
    );
    const appsScriptExportUrl = env.GOOGLE_APPS_SCRIPT_EXPORT_URL ?? "";
    const appsScriptSharedSecret = env.GOOGLE_APPS_SCRIPT_SHARED_SECRET ?? "";
    const canUseAppsScriptExport = Boolean(
      env.GOOGLE_INTEGRATION_MODE === GOOGLE_INTEGRATION_MODE.APPS_SCRIPT &&
      appsScriptExportUrl &&
      appsScriptSharedSecret &&
      hasGoogleDocSource,
    );

    if (snapshotDocument) {
      uploadedSnapshot = await uploadCorrectionSnapshot({
        letterId: parsedInput.data.letterId,
        revisionRound: nextRevisionRound,
        file: snapshotDocument.file,
        sourceType: snapshotDocument.sourceType,
      });
    } else if (canUseAppsScriptExport) {
      snapshotJobId = await createCorrectionSnapshotJob({
        googleDocId: letter.google_doc_id,
        letterId: parsedInput.data.letterId,
        requestedByUserId: currentUser.id,
        supabase,
      });

      let exportedSnapshot: Awaited<
        ReturnType<typeof exportCorrectionSnapshotWithAppsScript>
      >;

      try {
        exportedSnapshot = await exportCorrectionSnapshotWithAppsScript({
          exportUrl: appsScriptExportUrl,
          googleDocId: letter.google_doc_id,
          googleDocUrl: letter.google_doc_url,
          letterId: parsedInput.data.letterId,
          reviewerRole: USER_ROLE.GENERAL_SUBDIVISION_HEAD,
          reviewerUserId: currentUser.id,
          revisionRound: nextRevisionRound,
          sharedSecret: appsScriptSharedSecret,
          timeoutMs: env.GOOGLE_APPS_SCRIPT_TIMEOUT_MS,
        });
      } catch (error) {
        snapshotJobFinalized = true;
        try {
          await markCorrectionSnapshotJobFailed({
            errorMessage: getErrorMessage(error),
            jobId: snapshotJobId,
            status: "FALLBACK_REQUIRED",
            supabase,
          });
        } catch {
          // Keep the export root cause as the user-facing error.
        }

        throw error;
      }

      commentsJson = exportedSnapshot.commentsJson;
      exportedAt = exportedSnapshot.exportedAt;
      snapshotSourceType = SOURCE_TYPE.APPS_SCRIPT_EXPORT;

      if (exportedSnapshot.file) {
        const exportedSnapshotDocument = await parseCorrectionSnapshotFile(
          exportedSnapshot.file,
          {
            maxDocxUploadMb: env.MAX_DOCX_UPLOAD_MB,
            maxPdfUploadMb: env.MAX_PDF_UPLOAD_MB,
          },
        );

        if (!exportedSnapshotDocument) {
          throw new Error("Export otomatis tidak menghasilkan file valid.");
        }

        uploadedSnapshot = await uploadCorrectionSnapshot({
          letterId: parsedInput.data.letterId,
          revisionRound: nextRevisionRound,
          file: exportedSnapshotDocument.file,
          sourceType: exportedSnapshotDocument.sourceType,
        });
      }
    } else if (
      env.GOOGLE_INTEGRATION_MODE === GOOGLE_INTEGRATION_MODE.APPS_SCRIPT &&
      appsScriptExportUrl &&
      hasGoogleDocSource &&
      !appsScriptSharedSecret
    ) {
      return {
        status: "error",
        message:
          "Export otomatis belum memiliki shared secret. Upload DOCX/PDF hasil koreksi secara manual.",
        fieldErrors: {
          snapshotDocument: ["Upload DOCX/PDF hasil koreksi."],
        },
      };
    } else {
      return {
        status: "error",
        message: "Snapshot koreksi wajib tersedia.",
        fieldErrors: {
          snapshotDocument: ["Upload DOCX/PDF hasil koreksi."],
        },
      };
    }

    if (!uploadedSnapshot && commentsJson === null) {
      return {
        status: "error",
        message: "Snapshot koreksi atau comments_json wajib tersedia.",
        fieldErrors: {
          snapshotDocument: ["Upload DOCX/PDF hasil koreksi."],
        },
      };
    }

    const { data, error } = await supabase.rpc(
      "complete_general_subdivision_correction",
      {
        input_actor_user_id: currentUser.id,
        input_checksum_sha256: uploadedSnapshot?.checksumSha256 ?? null,
        input_comments_json: commentsJson,
        input_decision: parsedInput.data.correctionDecision,
        input_exported_at: exportedAt,
        input_file_mime_type: uploadedSnapshot?.fileMimeType ?? null,
        input_file_size_bytes: uploadedSnapshot?.fileSizeBytes ?? null,
        input_file_url: null,
        input_letter_id: parsedInput.data.letterId,
        input_notes: parsedInput.data.notes ?? null,
        input_snapshot_job_id: snapshotJobId,
        input_source_type: snapshotSourceType,
        input_storage_path: uploadedSnapshot?.storagePath ?? null,
      },
    );

    if (error) {
      throw new Error(error.message);
    }

    shouldCleanupUploadedSnapshot = false;
    snapshotJobFinalized = true;

    revalidatePath("/dashboard");

    return {
      status: "success",
      letterId: data?.[0]?.letter_id ?? parsedInput.data.letterId,
      message: "Koreksi Kasubbag Umum berhasil diselesaikan.",
    };
  } catch (error) {
    if (snapshotJobId && !snapshotJobFinalized) {
      try {
        await markCorrectionSnapshotJobFailed({
          errorMessage: getErrorMessage(error),
          jobId: snapshotJobId,
          status: "FAILED",
          supabase: createSupabaseServiceRoleClient(),
        });
      } catch {
        // Keep the workflow/storage root cause as the user-facing error.
      }
    }

    if (uploadedSnapshot && shouldCleanupUploadedSnapshot) {
      try {
        await deleteTemporaryUpload(uploadedSnapshot.storagePath);
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
