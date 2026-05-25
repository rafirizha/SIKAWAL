import { z } from "zod";

import { GENERAL_SUBDIVISION_CORRECTION_DECISION } from "@/lib/workflow/constants";

export const completeGeneralSubdivisionCorrectionSchema = z.object({
  letterId: z.uuid("Draft tidak ditemukan."),
  correctionDecision: z.enum(GENERAL_SUBDIVISION_CORRECTION_DECISION, {
    message: "Pilih hasil koreksi yang valid.",
  }),
  notes: z
    .string()
    .trim()
    .max(1000, "Catatan koreksi maksimal 1000 karakter.")
    .optional()
    .transform((value) => (value ? value : undefined)),
});

export type CompleteGeneralSubdivisionCorrectionInput = z.infer<
  typeof completeGeneralSubdivisionCorrectionSchema
>;
