import { z } from "zod";

const optionalNotesSchema = z
  .string()
  .trim()
  .max(1000, "Catatan maksimal 1000 karakter.")
  .optional()
  .transform((value) => (value ? value : undefined));

export const completeHeadCorrectionSchema = z.object({
  letterId: z.uuid("Draft tidak ditemukan."),
  notes: optionalNotesSchema,
});

export const approveInternalSchema = z.object({
  letterId: z.uuid("Draft tidak ditemukan."),
  notes: optionalNotesSchema,
});

export type CompleteHeadCorrectionInput = z.infer<
  typeof completeHeadCorrectionSchema
>;
export type ApproveInternalInput = z.infer<typeof approveInternalSchema>;
