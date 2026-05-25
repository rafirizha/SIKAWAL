import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { GeneralSubdivisionQueue } from "@/features/letters/components/general-subdivision-queue";
import {
  HeadCorrectionQueue,
  RevisionQueue,
} from "@/features/letters/components/sprint5-workflow-queues";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getGeneralSubdivisionCorrectionQueue } from "@/server/queries/general-subdivision-correction-queries";
import {
  getHeadCorrectionQueue,
  getRevisionQueue,
} from "@/server/queries/sprint5-workflow-queries";

export default async function DashboardPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  const [generalSubdivisionQueue, revisionQueue, headCorrectionQueue] =
    await Promise.all([
      getGeneralSubdivisionCorrectionQueue(currentUser),
      getRevisionQueue(currentUser),
      getHeadCorrectionQueue(currentUser),
    ]);

  return (
    <AppShell>
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-6 py-8">
        <section className="border-b pb-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Dashboard
              </p>
              <h1 className="mt-2 text-2xl font-semibold">SIKAWAL</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {currentUser.name} - {currentUser.role}
              </p>
            </div>
            <LogoutButton />
          </div>
        </section>

        <GeneralSubdivisionQueue items={generalSubdivisionQueue} />
        <RevisionQueue items={revisionQueue} />
        <HeadCorrectionQueue items={headCorrectionQueue} />
      </main>
    </AppShell>
  );
}
