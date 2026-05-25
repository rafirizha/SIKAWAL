import { describe, expect, it } from "vitest";

import {
  approveInternalSchema,
  completeHeadCorrectionSchema,
} from "@/lib/validation/head-correction";

const validLetterId = "00000000-0000-4000-8000-000000000001";

describe("completeHeadCorrectionSchema", () => {
  it("accepts a valid head correction payload", () => {
    const parsed = completeHeadCorrectionSchema.safeParse({
      letterId: validLetterId,
      notes: "Mohon perbaiki redaksi akhir.",
    });

    expect(parsed.success).toBe(true);
  });

  it("trims empty notes into undefined", () => {
    const parsed = completeHeadCorrectionSchema.parse({
      letterId: validLetterId,
      notes: "   ",
    });

    expect(parsed.notes).toBeUndefined();
  });
});

describe("approveInternalSchema", () => {
  it("accepts an approval payload", () => {
    const parsed = approveInternalSchema.safeParse({
      letterId: validLetterId,
      notes: "Disetujui.",
    });

    expect(parsed.success).toBe(true);
  });
});
