import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  FileText,
  Inbox,
  Sparkles,
  Target,
  TimerReset,
} from "lucide-react";
import type { ComponentType } from "react";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { LETTER_STATUS } from "@/lib/workflow/constants";
import { statusBarTone } from "@/lib/workflow/status-style";
import { cn } from "@/lib/utils";
import type { EmployeeStatusItem } from "@/server/queries/employee-status-queries";

export type DashboardTask = {
  id: string;
  subject: string;
  teamName: string;
  status: string;
  actionLabel: string;
};

type DashboardSummaryProps = {
  activeReviewCount: number;
  approvedCount: number;
  canStartDraft: boolean;
  currentUserName: string;
  currentUserRole: string;
  draftCount: number;
  finalCount: number;
  myTasks: DashboardTask[];
  needsRevisionCount: number;
  recentDocuments: EmployeeStatusItem[];
  totalDocuments: number;
  waitingGeneralCount: number;
  waitingHeadCount: number;
};

type OverviewStat = {
  hint: string;
  href?: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
  label: string;
  tone: string;
  value: number | string;
};

type DistributionRow = {
  count: number;
  hint: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
  label: string;
  status: string;
};

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const lettersByStatusHref = (status: string) =>
  `/letters?status=${encodeURIComponent(status)}#dokumen`;

function OverviewRail({ stats }: { stats: OverviewStat[] }) {
  return (
    <dl className="mt-6 overflow-hidden rounded-lg border bg-muted/20">
      <div className="grid divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const inner = (
            <>
              <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-md",
                    stat.tone,
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                {stat.label}
              </dt>
              <dd className="text-2xl font-semibold tracking-tight">
                {stat.value}
              </dd>
              <p className="text-xs leading-5 text-muted-foreground">
                {stat.hint}
              </p>
            </>
          );

          return stat.href ? (
            <Link
              className="grid gap-3 px-4 py-4 transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none sm:min-h-28 sm:content-start"
              href={stat.href}
              key={stat.label}
            >
              {inner}
            </Link>
          ) : (
            <div
              className="grid gap-3 px-4 py-4 sm:min-h-28 sm:content-start"
              key={stat.label}
            >
              {inner}
            </div>
          );
        })}
      </div>
    </dl>
  );
}

