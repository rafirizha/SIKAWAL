import { z } from "zod";

const optionalUrlSchema = z.union([z.string().url(), z.literal("")]).optional();
const optionalSecretSchema = z
  .union([z.string().min(1), z.literal("")])
  .optional();

export const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
});

export const serverEnvSchema = publicEnvSchema.extend({
  SUPABASE_SECRET_KEY: optionalSecretSchema,
  SUPABASE_SERVICE_ROLE_KEY: optionalSecretSchema,
  APP_BASE_URL: z.string().url().default("http://localhost:3000"),
  MAX_DOCX_UPLOAD_MB: z.coerce.number().int().positive().default(25),
  MAX_PDF_UPLOAD_MB: z.coerce.number().int().positive().default(25),
  DATA_PILOT_MODE: z
    .enum(["dummy", "anonymized", "approved_real_data"])
    .default("dummy"),
  STORAGE_PROVIDER: z.enum(["supabase", "internal", "s3"]).default("supabase"),
  LETTER_DOCUMENTS_BUCKET: z.string().min(1).default("letter-documents"),
  GOOGLE_APPS_SCRIPT_EXPORT_URL: optionalUrlSchema,
  GOOGLE_INTEGRATION_MODE: z.enum(["manual", "apps_script"]).default("manual"),
});

export type PublicEnv = z.infer<typeof publicEnvSchema> & {
  SUPABASE_PUBLIC_KEY: string;
};
export type ServerEnv = z.infer<typeof serverEnvSchema> & {
  SUPABASE_PUBLIC_KEY: string;
  SUPABASE_PRIVILEGED_KEY?: string;
};

function formatEnvErrors(error: z.ZodError) {
  return error.issues
    .map((issue) => `- ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
}

function getSupabasePublicKey(env: z.infer<typeof publicEnvSchema>) {
  return (
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function parsePublicEnv(env: NodeJS.ProcessEnv): PublicEnv {
  const parsed = publicEnvSchema.safeParse(env);

  if (!parsed.success) {
    throw new Error(
      `Public environment validation failed:\n${formatEnvErrors(parsed.error)}`,
    );
  }

  const supabasePublicKey = getSupabasePublicKey(parsed.data);

  if (!supabasePublicKey) {
    throw new Error(
      "Public environment validation failed:\n- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: Required when NEXT_PUBLIC_SUPABASE_ANON_KEY is not set",
    );
  }

  return {
    ...parsed.data,
    SUPABASE_PUBLIC_KEY: supabasePublicKey,
  };
}

export function parseServerEnv(env: NodeJS.ProcessEnv): ServerEnv {
  const parsed = serverEnvSchema.safeParse(env);

  if (!parsed.success) {
    throw new Error(
      `Server environment validation failed:\n${formatEnvErrors(parsed.error)}`,
    );
  }

  const supabasePublicKey = getSupabasePublicKey(parsed.data);

  if (!supabasePublicKey) {
    throw new Error(
      "Server environment validation failed:\n- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: Required when NEXT_PUBLIC_SUPABASE_ANON_KEY is not set",
    );
  }

  return {
    ...parsed.data,
    SUPABASE_PUBLIC_KEY: supabasePublicKey,
    SUPABASE_PRIVILEGED_KEY:
      parsed.data.SUPABASE_SECRET_KEY ||
      parsed.data.SUPABASE_SERVICE_ROLE_KEY ||
      undefined,
  };
}

export function getPublicEnv() {
  return parsePublicEnv(process.env);
}

export function getServerEnv() {
  return parseServerEnv(process.env);
}
