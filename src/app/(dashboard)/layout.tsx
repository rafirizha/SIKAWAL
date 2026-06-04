import { redirect } from "next/navigation";

import { AuthenticatedShell } from "@/components/layout/authenticated-shell";
import { getCurrentUser } from "@/lib/auth/current-user";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  return (
    <AuthenticatedShell currentUser={currentUser}>
      {children}
    </AuthenticatedShell>
  );
}
