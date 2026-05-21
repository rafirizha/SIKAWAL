import { describe, expect, it } from "vitest";

import { parseInitialDocumentFile } from "@/lib/validation/initial-document";
import { SOURCE_TYPE } from "@/lib/workflow/constants";

const docxMimeType =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const pdfMimeType = "application/pdf";
const uploadLimits = {
  maxDocxUploadMb: 1,
  maxPdfUploadMb: 1,
};

function createPdfFile(content: string) {
  return new File([content], "draft.pdf", { type: pdfMimeType });
}

function createDocxFile(parts: BlobPart[]) {
  return new File(parts, "draft.docx", { type: docxMimeType });
}

describe("parseInitialDocumentFile", () => {
  it("accepts a PDF with a valid PDF signature", async () => {
    const parsed = await parseInitialDocumentFile(
      createPdfFile("%PDF-1.7\ncontent"),
      uploadLimits,
    );

    expect(parsed?.sourceType).toBe(SOURCE_TYPE.UPLOAD_PDF);
  });

  it("rejects a spoofed PDF file", async () => {
    await expect(
      parseInitialDocumentFile(createPdfFile("not a real pdf"), uploadLimits),
    ).rejects.toThrow("Dokumen PDF tidak valid");
  });

  it("accepts a DOCX-like zip containing Word document entries", async () => {
    const parsed = await parseInitialDocumentFile(
      createDocxFile([
        new Uint8Array([0x50, 0x4b, 0x03, 0x04]),
        " [Content_Types].xml word/document.xml ",
      ]),
      uploadLimits,
    );

    expect(parsed?.sourceType).toBe(SOURCE_TYPE.UPLOAD_DOCX);
  });

  it("rejects a spoofed DOCX file", async () => {
    await expect(
      parseInitialDocumentFile(
        createDocxFile(["not a real docx"]),
        uploadLimits,
      ),
    ).rejects.toThrow("Dokumen DOCX tidak valid");
  });
});
