"use client";

import Link from "next/link";
import { ExternalLink, Eye, FileText, ListFilter, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  formatDate,
  formatDateTime,
} from "@/features/letters/components/review-workflow-ui";
import { LETTER_STATUS } from "@/lib/workflow/constants";
import type { EmployeeStatusItem } from "@/server/queries/employee-status-queries";
import type { LetterStatus } from "@/types/domain";

type EmployeeStatusTableProps = {
  items: EmployeeStatusItem[];
};

const statusTone: Record<LetterStatus, string> = {
  [LETTER_STATUS.DRAFT]: "bg-slate-100 text-slate-700",
  [LETTER_STATUS.WAITING_GENERAL_SUBDIVISION_CORRECTION]:
    "bg-amber-50 text-amber-800",
  [LETTER_STATUS.NEEDS_REVISION]: "bg-red-50 text-red-800",
  [LETTER_STATUS.WAITING_HEAD_CORRECTION]: "bg-blue-50 text-blue-800",
  [LETTER_STATUS.INTERNALLY_APPROVED]: "bg-emerald-50 text-emerald-800",
  [LETTER_STATUS.FINAL]: "bg-green-50 text-green-800",
  [LETTER_STATUS.CANCELED]: "bg-zinc-100 text-zinc-700",
};

function normalizeSearchValue(value: string) {
  return value.trim().toLowerCase();
}

function matchesSearch(item: EmployeeStatusItem, query: string) {
  if (!query) {
    return true;
  }

  const searchableValues = [
    item.subject,
    item.recipient,
    item.status,
    item.teamName,
    item.currentStageLabel,
    item.nextActionLabel,
    item.latestVersionTitle,
    item.latestVersionType,
  ];

  return searchableValues.some((value) => value?.toLowerCase().includes(query));
}

function getVersionLabel(item: EmployeeStatusItem) {
  if (!item.latestVersionTitle || !item.latestVersionNumber) {
    return "Belum ada versi";
  }

  return `v${item.latestVersionNumber} - ${item.latestVersionTitle}`;
}

function StatusBadge({ status }: { status: LetterStatus }) {
  return (
    <span
      className={`inline-flex max-w-full rounded-md px-2.5 py-1 text-xs font-medium leading-5 ${statusTone[status]}`}
    >
      {status}
    </span>
  );
}

function DocumentActions({ item }: { item: EmployeeStatusItem }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button asChild size="sm" variant="outline">
        <Link href={`/letters/${item.id}`}>
          <Eye className="h-4 w-4" aria-hidden="true" />
          Detail
        </Link>
      </Button>
      {item.storedDocumentUrl ? (
        <Button asChild size="sm" variant="outline">
          <a
            href={item.storedDocumentUrl}
            rel="noreferrer"
            target="_blank"
            title={item.storedDocumentMeta ?? undefined}
          >
            <FileText className="h-4 w-4" aria-hidden="true" />
            Unduh
          </a>
        </Button>
      ) : null}
      {item.googleDocUrl ? (
        <Button asChild size="sm" variant="outline">
          <a href={item.googleDocUrl} rel="noreferrer" target="_blank">
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            Docs
          </a>
        </Button>
      ) : null}
    </div>
  );
}

export function EmployeeStatusTable({ items }: EmployeeStatusTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const statusOptions = useMemo(
    () => Array.from(new Set(items.map((item) => item.status))),
    [items],
  );
  const filteredItems = useMemo(() => {
    const normalizedQuery = normalizeSearchValue(searchQuery);

    return items.filter((item) => {
      const statusMatches =
        selectedStatus === "all" || item.status === selectedStatus;

      return statusMatches && matchesSearch(item, normalizedQuery);
    });
  }, [items, searchQuery, selectedStatus]);

  return (
    <section className="rounded-lg border bg-card">
      <div className="border-b px-5 py-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <h2 className="break-words text-lg font-semibold">
              Status Dokumen Saya
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
              Pantau posisi naskah, versi terakhir, dan dokumen kerja yang
              tersimpan di SIKAWAL.
            </p>
          </div>
          <span className="inline-flex w-fit items-center rounded-md bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground">
            {items.length} dokumen
          </span>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_240px]">
          <label className="relative block">
            <span className="sr-only">Cari dokumen</span>
            <Search
              className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              className="h-10 w-full rounded-md border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Cari perihal, status, tujuan, atau tim"
              type="search"
              value={searchQuery}
            />
          </label>

          <label className="relative block">
            <span className="sr-only">Filter status</span>
            <ListFilter
              className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
            <select
              className="h-10 w-full rounded-md border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              onChange={(event) => setSelectedStatus(event.target.value)}
              value={selectedStatus}
            >
              <option value="all">Semua status</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="px-5 py-8 text-sm leading-6 text-muted-foreground">
          Belum ada dokumen yang dibuat akun ini.
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="px-5 py-8 text-sm leading-6 text-muted-foreground">
          Tidak ada dokumen yang cocok dengan pencarian.
        </div>
      ) : (
        <>
          <div className="divide-y lg:hidden">
            {filteredItems.map((item) => (
              <article className="px-5 py-4" key={item.id}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="break-words font-medium">{item.subject}</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      {item.recipient} • {formatDate(item.letterDate)}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      {item.teamName}
                    </p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>

                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <div className="min-w-0">
                    <dt className="text-xs font-medium text-muted-foreground">
                      Tahap
                    </dt>
                    <dd className="mt-1 break-words font-medium">
                      {item.currentStageLabel}
                    </dd>
                    <dd className="mt-1 break-words text-xs leading-5 text-muted-foreground">
                      {item.nextActionLabel}, putaran {item.revisionRound}
                    </dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-xs font-medium text-muted-foreground">
                      Versi
                    </dt>
                    <dd className="mt-1 break-words font-medium">
                      {getVersionLabel(item)}
                    </dd>
                    {item.storedDocumentMeta ? (
                      <dd className="mt-1 break-words text-xs leading-5 text-muted-foreground">
                        {item.storedDocumentMeta}
                      </dd>
                    ) : null}
                  </div>
                  <div className="min-w-0">
                    <dt className="text-xs font-medium text-muted-foreground">
                      Update
                    </dt>
                    <dd className="mt-1 break-words">
                      {formatDateTime(item.updatedAt)}
                    </dd>
                  </div>
                </dl>

                <div className="mt-4">
                  <DocumentActions item={item} />
                </div>
              </article>
            ))}
          </div>

          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[980px] table-fixed text-left text-sm">
              <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="w-[28%] px-5 py-3 font-medium">Dokumen</th>
                  <th className="w-[18%] px-4 py-3 font-medium">Status</th>
                  <th className="w-[17%] px-4 py-3 font-medium">Tahap</th>
                  <th className="w-[22%] px-4 py-3 font-medium">Versi</th>
                  <th className="w-[15%] px-4 py-3 font-medium">Update</th>
                  <th className="w-[170px] px-5 py-3 text-right font-medium">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="align-top">
                    <td className="px-5 py-4">
                      <p className="break-words font-medium">{item.subject}</p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {item.recipient} • {formatDate(item.letterDate)}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {item.teamName}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-4 py-4">
                      <p className="break-words font-medium">
                        {item.currentStageLabel}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {item.nextActionLabel}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        Putaran {item.revisionRound}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="break-words font-medium">
                        {getVersionLabel(item)}
                      </p>
                      {item.storedDocumentMeta ? (
                        <p className="mt-1 break-words text-xs leading-5 text-muted-foreground">
                          {item.storedDocumentMeta}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      {formatDateTime(item.updatedAt)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end">
                        <DocumentActions item={item} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
