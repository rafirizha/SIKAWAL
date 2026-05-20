import { z } from "zod";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const optionalUrlSchema = z.union([z.string().url(), z.literal("")]).optional();
const optionalSecretSchema = z
  .union([z.string().min(1), z.literal("")])
  .optional();

function loadLocalEnv() {
  const envPath = resolve(process.cwd(), ".env.local");

  if (!existsSync(envPath)) {
    return;
  }

  const fileContent = readFileSync(envPath, "utf8");

  for (const line of fileContent.split(/\r?\n/)) {
    const trimmedLine = line.trim();

    if (!trimmedLine || trimmedLine.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmedLine.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmedLine.slice(0, separatorIndex).trim();
    const value = trimmedLine.slice(separatorIndex + 1).trim();

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
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

loadLocalEnv();

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Environment validation failed:");
  for (const issue of parsed.error.issues) {
    console.error(`- ${issue.path.join(".")}: ${issue.message}`);
  }
  process.exit(1);
}

const hasSupabasePublicKey = Boolean(
  parsed.data.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  parsed.data.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

if (!hasSupabasePublicKey) {
  console.error("Environment validation failed:");
  console.error(
    "- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: Required when NEXT_PUBLIC_SUPABASE_ANON_KEY is not set",
  );
  process.exit(1);
}

console.log("Environment validation passed.");
