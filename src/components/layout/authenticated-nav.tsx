"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  LayoutDashboard,
  PlusCircle,
  UserCircle,
} from "lucide-react";
import type React from "react";

import { cn } from "@/lib/utils";

type NavigationItem = {
  href: string;
  icon: React.ComponentType<{
    className?: string;
    "aria-hidden"?: boolean | "true" | "false";
  }>;
  isActive: (pathname: string) => boolean;
  label: string;
};

type AuthenticatedNavProps = {
  canCreateDraft: boolean;
  orientation?: "horizontal" | "vertical";
};

const baseNavigationItems: NavigationItem[] = [
  {
    href: "/dashboard",
    icon: LayoutDashboard,
    isActive: (pathname) => pathname === "/dashboard",
    label: "Dashboard",
  },
  {
    href: "/letters",
    icon: FileText,
    isActive: (pathname) =>
      pathname === "/letters" ||
      (pathname.startsWith("/letters/") && pathname !== "/letters/new"),
    label: "Dokumen",
  },
  {
    href: "/profile",
    icon: UserCircle,
    isActive: (pathname) => pathname === "/profile",
    label: "Profil",
  },
];

const createDraftItem: NavigationItem = {
  href: "/letters/new",
  icon: PlusCircle,
  isActive: (pathname) => pathname === "/letters/new",
  label: "Buat Draft",
};

export function AuthenticatedNav({
  canCreateDraft,
  orientation = "vertical",
}: AuthenticatedNavProps) {
  const pathname = usePathname();
  const items = canCreateDraft
    ? [baseNavigationItems[0], createDraftItem, ...baseNavigationItems.slice(1)]
    : baseNavigationItems;

  return (
    <nav
      aria-label="Navigasi utama"
      className={cn(
        orientation === "vertical"
          ? "grid gap-1"
          : "flex gap-2 overflow-x-auto pb-2",
      )}
    >
      {items.map((item) => {
        const Icon = item.icon;
        const active = item.isActive(pathname);

        return (
          <Link
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              orientation === "horizontal" && "shrink-0",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
            href={item.href}
            key={item.href}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
