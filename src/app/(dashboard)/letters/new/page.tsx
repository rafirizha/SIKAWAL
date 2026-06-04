import { redirect } from "next/navigation";

import { DraftLetterForm } from "@/features/letters/components/draft-letter-form";
import { getCurrentUser } from "@/lib/auth/current-user";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { USER_ROLE } from "@/lib/workflow/constants";

async function getTeamOptions() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("teams")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) {
    throw new Error("Daftar tim/unit belum bisa dibaca.");
  }

  return data ?? [];
}

export default async function NewLetterPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  const teamOptions =
    currentUser.role === USER_ROLE.ADMIN ? await getTeamOptions() : [];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-8">
      <section className="rounded-lg border bg-card p-6 shadow-sm">
        <div>
          <p className="text-sm font-medium text-primary">Draft</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            Buat Draft Naskah
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Isi metadata naskah, tautkan Google Docs jika ada, lalu simpan atau
            ajukan ke Kasubbag Umum.
          </p>
        </div>
      </section>

      <section className="rounded-lg border bg-card p-5 shadow-sm">
        <DraftLetterForm teamOptions={teamOptions} />
      </section>
    </main>
  );
}
