import { ClipboardCheck, FileCheck2, ShieldCheck, Users } from "lucide-react";

type GuideSection = {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  steps: string[];
  title: string;
};

const guideSections: GuideSection[] = [
  {
    icon: ClipboardCheck,
    title: "Pegawai",
    steps: [
      "Buat draft dengan link Google Docs atau dokumen awal.",
      "Pantau status di tabel dokumen sampai ada revisi atau finalisasi.",
      "Saat revisi diminta, kirim hasil revisi dengan ringkasan perubahan.",
    ],
  },
  {
    icon: Users,
    title: "Kasubbag Umum",
    steps: [
      "Buka dokumen kerja dari antrean koreksi tim.",
      "Upload snapshot jika meminta revisi atau memberi koreksi baru.",
      "Teruskan ke Kepala BPS jika hasil revisi sudah layak diverifikasi.",
    ],
  },
  {
    icon: FileCheck2,
    title: "Kepala BPS",
    steps: [
      "Periksa dokumen yang sudah melewati Kasubbag Umum.",
      "Minta revisi jika masih perlu perbaikan substansi.",
      "Setujui internal jika naskah sudah siap difinalisasi.",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Admin",
    steps: [
      "Bantu pemetaan akun, role, dan tim jika ada data pilot yang keliru.",
      "Gunakan detail dokumen untuk menelusuri versi, approval, dan audit.",
      "Jaga data pilot tetap dummy atau anonymized kecuali ada izin resmi.",
    ],
  },
];

export function PilotUserGuide() {
  return (
    <section className="rounded-lg border bg-card" id="panduan">
      <div className="border-b px-5 py-4">
        <h2 className="break-words text-lg font-semibold">Panduan Pilot</h2>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
          Gunakan alur ini saat demo internal agar koreksi, snapshot, versi, dan
          audit tetap runtut.
        </p>
      </div>
      <div className="grid divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-4">
        {guideSections.map((section) => {
          const Icon = section.icon;

          return (
            <div className="min-w-0 p-5" key={section.title}>
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                  <Icon className="h-4 w-4" aria-hidden={true} />
                </span>
                <h3 className="break-words font-semibold">{section.title}</h3>
              </div>
              <ol className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
                {section.steps.map((step, index) => (
                  <li className="flex min-w-0 gap-3" key={step}>
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-medium text-muted-foreground">
                      {index + 1}
                    </span>
                    <span className="min-w-0 break-words">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          );
        })}
      </div>
    </section>
  );
}
