import { describe, expect, it } from "vitest";

import {
  cancelLetterSchema,
  createFinalLetterSchema,
  getParsedFinalGoogleDocUrl,
} from "@/lib/validation/final-letter";

const letterId = "30000000-0000-4000-8000-000000000001";

describe("final letter validation", () => {
  it("accepts final summary and optional Google Docs URL", () => {
    const parsed = createFinalLetterSchema.parse({
      letterId,
      googleDocUrl: "https://docs.google.com/document/d/final-doc-id/edit",
      finalSummary: "Naskah sudah disetujui internal dan siap final.",
    });

    expect(parsed.finalSummary).toBe(
      "Naskah sudah disetujui internal dan siap final.",
    );
    expect(getParsedFinalGoogleDocUrl(parsed)).toEqual({
      googleDocId: "final-doc-id",
      googleDocUrl: "https://docs.google.com/document/d/final-doc-id/edit",
    });
  });

  it("rejects non Google Docs final URL", () => {
    const parsed = createFinalLetterSchema.safeParse({
      letterId,
      googleDocUrl: "https://example.com/final.docx",
      finalSummary: "Naskah final.",
    });

    expect(parsed.success).toBe(false);
  });

  it("requires cancel reason", () => {
    const parsed = cancelLetterSchema.safeParse({
      letterId,
      cancelReason: "   ",
    });

    expect(parsed.success).toBe(false);
  });
});
