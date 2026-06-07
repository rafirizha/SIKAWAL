"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ListFilter, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  formatDate,
  formatDateTime,
} from "@/features/letters/components/review-workflow-ui";
import type { EmployeeStatusItem } from "@/server/queries/employee-status-queries";

type EmployeeStatusTableProps = {
  items: EmployeeStatusItem[];
  initialStatus?: string;
  actionableIds?: string[];
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

function ActionableBadge() {
  return (
    <span className="inline-flex w-fit items-center gap-1.5 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
      <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
      Perlu aksi
    </span>
  );
}

export function EmployeeStatusTable({
  items,
  initialStatus,
  actionableIds = [],
}: EmployeeStatusTableProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const statusOptions = useMemo(
    () => Array.from(new Set(items.map((item) => item.status))),
    [items],
  );
  const actionableSet = useMemo(
    () => new Set(actionableIds),
    [actionableIds],
  );
  const [selectedStatus, setSelectedStatus] = useState(() =>
    initialStatus && statusOptions.some((option) => option === initialStatus)
      ? initialStatus
      : "all",
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
    <section className="rounded-lg border bg-card" id="dokumen">
      <div className="border-b px-5 py-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <h2 className="break-words text-lg font-semibold">
              Status Dokumen
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
              Klik baris untuk membuka detail naskah, melihat versi, dan
              menjalankan aksi yang tersedia.
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
            <Input
              className="pl-9"
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
            <Select
              className="pl-9"
              onChange={(event) => setSelectedStatus(event.target.value)}
              value={selectedStatus}
            >
              <option value="all">Semua status</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>
          </label>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <p className="text-sm font-medium">Belum ada dokumen</p>
          <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-muted-foreground">
            Naskah yang bisa Anda akses akan tampil di sini beserta status,
            versi terakhir, dan dokumen kerja yang tersimpan.
          </p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="px-5 py-8 text-sm leading-6 text-muted-foreground">
          Tidak ada dokumen yang cocok dengan pencarian.
        </div>
      ) : (
        <>
          <div className="divide-y lg:hidden">
            {filteredItems.map((item) => (
              <Link
                className="block px-5 py-4 transition-colors hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:outline-none"
                href={`/letters/${item.id}`}
                key={item.id}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="break-words font-medium">{item.subject}</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      {item.recipient} - {formatDate(item.letterDate)}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      {item.teamName}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-start gap-1.5 sm:items-end">
                    <StatusBadge status={item.status} />
                    {actionableSet.has(item.id) ? <ActionableBadge /> : null}
                  </div>
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
              </Link>
            ))}
          </div>

          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[860px] table-fixed text-left text-sm">
              <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="w-[32%] px-5 py-3 font-medium">Dokumen</th>
                  <th className="w-[20%] px-4 py-3 font-medium">Status</th>
                  <th className="w-[18%] px-4 py-3 font-medium">Tahap</th>
                  <th className="w-[18%] px-4 py-3 font-medium">Versi</th>
                  <th className="w-[12%] px-4 py-3 font-medium">Update</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className="cursor-pointer align-top transition-colors hover:bg-muted/40"
                    onClick={() => router.push(`/letters/${item.id}`)}
                  >
                    <td className="px-5 py-4">
                      <Link
                        className="break-words font-medium hover:underline focus-visible:underline focus-visible:outline-none"
                        href={`/letters/${item.id}`}
                        onClick={(event) => event.stopPropagation()}
                      >
                        {item.subject}
                      </Link>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {item.recipient} - {formatDate(item.letterDate)}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {item.teamName}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col items-start gap-1.5">
                        <StatusBadge status={item.status} />
                        {actionableSet.has(item.id) ? <ActionableBadge /> : null}
                      </div>
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
