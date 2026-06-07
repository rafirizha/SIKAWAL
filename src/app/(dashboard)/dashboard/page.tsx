import { redirect } from "next/navigation";

import {
  DashboardSummary,
  type DashboardTask,
} from "@/features/dashboard/components/dashboard-summary";
import { FirstRunGuide } from "@/features/dashboard/components/first-run-guide";
import { getCurrentUser } from "@/lib/auth/current-user";
import { canCreateDraft } from "@/lib/permissions/letter-permissions";
import { LETTER_STATUS } from "@/lib/workflow/constants";
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
    employeeStatusItems,
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

  const myTasks: DashboardTask[] = [
    ...generalSubdivisionQueue.map((letter) => ({
      id: letter.id,
      subject: letter.subject,
      teamName: letter.teamName,
      status: letter.status,
      actionLabel: "Koreksi Kasubbag Umum",
    })),
    ...revisionQueue.map((letter) => ({
      id: letter.id,
      subject: letter.subject,
      teamName: letter.teamName,
      status: letter.status,
      actionLabel: "Kirim revisi",
    })),
    ...headCorrectionQueue.map((letter) => ({
      id: letter.id,
      subject: letter.subject,
      teamName: letter.teamName,
      status: letter.status,
      actionLabel: "Tinjau Kepala BPS",
    })),
    ...finalizationQueue.map((letter) => ({
      id: letter.id,
      subject: letter.subject,
      teamName: letter.teamName,
      status: letter.status,
      actionLabel: "Finalisasi",
    })),
  ];

  const approvedCount = employeeStatusItems.filter(
    (item) => item.status === LETTER_STATUS.INTERNALLY_APPROVED,
  ).length;
  const draftCount = employeeStatusItems.filter(
    (item) => item.status === LETTER_STATUS.DRAFT,
  ).length;
  const waitingGeneralCount = employeeStatusItems.filter(
    (item) =>
      item.status === LETTER_STATUS.WAITING_GENERAL_SUBDIVISION_CORRECTION,
  ).length;
  const needsRevisionCount = employeeStatusItems.filter(
    (item) => item.status === LETTER_STATUS.NEEDS_REVISION,
  ).length;
  const waitingHeadCount = employeeStatusItems.filter(
    (item) => item.status === LETTER_STATUS.WAITING_HEAD_CORRECTION,
  ).length;
  const finalCount = employeeStatusItems.filter(
    (item) => item.status === LETTER_STATUS.FINAL,
  ).length;
  const activeReviewCount =
    waitingGeneralCount + needsRevisionCount + waitingHeadCount + approvedCount;
  const canStartDraft = canCreateDraft(currentUser);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-screen-2xl flex-col gap-7 px-5 py-6 sm:px-6 sm:py-8">
      <FirstRunGuide currentUserRole={currentUser.role} />
      <DashboardSummary
        activeReviewCount={activeReviewCount}
        approvedCount={approvedCount}
        canStartDraft={canStartDraft}
        currentUserName={currentUser.name}
        currentUserRole={currentUser.role}
        draftCount={draftCount}
        finalCount={finalCount}
        myTasks={myTasks}
        needsRevisionCount={needsRevisionCount}
        recentDocuments={employeeStatusItems}
        totalDocuments={employeeStatusItems.length}
        waitingGeneralCount={waitingGeneralCount}
        waitingHeadCount={waitingHeadCount}
      />
    </main>
  );
}
