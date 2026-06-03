import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { EmployeeStatusTable } from "@/features/letters/components/employee-status-table";
import { FinalizationQueue } from "@/features/letters/components/finalization-queue";
import { GeneralSubdivisionQueue } from "@/features/letters/components/general-subdivision-queue";
import { HeadCorrectionQueue } from "@/features/letters/components/head-correction-queue";
import { PilotUserGuide } from "@/features/letters/components/pilot-user-guide";
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

export default async function DashboardPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  const [
    generalSubdivisionQueue,
    revisionQueue,
    headCorrectionQueue,
    finalizationQueue,
    employeeStatusItems,
  ] = await Promise.all([
    getGeneralSubdivisionCorrectionQueue(currentUser),
    getRevisionQueue(currentUser),
    getHeadCorrectionQueue(currentUser),
    getFinalizationQueue(currentUser),
    getEmployeeStatusItems(currentUser),
  ]);
  const activeReviewCount =
    generalSubdivisionQueue.length +
    revisionQueue.length +
    headCorrectionQueue.length +
    finalizationQueue.length;
  const canStartDraft = canCreateDraft(currentUser);

  return (
    <AppShell>
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-7 px-5 py-6 sm:px-6 sm:py-8">
        <section className="border-b pb-5">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium text-muted-foreground">
                Dashboard
              </p>
              <h1 className="mt-2 text-2xl font-semibold">SIKAWAL</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {currentUser.name} - {currentUser.role}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {canStartDraft ? (
                <Button asChild>
                  <Link href="/letters/new">
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Buat Draft
                  </Link>
                </Button>
              ) : null}
              <div className="rounded-md border bg-card px-4 py-3">
                <p className="text-xs font-medium text-muted-foreground">
                  Tugas aktif
                </p>
                <p className="mt-1 text-2xl font-semibold">
                  {activeReviewCount}
                </p>
              </div>
              <LogoutButton />
            </div>
          </div>
        </section>

        {activeReviewCount === 0 ? (
          <EmptyWorkflowState
            description="Tidak ada dokumen yang membutuhkan koreksi, revisi, atau persetujuan internal untuk akun ini."
            title="Tidak ada tugas aktif"
          />
        ) : (
          <>
            <GeneralSubdivisionQueue items={generalSubdivisionQueue} />
            <RevisionQueue items={revisionQueue} />
            <HeadCorrectionQueue items={headCorrectionQueue} />
            <FinalizationQueue items={finalizationQueue} />
          </>
        )}

        <EmployeeStatusTable items={employeeStatusItems} />
        <PilotUserGuide />
      </main>
    </AppShell>
  );
}
