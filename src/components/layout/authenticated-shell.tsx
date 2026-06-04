import { ClipboardCheck } from "lucide-react";

import { AuthenticatedNav } from "@/components/layout/authenticated-nav";
import { AppShell } from "@/components/layout/app-shell";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { canCreateDraft } from "@/lib/permissions/letter-permissions";
import type { DomainUser } from "@/types/domain";
import type React from "react";

type AuthenticatedShellProps = {
  children: React.ReactNode;
  currentUser: DomainUser;
};

export function AuthenticatedShell({
  children,
  currentUser,
}: AuthenticatedShellProps) {
  const canStartDraft = canCreateDraft(currentUser);

  return (
    <AppShell>
      <div className="min-h-screen lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
        <aside className="hidden border-r bg-card/95 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
          <div className="border-b px-5 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <ClipboardCheck className="h-5 w-5" aria-hidden={true} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold">SIKAWAL</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Alur internal
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-5 px-4 py-5">
            <AuthenticatedNav canCreateDraft={canStartDraft} />

            <div
              className="mt-auto rounded-lg border bg-muted/30 p-4"
              id="profile"
            >
              <p className="text-xs font-medium uppercase text-muted-foreground">
                Profil
              </p>
              <p className="mt-2 break-words text-sm font-semibold">
                {currentUser.name}
              </p>
              <p className="mt-1 break-words text-xs leading-5 text-muted-foreground">
                {currentUser.email}
              </p>
              <span className="mt-3 inline-flex rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                {currentUser.role}
              </span>
            </div>

            <LogoutButton />
          </div>
        </aside>

        <div className="min-w-0">
          <header className="sticky top-0 z-20 border-b bg-background/95 px-5 py-3 backdrop-blur lg:hidden">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold">SIKAWAL</p>
                <p className="truncate text-xs text-muted-foreground">
                  {currentUser.name} - {currentUser.role}
                </p>
              </div>
              <LogoutButton />
            </div>
            <div className="mt-3">
              <AuthenticatedNav
                canCreateDraft={canStartDraft}
                orientation="horizontal"
              />
            </div>
          </header>

          {children}
        </div>
      </div>
    </AppShell>
  );
}
