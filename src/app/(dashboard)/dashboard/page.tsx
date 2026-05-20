import { LogoutButton } from "@/features/auth/components/logout-button";

export default function DashboardPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-4 px-6 py-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Dashboard SIKAWAL</h1>
        <LogoutButton />
      </div>
      <p className="text-sm text-muted-foreground">
        Route ini dilindungi session. Konten dashboard detail akan dibuat pada
        backlog berikutnya.
      </p>
    </main>
  );
}
