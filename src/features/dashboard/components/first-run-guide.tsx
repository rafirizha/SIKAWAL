"use client";

import { Compass, X } from "lucide-react";
import { useState, useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import { USER_ROLE } from "@/lib/workflow/constants";

const STORAGE_KEY = "sikawal-onboarding-dismissed";

const dismissListeners = new Set<() => void>();

function readDismissed() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(STORAGE_KEY) === "1";
}

function persistDismissed() {
  window.localStorage.setItem(STORAGE_KEY, "1");
  dismissListeners.forEach((listener) => listener());
}

function subscribeDismissed(onChange: () => void) {
  dismissListeners.add(onChange);
  window.addEventListener("storage", onChange);

  return () => {
    dismissListeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

type RoleGuide = {
  intro: string;
  steps: string[];
};

const roleGuides: Record<string, RoleGuide> = {
  [USER_ROLE.EMPLOYEE]: {
    intro: "Sebagai Pegawai, alur kerja Anda di SIKAWAL:",
    steps: [
      "Buat draft dengan link Google Docs atau dokumen awal, lalu ajukan ke Kasubbag Umum.",
      "Pantau status di dashboard sampai ada permintaan revisi atau finalisasi.",
      "Saat revisi diminta, kirim hasil revisi dengan ringkasan perubahan sebagai bukti.",
    ],
  },
  [USER_ROLE.GENERAL_SUBDIVISION_HEAD]: {
    intro: "Sebagai Kasubbag Umum, Anda adalah pemeriksa tahap pertama:",
    steps: [
      "Buka dokumen kerja dari antrean koreksi tim di menu Dokumen.",
      "Unggah snapshot koreksi saat meminta revisi atau memberi koreksi baru.",
      "Teruskan ke Kepala BPS jika hasil revisi sudah layak diverifikasi.",
    ],
  },
  [USER_ROLE.HEAD]: {
    intro: "Sebagai Kepala BPS, Anda adalah pemeriksa terakhir:",
    steps: [
      "Periksa dokumen yang sudah melewati Kasubbag Umum.",
      "Minta revisi jika masih perlu perbaikan substansi.",
      "Setujui internal jika naskah sudah siap difinalisasi.",
    ],
  },
  [USER_ROLE.ADMIN]: {
    intro: "Sebagai Admin, Anda menjaga data dan jejak audit:",
    steps: [
      "Bantu pemetaan akun, role, dan tim jika ada data pilot yang keliru.",
      "Gunakan detail dokumen untuk menelusuri versi, approval, dan audit.",
      "Jaga data pilot tetap dummy atau anonymized kecuali ada izin resmi.",
    ],
  },
};

type FirstRunGuideProps = {
  currentUserRole: string;
};

export function FirstRunGuide({ currentUserRole }: FirstRunGuideProps) {
  // Server renders the collapsed affordance (getServerSnapshot = true) to avoid
  // a guide flash for returning users; the client reconciles to the real value.
  const dismissed = useSyncExternalStore(
    subscribeDismissed,
    readDismissed,
    () => true,
  );
  const [open, setOpen] = useState(false);

  const guide = roleGuides[currentUserRole] ?? roleGuides[USER_ROLE.EMPLOYEE];
  const visible = !dismissed || open;

  function dismissForever() {
    persistDismissed();
    setOpen(false);
  }

  if (!visible) {
    return (
      <button
        aria-expanded={false}
        className="inline-flex w-fit items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={() => setOpen(true)}
        type="button"
      >
        <Compass className="h-4 w-4" aria-hidden="true" />
        Bagaimana alur SIKAWAL?
      </button>
    );
  }

  const isFirstRun = !dismissed;

  return (
    <section
      aria-labelledby="first-run-guide-title"
      className="rounded-lg border border-primary/20 bg-primary/5 p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Compass className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 id="first-run-guide-title" className="text-base font-semibold">
              Bagaimana alur SIKAWAL?
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {guide.intro}
            </p>
          </div>
        </div>
        <button
          aria-label="Tutup panduan"
          className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={() => (isFirstRun ? dismissForever() : setOpen(false))}
          type="button"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <ol className="mt-4 grid gap-3">
        {guide.steps.map((step, index) => (
          <li className="flex min-w-0 items-start gap-3" key={step}>
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary text-xs font-semibold text-primary-foreground">
              {index + 1}
            </span>
            <span className="text-sm leading-6">{step}</span>
          </li>
        ))}
      </ol>

      <p className="mt-4 text-xs leading-5 text-muted-foreground">
        Google Docs tetap tempat menulis dan berkomentar. SIKAWAL mengunci
        snapshot, versi, dan audit setiap koreksi.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {isFirstRun ? (
          <Button onClick={dismissForever} size="sm" variant="secondary">
            Mengerti, jangan tampilkan lagi
          </Button>
        ) : (
          <Button onClick={() => setOpen(false)} size="sm" variant="outline">
            Tutup
          </Button>
        )}
      </div>
    </section>
  );
}
