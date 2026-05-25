import Link from "next/link";
import {
  ArrowRight,
  ClipboardCheck,
  FileClock,
  History,
  ShieldCheck,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { LETTER_STATUS, VERSION_TYPE } from "@/lib/workflow/constants";

const statusItems = [
  {
    label: LETTER_STATUS.DRAFT,
    value: "0",
    helper: "Belum diajukan",
  },
  {
    label: LETTER_STATUS.WAITING_GENERAL_SUBDIVISION_CORRECTION,
    value: "0",
    helper: "Antrean tahap pertama",
  },
  {
    label: LETTER_STATUS.NEEDS_REVISION,
    value: "0",
    helper: "Menunggu penyusun",
  },
  {
    label: LETTER_STATUS.WAITING_HEAD_CORRECTION,
    value: "0",
    helper: "Validasi akhir",
  },
];

const timelinePreview = [
  {
    label: VERSION_TYPE.DRAFT_SUBMISSION,
    helper: "Naskah awal dan sumber kerja disimpan sebagai versi pertama.",
  },
  {
    label: VERSION_TYPE.CORRECTED_DRAFT,
    helper: "Snapshot koreksi dikunci saat reviewer menekan selesai.",
  },
  {
    label: VERSION_TYPE.REVISION_RESULT,
    helper: "Perubahan penyusun masuk sebagai versi baru, bukan menimpa lama.",
  },
  {
    label: VERSION_TYPE.FINAL_DOCUMENT,
    helper: "Naskah final dibuat setelah persetujuan internal lengkap.",
  },
];

const evidenceItems = [
  {
    icon: FileClock,
    label: "Status menunggu jelas",
    value: "4 tahap MVP",
  },
  {
    icon: History,
    label: "Versi tidak ditimpa",
    value: "Append-only",
  },
  {
    icon: ShieldCheck,
    label: "Audit workflow",
    value: "Server-side",
  },
];

export default function Home() {
  return (
    <AppShell>
      <main className="min-h-screen bg-[linear-gradient(180deg,hsl(var(--muted))_0%,hsl(var(--background))_32rem)]">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-7 px-5 py-6 sm:px-6 lg:py-8">
          <section className="border-b pb-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-md bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground">
                  <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
                  SIKAWAL MVP
                </div>
                <h1 className="mt-4 max-w-2xl text-3xl font-semibold leading-tight tracking-normal text-foreground sm:text-4xl">
                  Kendali koreksi internal, snapshot, dan audit naskah.
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
                  Google Docs tetap jadi ruang koreksi. SIKAWAL mengatur siapa
                  yang menunggu, versi mana yang terkunci, dan bukti apa yang
                  siap ditelusuri sebelum final atau SRIKANDI.
                </p>
              </div>

              <div className="flex shrink-0 flex-col gap-3 sm:min-w-52">
                <Button asChild>
                  <Link href="/letters/new">
                    Buat Draft
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/dashboard">Buka Dashboard</Link>
                </Button>
              </div>
            </div>

            <div className="mt-6 grid gap-3 border-t pt-5 md:grid-cols-3">
              {evidenceItems.map((item) => {
                const Icon = item.icon;

                return (
                  <div className="flex items-start gap-3" key={item.label}>
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted text-primary">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.value}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="grid gap-3 md:grid-cols-4">
            {statusItems.map((item) => (
              <div
                className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm"
                key={item.label}
              >
                <p className="min-h-10 text-sm font-medium text-muted-foreground">
                  {item.label}
                </p>
                <div className="mt-3 flex items-end justify-between gap-3">
                  <p className="text-3xl font-semibold">{item.value}</p>
                  <p className="text-right text-xs text-muted-foreground">
                    {item.helper}
                  </p>
                </div>
              </div>
            ))}
          </section>

          <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-lg border bg-card p-5 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Antrean koreksi</h2>
                  <p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">
                    Foundation sudah siap menerima flow Kasubbag Umum, snapshot
                    manual, dan audit. Data pilot akan muncul setelah workflow
                    mulai dipakai.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-5">
                <div className="bg-muted/40 p-5">
                  <p className="text-sm font-medium">
                    Belum ada dokumen aktif.
                  </p>
                  <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
                    Buat draft dummy, ajukan ke Kasubbag Umum, lalu snapshot
                    koreksi akan menjadi evidence pertama di timeline.
                  </p>
                </div>
                <div className="grid gap-4 border-t pt-5 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium">Google Docs</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Dipakai untuk komentar dan suggestion.
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">SIKAWAL</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Mengunci snapshot, status, versi, dan audit.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-card p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">Timeline versi</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Alur bukti dari draft sampai final.
                  </p>
                </div>
                <span className="rounded-md bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground">
                  Immutable
                </span>
              </div>

              <div className="mt-5 flex flex-col gap-4">
                {timelinePreview.map((item, index) => (
                  <div
                    className="grid grid-cols-[2rem_1fr] gap-3"
                    key={item.label}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary text-sm font-semibold text-secondary-foreground">
                      {index + 1}
                    </div>
                    <div className="border-b pb-4 last:border-b-0 last:pb-0">
                      <p className="text-sm font-semibold">{item.label}</p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {item.helper}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </AppShell>
  );
}
