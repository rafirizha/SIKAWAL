import { redirect } from "next/navigation";
import { Mail, ShieldCheck, UserCircle, Users } from "lucide-react";

import { getCurrentUser } from "@/lib/auth/current-user";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

async function getTeamName(teamId: string | null) {
  if (!teamId) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("teams")
    .select("name")
    .eq("id", teamId)
    .maybeSingle();

  if (error) {
    return null;
  }

  return data?.name ?? null;
}

export default async function ProfilePage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  const teamName = await getTeamName(currentUser.teamId);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-5 py-6 sm:px-6 sm:py-8">
      <section className="rounded-lg border bg-card p-6 shadow-sm">
        <p className="text-sm font-medium text-primary">Profil</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Profil Saya
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Informasi akun ini dipakai untuk permission, antrean koreksi, dan
          audit internal SIKAWAL.
        </p>
      </section>

      <section className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <UserCircle className="h-7 w-7" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2 className="break-words text-xl font-semibold">
              {currentUser.name}
            </h2>
            <p className="mt-1 break-words text-sm text-muted-foreground">
              {currentUser.email}
            </p>
            <span className="mt-3 inline-flex rounded-md bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
              {currentUser.role}
            </span>
          </div>
        </div>

        <dl className="mt-6 grid gap-4 border-t pt-5 text-sm sm:grid-cols-3">
          <div className="rounded-lg bg-muted/40 p-4">
            <dt className="flex items-center gap-2 font-medium">
              <Mail className="h-4 w-4 text-primary" aria-hidden="true" />
              Email
            </dt>
            <dd className="mt-2 break-words text-muted-foreground">
              {currentUser.email}
            </dd>
          </div>
          <div className="rounded-lg bg-muted/40 p-4">
            <dt className="flex items-center gap-2 font-medium">
              <ShieldCheck
                className="h-4 w-4 text-primary"
                aria-hidden="true"
              />
              Role
            </dt>
            <dd className="mt-2 break-words text-muted-foreground">
              {currentUser.role}
            </dd>
          </div>
          <div className="rounded-lg bg-muted/40 p-4">
            <dt className="flex items-center gap-2 font-medium">
              <Users className="h-4 w-4 text-primary" aria-hidden="true" />
              Tim
            </dt>
            <dd className="mt-2 break-words text-muted-foreground">
              {teamName ?? "Belum terhubung ke tim"}
            </dd>
          </div>
        </dl>
      </section>
    </main>
  );
}
