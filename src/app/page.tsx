import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { LETTER_STATUS, VERSION_TYPE } from "@/lib/workflow/constants";

const statusItems = [
  {
    label: LETTER_STATUS.DRAFT,
    value: "0",
  },
  {
    label: LETTER_STATUS.WAITING_TEAM_LEAD_CORRECTION,
    value: "0",
  },
  {
    label: LETTER_STATUS.NEEDS_REVISION,
    value: "0",
  },
  {
    label: LETTER_STATUS.WAITING_HEAD_CORRECTION,
    value: "0",
  },
];

const timelinePreview = [
  VERSION_TYPE.DRAFT_SUBMISSION,
  VERSION_TYPE.CORRECTED_DRAFT,
  VERSION_TYPE.REVISION_RESULT,
  VERSION_TYPE.FINAL_DOCUMENT,
];

export default function Home() {
  return (
    <AppShell>
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-6 py-8">
        <section className="flex flex-col gap-3 border-b pb-6">
          <p className="text-sm font-medium text-muted-foreground">SIKAWAL</p>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <h1 className="text-3xl font-semibold tracking-normal">
                Kendali koreksi internal dan bukti revisi naskah.
              </h1>
              <p className="mt-3 text-base leading-7 text-muted-foreground">
                Google Docs dipakai untuk koreksi, SIKAWAL mengunci snapshot,
                history versi, status, dan audit sebelum final atau SRIKANDI.
              </p>
            </div>
            <Button type="button">Buat Draft</Button>
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-4">
          {statusItems.map((item) => (
            <div
              className="rounded-lg border bg-card p-4 text-card-foreground"
              key={item.label}
            >
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <p className="mt-3 text-2xl font-semibold">{item.value}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-lg border bg-card p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Antrean koreksi</h2>
                <p className="text-sm text-muted-foreground">
                  Belum ada data pilot. Foundation app sudah siap menerima modul
                  workflow berikutnya.
                </p>
              </div>
              <Button type="button" variant="secondary">
                Refresh
              </Button>
            </div>
            <div className="mt-6 rounded-md border border-dashed p-6 text-sm text-muted-foreground">
              Data dummy akan muncul setelah BL-009 sampai BL-013 selesai.
            </div>
          </div>

          <div className="rounded-lg border bg-card p-5">
            <h2 className="text-lg font-semibold">Timeline versi</h2>
            <div className="mt-4 flex flex-col gap-3">
              {timelinePreview.map((item, index) => (
                <div className="flex gap-3" key={item}>
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-medium text-secondary-foreground">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{item}</p>
                    <p className="text-sm text-muted-foreground">
                      Snapshot dan audit akan dikaitkan di tahap backend core.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </AppShell>
  );
}
