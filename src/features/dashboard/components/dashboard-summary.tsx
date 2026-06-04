import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  FileText,
  Sparkles,
  Target,
  TimerReset,
} from "lucide-react";
import type { ComponentType } from "react";

import { Button } from "@/components/ui/button";
import { LETTER_STATUS } from "@/lib/workflow/constants";
import { cn } from "@/lib/utils";
import type { EmployeeStatusItem } from "@/server/queries/employee-status-queries";

type DashboardSummaryProps = {
  activeReviewCount: number;
  approvedCount: number;
  canStartDraft: boolean;
  currentUserName: string;
  currentUserRole: string;
  draftCount: number;
  finalCount: number;
  needsRevisionCount: number;
  recentDocuments: EmployeeStatusItem[];
  totalDocuments: number;
  waitingGeneralCount: number;
  waitingHeadCount: number;
};

type StatusBar = {
  count: number;
  fillClass: string;
  label: string;
};

type OverviewStat = {
  hint: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
  tone: string;
  value: number | string;
};

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const statusBarTone: Record<string, string> = {
  [LETTER_STATUS.DRAFT]: "bg-slate-500",
  [LETTER_STATUS.WAITING_GENERAL_SUBDIVISION_CORRECTION]: "bg-amber-500",
  [LETTER_STATUS.NEEDS_REVISION]: "bg-rose-500",
  [LETTER_STATUS.WAITING_HEAD_CORRECTION]: "bg-sky-500",
  [LETTER_STATUS.INTERNALLY_APPROVED]: "bg-emerald-500",
  [LETTER_STATUS.FINAL]: "bg-green-500",
  [LETTER_STATUS.CANCELED]: "bg-zinc-400",
};

const recentTone: Record<string, string> = {
  [LETTER_STATUS.DRAFT]: "bg-slate-100 text-slate-700",
  [LETTER_STATUS.WAITING_GENERAL_SUBDIVISION_CORRECTION]:
    "bg-amber-50 text-amber-800",
  [LETTER_STATUS.NEEDS_REVISION]: "bg-rose-50 text-rose-800",
  [LETTER_STATUS.WAITING_HEAD_CORRECTION]: "bg-sky-50 text-sky-800",
  [LETTER_STATUS.INTERNALLY_APPROVED]: "bg-emerald-50 text-emerald-800",
  [LETTER_STATUS.FINAL]: "bg-green-50 text-green-800",
  [LETTER_STATUS.CANCELED]: "bg-zinc-100 text-zinc-700",
};

function StatusChip({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2.5 py-1 text-xs font-medium leading-5",
        recentTone[status] ?? "bg-muted text-muted-foreground",
      )}
    >
      {status}
    </span>
  );
}

function OverviewRail({ stats }: { stats: OverviewStat[] }) {
  return (
    <dl className="mt-6 overflow-hidden rounded-lg border bg-muted/20">
      <div className="grid divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              className="grid gap-3 px-4 py-4 sm:min-h-28 sm:content-start"
              key={stat.label}
            >
              <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-md",
                    stat.tone,
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden={true} />
                </span>
                {stat.label}
              </dt>
              <dd className="text-2xl font-semibold tracking-tight">
                {stat.value}
              </dd>
              <p className="text-xs leading-5 text-muted-foreground">
                {stat.hint}
              </p>
            </div>
          );
        })}
      </div>
    </dl>
  );
}

