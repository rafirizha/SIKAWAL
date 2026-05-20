import { AppShell } from "@/components/layout/app-shell";
import { LoginForm } from "@/features/auth/components/login-form";

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
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-8">
        <section className="rounded-lg border bg-card p-6">
          <p className="text-sm font-medium text-muted-foreground">SIKAWAL</p>
          <h1 className="mt-2 text-2xl font-semibold">Masuk</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Gunakan akun test Supabase yang sudah dipetakan ke role SIKAWAL.
          </p>

          <div className="mt-6">
            <LoginForm nextPath={nextPath} />
          </div>
        </section>
      </main>
    </AppShell>
  );
}
