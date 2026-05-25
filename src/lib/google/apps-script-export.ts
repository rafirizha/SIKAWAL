import "server-only";

import { z } from "zod";

import { USER_ROLE } from "@/lib/workflow/constants";
import type { Json } from "@/types/supabase";

type AppsScriptReviewerRole =
  | typeof USER_ROLE.GENERAL_SUBDIVISION_HEAD
  | typeof USER_ROLE.HEAD;

const docxMimeType =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const pdfMimeType = "application/pdf";

const appsScriptSnapshotFileSchema = z.object({
  fileName: z.string().trim().min(1),
  mimeType: z.enum([docxMimeType, pdfMimeType]),
  base64: z.string().trim().min(1),
});

const appsScriptExportResponseSchema = z.object({
  ok: z.boolean().optional(),
  status: z.enum(["success", "error"]).optional(),
  errorMessage: z.string().trim().optional(),
  fallbackReason: z.string().trim().optional(),
  exportedAt: z.string().trim().optional(),
  snapshot: appsScriptSnapshotFileSchema.optional(),
  docx: appsScriptSnapshotFileSchema.optional(),
  pdf: appsScriptSnapshotFileSchema.optional(),
  commentsJson: z.unknown().optional(),
});

export type AppsScriptExportInput = {
  exportUrl: string;
  letterId: string;
  googleDocId: string | null;
  googleDocUrl: string | null;
  reviewerUserId: string;
  reviewerRole: AppsScriptReviewerRole;
  revisionRound: number;
  sharedSecret: string;
  timeoutMs: number;
};

export type AppsScriptExportedSnapshot = {
  file: File | null;
  commentsJson: Json | null;
  exportedAt: string | null;
  fallbackReason: string | null;
};

function getSelectedSnapshotFile(
  response: z.infer<typeof appsScriptExportResponseSchema>,
) {
  return response.snapshot ?? response.docx ?? response.pdf ?? null;
}

function normalizeJson(value: unknown): Json | null {
  if (value === undefined || value === null) {
    return null;
  }

  return JSON.parse(JSON.stringify(value)) as Json;
}

function hasJsonEvidenceContent(value: Json): boolean {
  if (value === null) {
    return false;
  }

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return true;
  }

  if (Array.isArray(value)) {
    return value.some(hasJsonEvidenceContent);
  }

  return Object.values(value).some((item) =>
    item === undefined ? false : hasJsonEvidenceContent(item),
  );
}

function normalizeCommentsJsonEvidence(value: unknown): Json | null {
  const normalizedValue = normalizeJson(value);

  if (!normalizedValue || !hasJsonEvidenceContent(normalizedValue)) {
    return null;
  }

  return normalizedValue;
}

function getExportedAt(value: string | undefined) {
  if (!value) {
    return new Date().toISOString();
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString();
  }

  return date.toISOString();
}

function createFileFromBase64({
  base64,
  fileName,
  mimeType,
}: z.infer<typeof appsScriptSnapshotFileSchema>) {
  const buffer = Buffer.from(base64, "base64");

  if (!buffer.byteLength) {
    throw new Error("Export otomatis tidak menghasilkan file snapshot valid.");
  }

  return new File([buffer], fileName, { type: mimeType });
}

function getFallbackMessage(message: string | undefined) {
  return message
    ? `Export otomatis gagal: ${message}. Upload DOCX/PDF hasil koreksi secara manual.`
    : "Export otomatis gagal. Upload DOCX/PDF hasil koreksi secara manual.";
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : undefined;
}

export async function exportCorrectionSnapshotWithAppsScript({
  exportUrl,
  googleDocId,
  googleDocUrl,
  letterId,
  reviewerRole,
  reviewerUserId,
  revisionRound,
  sharedSecret,
  timeoutMs,
}: AppsScriptExportInput): Promise<AppsScriptExportedSnapshot> {
  let response: Response;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    response = await fetch(exportUrl, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "content-type": "application/json",
        "x-sikawal-bridge-secret": sharedSecret,
      },
      body: JSON.stringify({
        letter_id: letterId,
        shared_secret: sharedSecret,
        source_google_doc_id: googleDocId,
        source_google_doc_url: googleDocUrl,
        reviewer_user_id: reviewerUserId,
        reviewer_role: reviewerRole,
        revision_round: revisionRound,
      }),
    });
  } catch (error) {
    const errorMessage = controller.signal.aborted
      ? `timeout setelah ${timeoutMs}ms`
      : getErrorMessage(error);

    throw new Error(getFallbackMessage(errorMessage));
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new Error(
      getFallbackMessage(`${response.status} ${response.statusText}`),
    );
  }

  let responsePayload: unknown;

  try {
    responsePayload = await response.json();
  } catch {
    throw new Error(getFallbackMessage("payload bridge tidak valid"));
  }

  const parsedResponse =
    appsScriptExportResponseSchema.safeParse(responsePayload);

  if (!parsedResponse.success) {
    throw new Error(getFallbackMessage("payload bridge tidak valid"));
  }

  const payload = parsedResponse.data;

  if (payload.ok === false || payload.status === "error") {
    throw new Error(
      getFallbackMessage(payload.errorMessage || payload.fallbackReason),
    );
  }

  const selectedFile = getSelectedSnapshotFile(payload);
  const commentsJson = normalizeCommentsJsonEvidence(payload.commentsJson);

  if (!selectedFile && commentsJson === null) {
    throw new Error(
      getFallbackMessage("bridge tidak mengirim file atau comments_json"),
    );
  }

  return {
    file: selectedFile ? createFileFromBase64(selectedFile) : null,
    commentsJson,
    exportedAt: getExportedAt(payload.exportedAt),
    fallbackReason: payload.fallbackReason || null,
  };
}