function WorkflowMetricList({
  metrics,
}: {
  metrics: Array<{
    hint: string;
    icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
    label: string;
    value: number;
  }>;
}) {
  return (
    <dl className="mt-5 divide-y overflow-hidden rounded-lg border bg-muted/20">
      {metrics.map((metric) => {
        const Icon = metric.icon;

        return (
          <div
            className="grid gap-3 px-4 py-4 sm:grid-cols-[1fr_auto] sm:items-center"
            key={metric.label}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Icon className="h-4 w-4" aria-hidden={true} />
              </div>
              <div>
                <dt className="text-sm font-medium">{metric.label}</dt>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {metric.hint}
                </p>
              </div>
            </div>
            <dd className="text-left text-2xl font-semibold tracking-tight sm:text-right">
              {metric.value}
            </dd>
          </div>
        );
      })}
    </dl>
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
  needsRevisionCount,
  recentDocuments,
  totalDocuments,
  waitingGeneralCount,
  waitingHeadCount,
}: DashboardSummaryProps) {
  const statusBars: StatusBar[] = [
    {
      count: draftCount,
      fillClass: statusBarTone[LETTER_STATUS.DRAFT],
      label: "Draft",
    },
    {
      count: waitingGeneralCount,
      fillClass:
        statusBarTone[LETTER_STATUS.WAITING_GENERAL_SUBDIVISION_CORRECTION],
      label: "Menunggu Kasubbag Umum",
    },
    {
      count: needsRevisionCount,
      fillClass: statusBarTone[LETTER_STATUS.NEEDS_REVISION],
      label: "Perlu Revisi Pegawai",
    },
    {
      count: waitingHeadCount,
      fillClass: statusBarTone[LETTER_STATUS.WAITING_HEAD_CORRECTION],
      label: "Menunggu Kepala BPS",
    },
    {
      count: approvedCount,
      fillClass: statusBarTone[LETTER_STATUS.INTERNALLY_APPROVED],
      label: "Siap final",
    },
    {
      count: finalCount,
      fillClass: statusBarTone[LETTER_STATUS.FINAL],
      label: "Final",
    },
  ];

  const overviewStats: OverviewStat[] = [
    {
      hint: "Masih bergerak di pipeline koreksi internal.",
      icon: Sparkles,
      label: "Dokumen aktif",
      tone: "bg-primary/10 text-primary",
      value: activeReviewCount,
    },
    {
      hint: "Termasuk draft, revisi, approval, dan final.",
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

  const workflowMetrics = [
    {
      hint: "Belum diajukan ke pemeriksa.",
      icon: FileText,
      label: "Draft",
      value: draftCount,
    },
    {
      hint: "Menunggu pemeriksaan kasubbag umum.",
      icon: Target,
      label: "Menunggu Kasubbag Umum",
      value: waitingGeneralCount,
    },
    {
      hint: "Kembali ke penyusun untuk diperbaiki.",
      icon: BarChart3,
      label: "Perlu Revisi",
      value: needsRevisionCount,
    },
    {
      hint: "Menunggu approval final dari kepala.",
      icon: TimerReset,
      label: "Menunggu Kepala BPS",
      value: waitingHeadCount,
    },
    {
      hint: "Siap difinalisasi setelah pemeriksaan internal.",
      icon: ArrowRight,
      label: "Siap final",
      value: approvedCount,
    },
    {
      hint: "Sudah terkunci sebagai hasil akhir.",
      icon: FileText,
      label: "Final",
      value: finalCount,
    },
  ];

  const maxCount = Math.max(1, ...statusBars.map((item) => item.count));

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
                {currentUserName} - {currentUserRole}. Dashboard menampilkan
                ringkasan angka, distribusi status, dan dokumen terbaru. Detail
                pekerjaan tetap ada di Dokumen.
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

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-primary">Profil aktif</p>
              <h2 className="mt-2 text-lg font-semibold">Akun yang masuk</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Ringkas, supaya dashboard tetap fokus ke status kerja.
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Target className="h-5 w-5" aria-hidden={true} />
            </div>
          </div>

          <dl className="mt-5 space-y-3">
            <div className="flex items-center justify-between gap-4 rounded-lg bg-muted/40 px-4 py-3">
              <dt className="text-sm text-muted-foreground">Peran aktif</dt>
              <dd className="text-sm font-semibold text-foreground">
                {currentUserRole}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-lg bg-muted/40 px-4 py-3">
              <dt className="text-sm text-muted-foreground">
                Fokus berikutnya
              </dt>
              <dd className="text-sm font-semibold text-foreground">
                Cek Dokumen untuk detail kerja
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-lg bg-muted/40 px-4 py-3">
              <dt className="text-sm text-muted-foreground">Status pipeline</dt>
              <dd className="text-sm font-semibold text-foreground">
                {activeReviewCount} dokumen dalam alur
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Ringkasan angka</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Angka ini cukup untuk membaca kondisi tanpa membuka daftar kerja
                yang panjang.
              </p>
            </div>
          </div>

          <WorkflowMetricList metrics={workflowMetrics} />
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Distribusi status</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Ringkasan visual dari pipeline naskah yang kamu akses.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4">
            {statusBars.map((item) => {
              const widthPercent =
                item.count === 0
                  ? 0
                  : Math.max((item.count / maxCount) * 100, 12);

              return (
                <div key={item.label}>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <p className="font-medium">{item.label}</p>
                    <span className="text-muted-foreground">{item.count}</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-muted">
                    <div
                      className={cn("h-2 rounded-full", item.fillClass)}
                      style={{ width: `${widthPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
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
              <article
                className="rounded-lg border bg-muted/20 p-4 transition-colors hover:bg-muted/40"
                key={item.id}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="break-words font-medium">{item.subject}</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      {item.teamName} - {item.currentStageLabel}
                    </p>
                  </div>
                  <StatusChip status={item.status} />
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs leading-5 text-muted-foreground">
                  <span>{item.nextActionLabel}</span>
                  <span>-</span>
                  <span>{formatDateTime(item.updatedAt)}</span>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-lg border bg-muted/30 p-5 text-sm leading-6 text-muted-foreground">
              Belum ada dokumen aktif. Dashboard tetap siap, tinggal mulai dari
              draft pertama.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
