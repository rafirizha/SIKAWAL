import { notFound, redirect } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { LetterDetailView } from "@/features/letters/components/letter-detail-view";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getLetterDetail } from "@/server/queries/letter-detail-queries";

type LetterDetailPageProps = {
  params: Promise<{
    letterId: string;
  }>;
};

export default async function LetterDetailPage({
  params,
}: LetterDetailPageProps) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  const { letterId } = await params;
  const detail = await getLetterDetail(currentUser, letterId);

  if (!detail) {
    notFound();
  }

  return (
    <AppShell>
      <LetterDetailView detail={detail} />
    </AppShell>
  );
}
