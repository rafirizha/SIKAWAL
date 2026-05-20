import { SOURCE_TYPE } from "@/lib/workflow/constants";
import type { SourceType } from "@/types/domain";

const docxMimeType =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const pdfMimeType = "application/pdf";

export type InitialDocumentFile = {
  file: File;
  sourceType: SourceType;
};

type InitialDocumentLimits = {
  maxDocxUploadMb: number;
  maxPdfUploadMb: number;
};

function isFileLike(value: FormDataEntryValue | null): value is File {
  return value instanceof File && value.size > 0;
}

function getFileExtension(fileName: string) {
  const extension = fileName.split(".").pop();

  return extension?.toLowerCase();
}

function getSourceType(file: File): SourceType | null {
  const extension = getFileExtension(file.name);

  if (file.type === docxMimeType || extension === "docx") {
    return SOURCE_TYPE.UPLOAD_DOCX;
  }

  if (file.type === pdfMimeType || extension === "pdf") {
    return SOURCE_TYPE.UPLOAD_PDF;
  }

  return null;
}

function getMaxFileSizeBytes(
  sourceType: SourceType,
  limits: InitialDocumentLimits,
) {
  const maxUploadMb =
    sourceType === SOURCE_TYPE.UPLOAD_PDF
      ? limits.maxPdfUploadMb
      : limits.maxDocxUploadMb;

  return maxUploadMb * 1024 * 1024;
}

export function parseInitialDocumentFile(
  value: FormDataEntryValue | null,
  limits: InitialDocumentLimits,
): InitialDocumentFile | null {
  if (!isFileLike(value)) {
    return null;
  }

  const sourceType = getSourceType(value);

  if (!sourceType) {
    throw new Error("Dokumen awal harus berformat DOCX atau PDF.");
  }

  if (value.size > getMaxFileSizeBytes(sourceType, limits)) {
    throw new Error("Ukuran dokumen awal melebihi batas upload.");
  }

  return {
    file: value,
    sourceType,
  };
}
