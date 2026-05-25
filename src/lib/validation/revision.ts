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

export const submitRevisionSchema = z.object({
  letterId: z.uuid("Draft tidak ditemukan."),
  googleDocUrl: optionalGoogleDocUrlSchema,
  changeSummary: z
    .string()
    .trim()
    .min(5, "Ringkasan perubahan minimal 5 karakter.")
    .max(1000, "Ringkasan perubahan maksimal 1000 karakter."),
});

export type SubmitRevisionInput = z.infer<typeof submitRevisionSchema>;

export function getParsedRevisionGoogleDocUrl(input: SubmitRevisionInput) {
  if (!input.googleDocUrl) {
    return null;
  }

  return parseGoogleDocUrl(input.googleDocUrl);
}
