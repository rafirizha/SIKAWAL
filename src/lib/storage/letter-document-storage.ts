import "server-only";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role-client";
import { getServerEnv } from "@/lib/validation/env";

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

export async function uploadLetterDocument({
  letterId,
  versionNumber,
  file,
}: UploadLetterDocumentInput): Promise<UploadedLetterDocument> {
  const env = getServerEnv();
  const supabase = createSupabaseServiceRoleClient();
  const arrayBuffer = await file.arrayBuffer();
  const checksumSha256 = await createSha256Hex(arrayBuffer);
  const sanitizedFileName =
    sanitizeFileName(file.name) || `document.${getFileExtension(file.name)}`;
  const storagePath = `letters/${letterId}/versions/${versionNumber}/${Date.now()}-${sanitizedFileName}`;

  const { error } = await supabase.storage
    .from(env.LETTER_DOCUMENTS_BUCKET)
    .upload(storagePath, arrayBuffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (error) {
    throw new Error(`Upload dokumen awal gagal: ${error.message}`);
  }

  return {
    storagePath,
    fileMimeType: file.type || "application/octet-stream",
    fileSizeBytes: file.size,
    checksumSha256,
  };
}

export async function deleteTemporaryUpload(storagePath: string) {
  const env = getServerEnv();
  const supabase = createSupabaseServiceRoleClient();

  await supabase.storage
    .from(env.LETTER_DOCUMENTS_BUCKET)
    .remove([storagePath]);
}
