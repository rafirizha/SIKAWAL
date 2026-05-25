import { SOURCE_TYPE } from "@/lib/workflow/constants";
import type { SourceType } from "@/types/domain";

const docxMimeType =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const pdfMimeType = "application/pdf";
const zipMagicNumbers = [
  [0x50, 0x4b, 0x03, 0x04],
  [0x50, 0x4b, 0x05, 0x06],
  [0x50, 0x4b, 0x07, 0x08],
];

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

function startsWithBytes(bytes: Uint8Array, pattern: number[]) {
  if (bytes.length < pattern.length) {
    return false;
  }

  return pattern.every((byte, index) => bytes[index] === byte);
}

function startsWithAsciiText(bytes: Uint8Array, text: string) {
  const pattern = Array.from(text, (character) => character.charCodeAt(0));

  return startsWithBytes(bytes, pattern);
}

function containsAsciiText(bytes: Uint8Array, text: string) {
  const pattern = Array.from(text, (character) => character.charCodeAt(0));

  if (bytes.length < pattern.length) {
    return false;
  }

  return bytes.some((_, startIndex) => {
    if (startIndex + pattern.length > bytes.length) {
      return false;
    }

    return pattern.every(
      (byte, patternIndex) => bytes[startIndex + patternIndex] === byte,
    );
  });
}

function hasZipMagicNumber(bytes: Uint8Array) {
  return zipMagicNumbers.some((magicNumber) =>
    startsWithBytes(bytes, magicNumber),
  );
}

async function assertFileSignature(file: File, sourceType: SourceType) {
  const bytes = new Uint8Array(await file.arrayBuffer());

  if (sourceType === SOURCE_TYPE.UPLOAD_PDF) {
    if (!startsWithAsciiText(bytes, "%PDF-")) {
      throw new Error("Dokumen PDF tidak valid atau rusak.");
    }

    return;
  }

  if (
    !hasZipMagicNumber(bytes) ||
    !containsAsciiText(bytes, "[Content_Types].xml") ||
    !containsAsciiText(bytes, "word/document.xml")
  ) {
    throw new Error("Dokumen DOCX tidak valid atau rusak.");
  }
}

async function parseDocumentFile(
  value: FormDataEntryValue | null,
  limits: InitialDocumentLimits,
  documentLabel: string,
): Promise<InitialDocumentFile | null> {
  if (!isFileLike(value)) {
    return null;
  }

  const sourceType = getSourceType(value);

  if (!sourceType) {
    throw new Error(`${documentLabel} harus berformat DOCX atau PDF.`);
  }

  if (value.size > getMaxFileSizeBytes(sourceType, limits)) {
    throw new Error(
      `Ukuran ${documentLabel.toLowerCase()} melebihi batas upload.`,
    );
  }

  await assertFileSignature(value, sourceType);

  return {
    file: value,
    sourceType,
  };
}

export async function parseInitialDocumentFile(
  value: FormDataEntryValue | null,
  limits: InitialDocumentLimits,
): Promise<InitialDocumentFile | null> {
  return parseDocumentFile(value, limits, "Dokumen awal");
}

export async function parseCorrectionSnapshotFile(
  value: FormDataEntryValue | null,
  limits: InitialDocumentLimits,
): Promise<InitialDocumentFile | null> {
  return parseDocumentFile(value, limits, "Snapshot koreksi");
}
