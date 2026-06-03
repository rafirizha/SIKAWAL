import "server-only";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role-client";
import { getServerEnv } from "@/lib/validation/env";
import { SOURCE_TYPE } from "@/lib/workflow/constants";
import type { SourceType } from "@/types/domain";

const signedUrlExpiresInSeconds = 15 * 60;

type StoredDocumentVersionRow = {
  letter_id: string;
  title: string;
  source_type: string;
  storage_path: string | null;
  file_mime_type: string | null;
  file_size_bytes: number | string | null;
  version_number: number;
  created_at: string;
};

export type StoredWorkingDocument = {
  label: string;
  meta: string;
  url: string;
};

function uniqueValues(values: string[]) {
  return Array.from(new Set(values));
}

export function formatFileSize(value: number | string | null) {
  if (value === null) {
    return null;
  }

  const bytes = Number(value);

  if (!Number.isFinite(bytes) || bytes <= 0) {
    return null;
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getSourceLabel(sourceType: SourceType | string) {
  if (sourceType === SOURCE_TYPE.UPLOAD_DOCX) {
    return "DOCX";
  }

  if (sourceType === SOURCE_TYPE.UPLOAD_PDF) {
    return "PDF";
  }

  if (sourceType === SOURCE_TYPE.APPS_SCRIPT_EXPORT) {
    return "Snapshot otomatis";
  }

  if (sourceType === SOURCE_TYPE.MANUAL_SNAPSHOT_UPLOAD) {
    return "Snapshot manual";
  }

  return "Dokumen";
}

function getDocumentMeta(row: StoredDocumentVersionRow) {
  const parts = [
    getSourceLabel(row.source_type),
    row.title,
    formatFileSize(row.file_size_bytes),
  ].filter(Boolean);

  return parts.join(" - ");
}

export async function createStoredDocumentSignedUrlMap(storagePaths: string[]) {
  const uniqueStoragePaths = uniqueValues(storagePaths);

  if (!uniqueStoragePaths.length) {
    return new Map<string, string>();
  }

  const env = getServerEnv();
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase.storage
    .from(env.LETTER_DOCUMENTS_BUCKET)
    .createSignedUrls(uniqueStoragePaths, signedUrlExpiresInSeconds, {
      download: true,
    });

  if (error) {
    throw new Error("Link akses dokumen belum bisa dibuat.");
  }

  return new Map(
    (data ?? [])
      .filter((row) => row.path && row.signedUrl)
      .map((row) => [row.path as string, row.signedUrl as string]),
  );
}

export async function getLatestStoredDocumentMap(letterIds: string[]) {
  const uniqueLetterIds = uniqueValues(letterIds);

  if (!uniqueLetterIds.length) {
    return new Map<string, StoredWorkingDocument>();
  }

  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("letter_versions")
    .select(
      "letter_id, title, source_type, storage_path, file_mime_type, file_size_bytes, version_number, created_at",
    )
    .in("letter_id", uniqueLetterIds)
    .not("storage_path", "is", null)
    .order("version_number", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Dokumen kerja belum bisa dibaca.");
  }

  const latestRows = new Map<string, StoredDocumentVersionRow>();

  for (const row of (data ?? []) as StoredDocumentVersionRow[]) {
    if (row.storage_path && !latestRows.has(row.letter_id)) {
      latestRows.set(row.letter_id, row);
    }
  }

  const storagePaths = uniqueValues(
    Array.from(latestRows.values())
      .map((row) => row.storage_path)
      .filter((path): path is string => Boolean(path)),
  );

  if (!storagePaths.length) {
    return new Map<string, StoredWorkingDocument>();
  }

  const signedUrlMap = await createStoredDocumentSignedUrlMap(storagePaths);

  const documentMap = new Map<string, StoredWorkingDocument>();

  for (const [letterId, row] of latestRows) {
    if (!row.storage_path) {
      continue;
    }

    const signedUrl = signedUrlMap.get(row.storage_path);

    if (!signedUrl) {
      continue;
    }

    documentMap.set(letterId, {
      label: "Unduh Dokumen",
      meta: getDocumentMeta(row),
      url: signedUrl,
    });
  }

  return documentMap;
}
