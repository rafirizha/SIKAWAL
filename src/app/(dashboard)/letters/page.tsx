import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmployeeStatusTable } from "@/features/letters/components/employee-status-table";
import { getCurrentUser } from "@/lib/auth/current-user";
import { canCreateDraft } from "@/lib/permissions/letter-permissions";
import { getEmployeeStatusItems } from "@/server/queries/employee-status-queries";
import { getFinalizationQueue } from "@/server/queries/finalization-queries";
import { getGeneralSubdivisionCorrectionQueue } from "@/server/queries/general-subdivision-correction-queries";
import {
  getHeadCorrectionQueue,
  getRevisionQueue,
} from "@/server/queries/review-workflow-queries";

type LettersPageProps = {
  searchParams?: Promise<{ status?: string | string[] }>;
};

export default async function LettersPage({ searchParams }: LettersPageProps) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  const resolvedSearchParams = await searchParams;
  const statusParam = Array.isArray(resolvedSearchParams?.status)
    ? resolvedSearchParams?.status[0]
    : resolvedSearchParams?.status;

  const [
    documents,
    generalSubdivisionQueue,
    revisionQueue,
    headCorrectionQueue,
    finalizationQueue,
  ] = await Promise.all([
    getEmployeeStatusItems(currentUser),
    getGeneralSubdivisionCorrectionQueue(currentUser),
    getRevisionQueue(currentUser),
    getHeadCorrectionQueue(currentUser),
    getFinalizationQueue(currentUser),
  ]);

  // Letters that currently need an action from this user, so the table can flag
  // those rows. Actions themselves live on the document detail page.
  const actionableIds = Array.from(
    new Set<string>([
      ...generalSubdivisionQueue.map((item) => item.id),
      ...revisionQueue.map((item) => item.id),
      ...headCorrectionQueue.map((item) => item.id),
      ...finalizationQueue.map((item) => item.id),
    ]),
  );

  const canStartDraft = canCreateDraft(currentUser);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-screen-2xl flex-col gap-6 px-5 py-6 sm:px-6 sm:py-8">
      <section className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-primary">Dokumen</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">
              Daftar Dokumen
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Pantau semua naskah yang bisa Anda akses, dari draft sampai final
              internal. Klik baris untuk membuka detail dan menjalankan aksinya.
            </p>
          </div>
          {canStartDraft ? (
            <Button asChild>
              <Link href="/letters/new">
                <Plus className="h-4 w-4" aria-hidden="true" />
                Buat Draft
              </Link>
            </Button>
          ) : null}
        </div>
      </section>

      <EmployeeStatusTable
        actionableIds={actionableIds}
        initialStatus={statusParam}
        items={documents}
      />
    </main>
  );
}
