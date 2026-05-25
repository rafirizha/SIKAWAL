import { describe, expect, it } from "vitest";

import { submitRevisionSchema } from "@/lib/validation/revision";

const validLetterId = "00000000-0000-4000-8000-000000000001";

describe("submitRevisionSchema", () => {
  it("accepts a valid revision payload", () => {
    const parsed = submitRevisionSchema.safeParse({
      letterId: validLetterId,
      googleDocUrl: "https://docs.google.com/document/d/doc-123/edit",
      changeSummary: "Tanggal naskah dan tujuan sudah diperbaiki.",
    });

    expect(parsed.success).toBe(true);
  });

  it("requires a meaningful change summary", () => {
    const parsed = submitRevisionSchema.safeParse({
      letterId: validLetterId,
      googleDocUrl: "",
      changeSummary: "  ",
    });

    expect(parsed.success).toBe(false);
  });

  it("rejects non Google Docs URLs", () => {
    const parsed = submitRevisionSchema.safeParse({
      letterId: validLetterId,
      googleDocUrl: "https://example.com/document",
      changeSummary: "Sudah direvisi.",
    });

    expect(parsed.success).toBe(false);
  });
});
