import { z } from "zod";

import { isGoogleDocUrl, parseGoogleDocUrl } from "@/lib/google/google-docs";

const optionalGoogleDocUrlSchema = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined))
  .refine((value) => !value || isGoogleDocUrl(value), {
    message: "URL harus berupa link Google Docs yang valid.",
  });

export const createFinalLetterSchema = z.object({
  letterId: z.uuid("Draft tidak ditemukan."),
  googleDocUrl: optionalGoogleDocUrlSchema,
  finalSummary: z
    .string()
    .trim()
    .min(5, "Catatan final internal minimal 5 karakter.")
    .max(1000, "Catatan final internal maksimal 1000 karakter."),
});

export const cancelLetterSchema = z.object({
  letterId: z.uuid("Draft tidak ditemukan."),
  cancelReason: z
    .string()
    .trim()
    .min(5, "Alasan pembatalan minimal 5 karakter.")
    .max(1000, "Alasan pembatalan maksimal 1000 karakter."),
});

export type CreateFinalLetterInput = z.infer<typeof createFinalLetterSchema>;
export type CancelLetterInput = z.infer<typeof cancelLetterSchema>;

export function getParsedFinalGoogleDocUrl(input: CreateFinalLetterInput) {
  if (!input.googleDocUrl) {
    return null;
  }

  return parseGoogleDocUrl(input.googleDocUrl);
}
