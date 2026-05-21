import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { LogoutButton } from "@/features/auth/components/logout-button";
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
    <AppShell>
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-8">
        <section className="border-b pb-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Draft</p>
              <h1 className="mt-2 text-2xl font-semibold">Buat Draft Naskah</h1>
            </div>
            <LogoutButton />
          </div>
        </section>

        <section className="rounded-lg border bg-card p-5">
          <DraftLetterForm teamOptions={teamOptions} />
        </section>
      </main>
    </AppShell>
  );
}
