"use client";

import {
  CancelLetterForm,
  FinalLetterForm,
} from "@/features/letters/components/letter-final-actions";
import {
  LetterSummary,
  QueueHeader,
} from "@/features/letters/components/review-workflow-ui";
import type { FinalizationQueueItem } from "@/server/queries/finalization-queries";

type FinalizationQueueProps = {
  items: FinalizationQueueItem[];
};

export function FinalizationQueue({ items }: FinalizationQueueProps) {
  if (!items.length) {
    return null;
  }

  return (
    <section className="flex flex-col gap-4">
      <QueueHeader
        count={items.length}
        description="Kunci naskah final internal setelah Kepala BPS menyetujui. Versi final dibuat baru dan tidak menimpa versi koreksi."
        title="Siap Final Internal"
      />

      <div className="grid gap-4">
        {items.map((letter) => (
          <article
            className="flex flex-col gap-4 rounded-lg border bg-card p-5"
            key={letter.id}
          >
            <LetterSummary
              letter={letter}
              roundLabel={`Putaran ${letter.revisionRound}`}
            />

            <div className="grid gap-3 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
              <details className="rounded-md border bg-background p-4" open>
                <summary className="cursor-pointer text-sm font-semibold">
                  Buat Final Internal
                </summary>
                <div className="mt-4">
                  <FinalLetterForm
                    defaultGoogleDocUrl={letter.googleDocUrl}
                    letterId={letter.id}
                  />
                </div>
              </details>

              <details className="rounded-md border bg-background p-4">
                <summary className="cursor-pointer text-sm font-semibold">
                  Batalkan
                </summary>
                <div className="mt-4">
                  <CancelLetterForm letterId={letter.id} />
                </div>
              </details>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