function TaskLaunchpad({ tasks }: { tasks: DashboardTask[] }) {
  const taskCount = tasks.length;

  return (
    <div className="flex h-full flex-col rounded-lg border bg-card p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold">Tugas menunggu Anda</h2>
        </div>
        <span
          className={cn(
            "inline-flex shrink-0 items-center rounded-md px-3 py-1.5 text-sm font-medium",
            taskCount > 0
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground",
          )}
        >
          {taskCount} tugas
        </span>
      </div>

      {taskCount > 0 ? (
        <>
          <ul className="mt-4 flex flex-col gap-2">
            {tasks.slice(0, 4).map((task) => (
              <li key={task.id}>
                <Link
                  className="group flex items-start justify-between gap-3 rounded-lg border bg-muted/20 px-3 py-2.5 transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  href={`/letters/${task.id}`}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">
                      {task.subject}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                      {task.actionLabel} - {task.teamName}
                    </span>
                  </span>
                  <ArrowRight
                    className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button asChild>
              <Link href="/letters#dokumen">
                Tinjau antrean ({taskCount})
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            {taskCount > 4 ? (
              <Link
                className="text-sm font-medium text-primary hover:underline"
                href="/letters#dokumen"
              >
                +{taskCount - 4} lainnya
              </Link>
            ) : null}
          </div>
        </>
      ) : (
        <div className="mt-4 flex flex-1 flex-col items-start justify-center gap-3 rounded-lg border border-dashed bg-muted/20 p-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
            <Inbox className="h-5 w-5" aria-hidden="true" />
          </span>
          <p className="text-sm leading-6 text-muted-foreground">
            Tidak ada tugas yang menunggu aksi Anda. Semua naskah sudah
            ditindaklanjuti.
          </p>
          <Button asChild size="sm" variant="outline">
            <Link href="/letters#dokumen">
              <FileText className="h-4 w-4" aria-hidden="true" />
              Lihat semua dokumen
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}

export function DashboardSummary({
  activeReviewCount,
  approvedCount,
  canStartDraft,
  currentUserName,
  currentUserRole,
  draftCount,
  finalCount,
  myTasks,
  needsRevisionCount,
  recentDocuments,
  totalDocuments,
  waitingGeneralCount,
  waitingHeadCount,
}: DashboardSummaryProps) {
  const overviewStats: OverviewStat[] = [
    {
      hint: "Masih bergerak di pipeline koreksi internal.",
      href: "/letters#dokumen",
      icon: Sparkles,
      label: "Dokumen aktif",
      tone: "bg-primary/10 text-primary",
      value: activeReviewCount,
    },
    {
      hint: "Termasuk draft, revisi, approval, dan final.",
      href: "/letters#dokumen",
      icon: FileText,
      label: "Total dokumen",
      tone: "bg-slate-100 text-slate-700",
      value: totalDocuments,
    },
    {
      hint: "Perubahan terakhir yang masih relevan untuk dipantau.",
      icon: TimerReset,
      label: "Update terakhir",
      tone: "bg-muted text-foreground",
      value: recentDocuments[0]?.updatedAt
        ? formatDateTime(recentDocuments[0].updatedAt)
        : "Belum ada data",
    },
  ];

  const distribution: DistributionRow[] = [
    {
      count: draftCount,
      hint: "Belum diajukan ke pemeriksa.",
      icon: FileText,
      label: "Draft",
      status: LETTER_STATUS.DRAFT,
    },
    {
      count: waitingGeneralCount,
      hint: "Menunggu pemeriksaan Kasubbag Umum.",
      icon: Target,
      label: "Menunggu Kasubbag Umum",
      status: LETTER_STATUS.WAITING_GENERAL_SUBDIVISION_CORRECTION,
    },
    {
      count: needsRevisionCount,
      hint: "Kembali ke penyusun untuk diperbaiki.",
      icon: BarChart3,
      label: "Perlu Revisi",
      status: LETTER_STATUS.NEEDS_REVISION,
    },
    {
      count: waitingHeadCount,
      hint: "Menunggu approval final dari Kepala BPS.",
      icon: TimerReset,
      label: "Menunggu Kepala BPS",
      status: LETTER_STATUS.WAITING_HEAD_CORRECTION,
    },
    {
      count: approvedCount,
      hint: "Siap difinalisasi setelah pemeriksaan internal.",
      icon: ArrowRight,
      label: "Siap final",
      status: LETTER_STATUS.INTERNALLY_APPROVED,
    },
    {
      count: finalCount,
      hint: "Sudah terkunci sebagai hasil akhir.",
      icon: FileText,
      label: "Final",
      status: LETTER_STATUS.FINAL,
    },
  ];

  const distributionTotal = distribution.reduce(
    (sum, row) => sum + row.count,
    0,
  );

  return (
    <div className="flex flex-col gap-5">
      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium text-primary">Dashboard</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight">
                Ringkasan kerja
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                {currentUserName} - {currentUserRole}. Pantau apa yang menunggu
                aksi Anda, lalu lihat distribusi status dan dokumen terbaru.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {canStartDraft ? (
                <Button asChild>
                  <Link href="/letters/new">
                    <Sparkles className="h-4 w-4" aria-hidden="true" />
                    Buat Draft
                  </Link>
                </Button>
              ) : null}
              <Button asChild variant="outline">
                <Link href="/letters">
                  <FileText className="h-4 w-4" aria-hidden="true" />
                  Dokumen
                </Link>
              </Button>
            </div>
          </div>

          <OverviewRail stats={overviewStats} />
        </div>

        <TaskLaunchpad tasks={myTasks} />
      </section>

      <section className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Distribusi status</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Angka dan porsi tiap tahap. Klik baris untuk membuka daftar
              dokumen yang sudah ter-filter.
            </p>
          </div>
        </div>

        <dl className="mt-5 grid gap-2">
          {distribution.map((row) => {
            const Icon = row.icon;
            const widthPercent =
              row.count === 0 || distributionTotal === 0
                ? 0
                : Math.max((row.count / distributionTotal) * 100, 6);

            return (
              <Link
                className="group -mx-2 block rounded-lg px-2 py-2 transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                href={lettersByStatusHref(row.status)}
                key={row.label}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <dt className="text-sm font-medium group-hover:text-foreground">
                        {row.label}
                      </dt>
                      <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                        {row.hint}
                      </p>
                    </div>
                  </div>
                  <dd className="flex items-center gap-2">
                    <span className="text-2xl font-semibold tabular-nums tracking-tight">
                      {row.count}
                    </span>
                    <ArrowRight
                      className="h-4 w-4 text-muted-foreground opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100"
                      aria-hidden="true"
                    />
                  </dd>
                </div>
                <div className="mt-2 h-2.5 rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-2.5 rounded-full",
                      statusBarTone(row.status),
                    )}
                    style={{ width: `${widthPercent}%` }}
                  />
                </div>
              </Link>
            );
          })}
        </dl>
      </section>

      <section className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Dokumen terbaru</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Lihat yang paling baru bergerak, bukan daftar yang terlalu ramai.
            </p>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link href="/letters">
              Lihat semua
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>

        <div className="mt-5 grid gap-3">
          {recentDocuments.length ? (
            recentDocuments.slice(0, 5).map((item) => (
              <Link
                className="group block rounded-lg border bg-muted/20 p-4 transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                href={`/letters/${item.id}`}
                key={item.id}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="break-words font-medium">{item.subject}</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      {item.teamName} - {item.currentStageLabel}
                    </p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs leading-5 text-muted-foreground">
                  <span>{item.nextActionLabel}</span>
                  <span>-</span>
                  <span>{formatDateTime(item.updatedAt)}</span>
                </div>
              </Link>
            ))
          ) : (
            <div className="rounded-lg border border-dashed bg-muted/20 p-6">
              <p className="text-sm font-medium">Belum ada dokumen</p>
              <p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">
                Dokumen yang Anda buat atau yang menunggu aksi Anda akan muncul
                di sini, lengkap dengan status dan jejak koreksinya.
              </p>
              {canStartDraft ? (
                <Button asChild className="mt-4" size="sm">
                  <Link href="/letters/new">
                    <Sparkles className="h-4 w-4" aria-hidden="true" />
                    Buat draft pertama
                  </Link>
                </Button>
              ) : (
                <Button asChild className="mt-4" size="sm" variant="outline">
                  <Link href="/letters#dokumen">
                    <FileText className="h-4 w-4" aria-hidden="true" />
                    Lihat semua dokumen
                  </Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
