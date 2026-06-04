import { AppShell } from "@/components/layout/app-shell";
import { LoginForm } from "@/features/auth/components/login-form";
import { ClipboardCheck, History, ShieldCheck } from "lucide-react";

const loginHighlights = [
  {
    icon: ClipboardCheck,
    title: "Google Docs tetap tempat komentar",
    description:
      "Reviewer memberi catatan di dokumen kerja, bukan di luar alur.",
  },
  {
    icon: History,
    title: "Snapshot dan versi tetap tertutup",
    description:
      "Hasil koreksi tersimpan sebagai bukti, bukan menimpa versi lama.",
  },
  {
    icon: ShieldCheck,
    title: "Audit server-side aktif",
    description:
      "Status dan approval dicatat dari server, bukan sekadar tampilan.",
  },
];

type LoginPageProps = {
  searchParams?: Promise<{
    next?: string | string[];
  }>;
};

function getNextPath(next?: string | string[]) {
  const value = Array.isArray(next) ? next[0] : next;

  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/dashboard";
  }

  return value;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextPath = getNextPath(params?.next);

  return (
    <AppShell>
      <main className="mx-auto grid min-h-screen w-full max-w-5xl items-center gap-8 px-6 py-8 lg:grid-cols-[1.05fr_0.95fr] lg:py-10">
        <section className="max-w-xl">
          <div className="inline-flex items-center gap-2 rounded-md bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
            <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
            SIKAWAL
          </div>
          <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            Masuk ke alur koreksi yang lebih jelas.
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-7 text-muted-foreground sm:text-base">
            Gunakan akun test Supabase yang sudah dipetakan ke role SIKAWAL.
            Google Docs tetap jadi ruang komentar, SIKAWAL menjaga snapshot,
            versi, dan audit internal.
          </p>

          <div className="mt-8 grid gap-4">
            {loginHighlights.map((item) => {
              const Icon = item.icon;

              return (
                <div className="flex items-start gap-3" key={item.title}>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-background text-primary shadow-sm">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-lg border bg-card p-6 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Masuk</p>
          <h2 className="mt-2 text-2xl font-semibold">Akun test SIKAWAL</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Gunakan kredensial yang sudah dipetakan ke Supabase untuk akses
            pilot.
          </p>

          <div className="mt-6">
            <LoginForm nextPath={nextPath} />
          </div>
        </section>
      </main>
    </AppShell>
  );
}
