import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getServerEnv } from "@/lib/validation/env";
import type { Database } from "@/types/supabase";

export function createSupabaseServiceRoleClient() {
  const env = getServerEnv();

  if (!env.SUPABASE_PRIVILEGED_KEY) {
    throw new Error(
      "SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY is required for service access.",
    );
  }

  return createClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_PRIVILEGED_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
