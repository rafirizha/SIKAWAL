"use server";

import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import type { AuthActionState } from "@/lib/forms/action-states";

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function getSafeNextPath(value: string) {
  if (!value.startsWith("/") || value.startsWith("//")) {
    return "/dashboard";
  }

  return value;
}

export async function loginAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = getStringValue(formData, "email");
  const password = getStringValue(formData, "password");
  const nextPath = getSafeNextPath(getStringValue(formData, "next"));

  if (!email || !password) {
    return {
      status: "error",
      message: "Email dan password wajib diisi.",
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      status: "error",
      message: "Email atau password belum valid.",
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      status: "error",
      message: "Session login tidak berhasil dibuat.",
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("id, is_active")
    .eq("id", user.id)
    .eq("is_active", true)
    .single();

  if (profileError) {
    await supabase.auth.signOut();

    return {
      status: "error",
      message: `Profil SIKAWAL belum bisa dibaca: ${profileError.message}`,
    };
  }

  if (!profile) {
    await supabase.auth.signOut();

    return {
      status: "error",
      message:
        "User belum memiliki profil aktif di SIKAWAL. Pastikan UID Auth sudah ada di tabel users.",
    };
  }

  redirect(nextPath);
}

export async function logoutAction() {
  const supabase = await createSupabaseServerClient();

  await supabase.auth.signOut();
  redirect("/login");
}
