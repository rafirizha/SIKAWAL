import { describe, expect, it } from "vitest";

import { draftLetterSchema } from "@/lib/validation/draft-letter";

describe("draftLetterSchema", () => {
  it("accepts valid draft input with a Google Docs URL", () => {
    const parsed = draftLetterSchema.safeParse({
      subject: "Undangan rapat koordinasi",
      recipient: "Pegawai internal",
      letterDate: "2026-05-20",
      googleDocUrl: "https://docs.google.com/document/d/abcDEF_123-xyz/edit",
      submitAfterCreate: true,
    });

    expect(parsed.success).toBe(true);
  });

  it("rejects short subject and invalid Google Docs URL", () => {
    const parsed = draftLetterSchema.safeParse({
      subject: "abc",
      recipient: "A",
      letterDate: "not-a-date",
      googleDocUrl: "https://example.com/document/d/abc/edit",
    });

    expect(parsed.success).toBe(false);
  });

  it("rejects calendar-invalid dates", () => {
    const parsed = draftLetterSchema.safeParse({
      subject: "Undangan rapat koordinasi",
      recipient: "Pegawai internal",
      letterDate: "2026-02-31",
      googleDocUrl: "",
    });

    expect(parsed.success).toBe(false);
  });

  it("does not accept client-controlled data classification", () => {
    const parsed = draftLetterSchema.parse({
      subject: "Undangan rapat koordinasi",
      recipient: "Pegawai internal",
      letterDate: "2026-05-20",
      googleDocUrl: "",
      dataClassification: "production",
      submitAfterCreate: false,
    });

    expect("dataClassification" in parsed).toBe(false);
  });
});
