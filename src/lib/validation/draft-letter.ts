import { z } from "zod";

import { isGoogleDocUrl, parseGoogleDocUrl } from "@/lib/google/google-docs";
import { DATA_CLASSIFICATION } from "@/lib/workflow/constants";

const optionalGoogleDocUrlSchema = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined))
  .refine((value) => !value || isGoogleDocUrl(value), {
    message: "URL harus berupa link Google Docs yang valid.",
  });

export const draftLetterSchema = z.object({
  subject: z
    .string()
    .trim()
    .min(5, "Perihal minimal 5 karakter.")
    .max(180, "Perihal maksimal 180 karakter."),
  recipient: z
    .string()
    .trim()
    .min(2, "Tujuan minimal 2 karakter.")
    .max(180, "Tujuan maksimal 180 karakter."),
  letterDate: z
    .string()
    .trim()
    .refine((value) => !Number.isNaN(Date.parse(value)), {
      message: "Tanggal naskah tidak valid.",
    }),
  googleDocUrl: optionalGoogleDocUrlSchema,
  dataClassification: z
    .enum(DATA_CLASSIFICATION)
    .default(DATA_CLASSIFICATION.DUMMY),
  submitAfterCreate: z.boolean().default(false),
});

export type DraftLetterInput = z.infer<typeof draftLetterSchema>;

export function getParsedGoogleDocUrl(input: DraftLetterInput) {
  if (!input.googleDocUrl) {
    return null;
  }

  return parseGoogleDocUrl(input.googleDocUrl);
}
