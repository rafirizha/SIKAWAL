import "server-only";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role-client";
import { getServerEnv } from "@/lib/validation/env";
import { SOURCE_TYPE } from "@/lib/workflow/constants";
import type { SourceType } from "@/types/domain";

export type UploadedLetterDocument = {
  storagePath: string;
  fileMimeType: string;
  fileSizeBytes: number;
  checksumSha256: string;
};

type UploadLetterDocumentInput = {
  letterId: string;
  versionNumber: number;
  file: File;
  sourceType?: SourceType;
};

type UploadCorrectionSnapshotInput = {
  letterId: string;
  revisionRound: number;
  file: File;
  sourceType?: SourceType;
  fileMimeType?: string;
};

function sanitizeFileName(fileName: string) {
  return fileName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getFileExtension(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase() ?? "bin";
}

async function createSha256Hex(buffer: ArrayBuffer) {
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  return hashArray.map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function uploadDocumentToStorage({
  errorPrefix,
  file,
  fileMimeType,
  storagePath,
}: {
  errorPrefix: string;
  file: File;
  fileMimeType?: string;
  storagePath: string;
}): Promise<UploadedLetterDocument> {
  const env = getServerEnv();
  const supabase = createSupabaseServiceRoleClient();
  const arrayBuffer = await file.arrayBuffer();
  const checksumSha256 = await createSha256Hex(arrayBuffer);
  const resolvedFileMimeType =
    fileMimeType || file.type || "application/octet-stream";

  const { error } = await supabase.storage
    .from(env.LETTER_DOCUMENTS_BUCKET)
    .upload(storagePath, arrayBuffer, {
      contentType: resolvedFileMimeType,
      upsert: false,
    });

  if (error) {
    throw new Error(`${errorPrefix}: ${error.message}`);
  }

  return {
    storagePath,
    fileMimeType: resolvedFileMimeType,
    fileSizeBytes: file.size,
    checksumSha256,
  };
}

function getMimeTypeFromSourceType(sourceType?: SourceType) {
  if (sourceType === SOURCE_TYPE.UPLOAD_DOCX) {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }

  if (sourceType === SOURCE_TYPE.UPLOAD_PDF) {
    return "application/pdf";
  }

  return undefined;
}

export async function uploadLetterDocument({
  letterId,
  versionNumber,
  file,
  sourceType,
}: UploadLetterDocumentInput): Promise<UploadedLetterDocument> {
  const sanitizedFileName =
    sanitizeFileName(file.name) || `document.${getFileExtension(file.name)}`;
  const storagePath = `letters/${letterId}/versions/${versionNumber}/${Date.now()}-${crypto.randomUUID()}-${sanitizedFileName}`;

  return uploadDocumentToStorage({
    errorPrefix: "Upload dokumen awal gagal",
    file,
    fileMimeType: getMimeTypeFromSourceType(sourceType),
    storagePath,
  });
}

export async function uploadCorrectionSnapshot({
  letterId,
  revisionRound,
  file,
  fileMimeType,
  sourceType,
}: UploadCorrectionSnapshotInput): Promise<UploadedLetterDocument> {
  const sanitizedFileName =
    sanitizeFileName(file.name) || `snapshot.${getFileExtension(file.name)}`;
  const storagePath = `letters/${letterId}/snapshots/${revisionRound}/${Date.now()}-${crypto.randomUUID()}-${sanitizedFileName}`;

  return uploadDocumentToStorage({
    errorPrefix: "Upload snapshot koreksi gagal",
    file,
    fileMimeType: fileMimeType ?? getMimeTypeFromSourceType(sourceType),
    storagePath,
  });
}

export async function deleteTemporaryUpload(storagePath: string) {
  const env = getServerEnv();
  const supabase = createSupabaseServiceRoleClient();

  await supabase.storage
    .from(env.LETTER_DOCUMENTS_BUCKET)
    .remove([storagePath]);
}
