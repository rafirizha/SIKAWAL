import { redirect } from "next/navigation";

import { DashboardSummary } from "@/features/dashboard/components/dashboard-summary";
import { getCurrentUser } from "@/lib/auth/current-user";
import { canCreateDraft } from "@/lib/permissions/letter-permissions";
import { LETTER_STATUS } from "@/lib/workflow/constants";
import { getEmployeeStatusItems } from "@/server/queries/employee-status-queries";

export default async function DashboardPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  const employeeStatusItems = await getEmployeeStatusItems(currentUser);

  const approvedCount = employeeStatusItems.filter(
    (item) => item.status === LETTER_STATUS.INTERNALLY_APPROVED,
  ).length;
  const activeReviewCount =
    employeeStatusItems.filter(
      (item) =>
        item.status === LETTER_STATUS.WAITING_GENERAL_SUBDIVISION_CORRECTION,
    ).length +
    employeeStatusItems.filter(
      (item) => item.status === LETTER_STATUS.NEEDS_REVISION,
    ).length +
    employeeStatusItems.filter(
      (item) => item.status === LETTER_STATUS.WAITING_HEAD_CORRECTION,
    ).length +
    approvedCount;

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
  const canStartDraft = canCreateDraft(currentUser);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-7 px-5 py-6 sm:px-6 sm:py-8">
      <DashboardSummary
        activeReviewCount={activeReviewCount}
        approvedCount={approvedCount}
        canStartDraft={canStartDraft}
        currentUserName={currentUser.name}
        currentUserRole={currentUser.role}
        draftCount={draftCount}
        finalCount={finalCount}
        needsRevisionCount={needsRevisionCount}
        recentDocuments={employeeStatusItems}
        totalDocuments={employeeStatusItems.length}
        waitingGeneralCount={waitingGeneralCount}
        waitingHeadCount={waitingHeadCount}
      />
    </main>
  );
}
