import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmployeeStatusTable } from "@/features/letters/components/employee-status-table";
import { FinalizationQueue } from "@/features/letters/components/finalization-queue";
import { GeneralSubdivisionQueue } from "@/features/letters/components/general-subdivision-queue";
import { HeadCorrectionQueue } from "@/features/letters/components/head-correction-queue";
import { EmptyWorkflowState } from "@/features/letters/components/review-workflow-ui";
import { RevisionQueue } from "@/features/letters/components/revision-queue";
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
  const canStartDraft = canCreateDraft(currentUser);
  const activeTaskCount =
    generalSubdivisionQueue.length +
    revisionQueue.length +
    headCorrectionQueue.length +
    finalizationQueue.length;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-5 py-6 sm:px-6 sm:py-8">
      <section className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-primary">Dokumen</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">
              Daftar Dokumen
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Pantau semua naskah yang bisa kamu akses, dari draft sampai final
              internal.
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

      <section className="grid gap-5" id="tugas-aktif">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-primary">Tugas aktif</p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight">
              Aksi workflow
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
              Koreksi, approve, revisi, dan finalisasi muncul di sini sesuai
              role akun yang sedang masuk.
            </p>
          </div>
          <span className="inline-flex w-fit items-center rounded-md bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
            {activeTaskCount} tugas
          </span>
        </div>

        {activeTaskCount > 0 ? (
          <div className="grid gap-6">
            <GeneralSubdivisionQueue items={generalSubdivisionQueue} />
            <RevisionQueue items={revisionQueue} />
            <HeadCorrectionQueue items={headCorrectionQueue} />
            <FinalizationQueue items={finalizationQueue} />
          </div>
        ) : (
          <EmptyWorkflowState
            description="Tidak ada dokumen yang membutuhkan aksi dari akun ini. Daftar dokumen tetap tersedia untuk monitoring status dan audit."
            title="Tidak ada tugas aktif"
          />
        )}
      </section>

      <EmployeeStatusTable initialStatus={statusParam} items={documents} />
    </main>
  );
}
