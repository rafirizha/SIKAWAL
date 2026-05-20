"use server";

import { revalidatePath } from "next/cache";

import { requireCurrentUser } from "@/lib/auth/current-user";
import type { DraftActionState } from "@/lib/forms/action-states";
import {
  canCreateDraft,
  canSubmitDraft,
} from "@/lib/permissions/letter-permissions";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role-client";
import {
  deleteTemporaryUpload,
  uploadLetterDocument,
  type UploadedLetterDocument,
} from "@/lib/storage/letter-document-storage";
import {
  draftLetterSchema,
  getParsedGoogleDocUrl,
} from "@/lib/validation/draft-letter";
import { parseInitialDocumentFile } from "@/lib/validation/initial-document";
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
    : "Terjadi kesalahan saat memproses draft.";
}

async function submitDraftToGeneralSubdivision(
  letterId: string,
  actorUserId: string,
) {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase.rpc(
    "submit_draft_to_general_subdivision",
    {
      input_actor_user_id: actorUserId,
      input_letter_id: letterId,
    },
  );

  if (error) {
    throw new Error(error.message);
  }

  return data?.[0] ?? null;
}

export async function createDraftLetterAction(
  _previousState: DraftActionState,
  formData: FormData,
): Promise<DraftActionState> {
  let uploadedDocument: UploadedLetterDocument | null = null;

  try {
    const currentUser = await requireCurrentUser();

    if (!canCreateDraft(currentUser)) {
      return {
        status: "error",
        message: "Role user tidak memiliki akses membuat draft.",
      };
    }

    if (!currentUser.teamId) {
      return {
        status: "error",
        message: "User belum memiliki tim aktif untuk membuat draft.",
      };
    }

    const parsedInput = draftLetterSchema.safeParse({
      subject: getStringValue(formData, "subject"),
      recipient: getStringValue(formData, "recipient"),
      letterDate: getStringValue(formData, "letterDate"),
      googleDocUrl: getStringValue(formData, "googleDocUrl"),
      dataClassification: getStringValue(formData, "dataClassification"),
      submitAfterCreate: ["on", "true"].includes(
        getStringValue(formData, "submitAfterCreate"),
      ),
    });

    if (!parsedInput.success) {
      return {
        status: "error",
        message: "Input draft belum valid.",
        fieldErrors: parsedInput.error.flatten().fieldErrors,
      };
    }

    const env = getServerEnv();
    const initialDocument = parseInitialDocumentFile(
      formData.get("initialDocument"),
      {
        maxDocxUploadMb: env.MAX_DOCX_UPLOAD_MB,
        maxPdfUploadMb: env.MAX_PDF_UPLOAD_MB,
      },
    );
    const parsedGoogleDoc = getParsedGoogleDocUrl(parsedInput.data);

    if (
      parsedInput.data.submitAfterCreate &&
      !initialDocument &&
      !parsedGoogleDoc
    ) {
      return {
        status: "error",
        message:
          "Draft yang langsung diajukan harus memiliki Google Docs atau dokumen awal.",
        fieldErrors: {
          googleDocUrl: ["Isi link Google Docs atau upload dokumen awal."],
          initialDocument: ["Isi link Google Docs atau upload dokumen awal."],
        },
      };
    }

    const letterId = crypto.randomUUID();

    if (initialDocument) {
      uploadedDocument = await uploadLetterDocument({
        letterId,
        versionNumber: 1,
        file: initialDocument.file,
      });
    }

    const supabase = createSupabaseServiceRoleClient();
    const sourceType =
      initialDocument?.sourceType ??
      (parsedGoogleDoc ? SOURCE_TYPE.GOOGLE_DOCS : null);
    const { data, error } = await supabase.rpc("create_draft_letter", {
      input_checksum_sha256: uploadedDocument?.checksumSha256 ?? null,
      input_creator_user_id: currentUser.id,
      input_data_classification: parsedInput.data.dataClassification,
      input_file_mime_type: uploadedDocument?.fileMimeType ?? null,
      input_file_size_bytes: uploadedDocument?.fileSizeBytes ?? null,
      input_file_url: null,
      input_google_doc_id: parsedGoogleDoc?.googleDocId ?? null,
      input_google_doc_url: parsedGoogleDoc?.googleDocUrl ?? null,
      input_letter_date: parsedInput.data.letterDate,
      input_letter_id: letterId,
      input_recipient: parsedInput.data.recipient,
      input_source_type: sourceType,
      input_storage_path: uploadedDocument?.storagePath ?? null,
      input_subject: parsedInput.data.subject,
      input_team_id: currentUser.teamId,
    });

    if (error) {
      throw new Error(error.message);
    }

    const createdLetterId = data?.[0]?.letter_id ?? letterId;

    if (parsedInput.data.submitAfterCreate) {
      await submitDraftToGeneralSubdivision(createdLetterId, currentUser.id);
    }

    revalidatePath("/dashboard");
    revalidatePath("/letters/new");

    return {
      status: "success",
      letterId: createdLetterId,
      message: parsedInput.data.submitAfterCreate
        ? "Draft berhasil diajukan ke Kasubbag Umum."
        : "Draft berhasil disimpan.",
    };
  } catch (error) {
    if (uploadedDocument) {
      try {
        await deleteTemporaryUpload(uploadedDocument.storagePath);
      } catch {
        // Cleanup is best effort; the user-facing error should keep the root cause.
      }
    }

    return {
      status: "error",
      message: getErrorMessage(error),
    };
  }
}

export async function submitDraftToGeneralSubdivisionAction(
  _previousState: DraftActionState,
  formData: FormData,
): Promise<DraftActionState> {
  try {
    const currentUser = await requireCurrentUser();
    const letterId = getStringValue(formData, "letterId");

    if (!letterId) {
      return {
        status: "error",
        message: "Draft tidak ditemukan.",
      };
    }

    const supabase = createSupabaseServiceRoleClient();
    const { data: letter, error } = await supabase
      .from("letters")
      .select("creator_user_id, team_id, status")
      .eq("id", letterId)
      .single();

    if (error || !letter) {
      return {
        status: "error",
        message: "Draft tidak ditemukan.",
      };
    }

    const permissionLetter = {
      creatorUserId: letter.creator_user_id,
      teamId: letter.team_id,
      status: letter.status as LetterStatus,
    };

    if (!canSubmitDraft(currentUser, permissionLetter)) {
      return {
        status: "error",
        message: "User tidak memiliki akses mengajukan draft ini.",
      };
    }

    if (permissionLetter.status !== LETTER_STATUS.DRAFT) {
      return {
        status: "error",
        message: "Hanya draft yang dapat diajukan ke Kasubbag Umum.",
      };
    }

    await submitDraftToGeneralSubdivision(letterId, currentUser.id);
    revalidatePath("/dashboard");

    return {
      status: "success",
      letterId,
      message: "Draft berhasil diajukan ke Kasubbag Umum.",
    };
  } catch (error) {
    return {
      status: "error",
      message: getErrorMessage(error),
    };
  }
}
