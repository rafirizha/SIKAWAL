import { AppShell } from "@/components/layout/app-shell";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { DraftLetterForm } from "@/features/letters/components/draft-letter-form";

export default function NewLetterPage() {
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
          <DraftLetterForm />
        </section>
      </main>
    </AppShell>
  );
}
