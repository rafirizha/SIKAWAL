import { describe, expect, it } from "vitest";

import { completeGeneralSubdivisionCorrectionSchema } from "@/lib/validation/general-subdivision-correction";
import { GENERAL_SUBDIVISION_CORRECTION_DECISION } from "@/lib/workflow/constants";

const validLetterId = "00000000-0000-4000-8000-000000000001";

describe("completeGeneralSubdivisionCorrectionSchema", () => {
  it("accepts a valid Kasubbag Umum correction decision", () => {
    const parsed = completeGeneralSubdivisionCorrectionSchema.safeParse({
      letterId: validLetterId,
      correctionDecision:
        GENERAL_SUBDIVISION_CORRECTION_DECISION.FORWARD_TO_HEAD,
      notes: "Sudah sesuai, lanjut.",
    });

    expect(parsed.success).toBe(true);
  });

  it("rejects invalid decision values", () => {
    const parsed = completeGeneralSubdivisionCorrectionSchema.safeParse({
      letterId: validLetterId,
      correctionDecision: "approve_final",
      notes: "",
    });

    expect(parsed.success).toBe(false);
  });

  it("trims empty notes into undefined", () => {
    const parsed = completeGeneralSubdivisionCorrectionSchema.parse({
      letterId: validLetterId,
      correctionDecision:
        GENERAL_SUBDIVISION_CORRECTION_DECISION.REQUEST_REVISION,
      notes: "   ",
    });

    expect(parsed.notes).toBeUndefined();
  });
});
