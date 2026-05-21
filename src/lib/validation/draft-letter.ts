import { z } from "zod";

import { isGoogleDocUrl, parseGoogleDocUrl } from "@/lib/google/google-docs";

const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

const optionalGoogleDocUrlSchema = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined))
  .refine((value) => !value || isGoogleDocUrl(value), {
    message: "URL harus berupa link Google Docs yang valid.",
  });

function isValidIsoDate(value: string) {
  if (!isoDatePattern.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

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
  letterDate: z.string().trim().refine(isValidIsoDate, {
    message: "Tanggal naskah tidak valid.",
  }),
  googleDocUrl: optionalGoogleDocUrlSchema,
  submitAfterCreate: z.boolean().default(false),
});

export type DraftLetterInput = z.infer<typeof draftLetterSchema>;

export function getParsedGoogleDocUrl(input: DraftLetterInput) {
  if (!input.googleDocUrl) {
    return null;
  }

  return parseGoogleDocUrl(input.googleDocUrl);
}
