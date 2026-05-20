import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import type { DomainUser } from "@/types/domain";

type UserProfileRow = {
  id: string;
  name: string;
  email: string;
  role: DomainUser["role"];
  team_id: string | null;
  is_active: boolean;
};

function mapUserProfile(row: UserProfileRow): DomainUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    teamId: row.team_id,
    isActive: row.is_active,
  };
}

export async function getCurrentUser(): Promise<DomainUser | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  const { data, error } = await supabase
    .from("users")
    .select("id, name, email, role, team_id, is_active")
    .eq("id", user.id)
    .eq("is_active", true)
    .single();

  if (error || !data) {
    return null;
  }

  return mapUserProfile(data as UserProfileRow);
}

export async function requireCurrentUser(): Promise<DomainUser> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("User session is required.");
  }

  return user;
}
