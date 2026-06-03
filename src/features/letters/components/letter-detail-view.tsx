import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  FileText,
  History,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  CancelLetterForm,
  FinalLetterForm,
} from "@/features/letters/components/letter-final-actions";
import type {
  LetterDetail,
  LetterDetailAuditLog,
  LetterDetailVersion,
} from "@/server/queries/letter-detail-queries";

type LetterDetailViewProps = {
  detail: LetterDetail;
};

function formatDate(value: string) {
  const [year, month, date] = value.split("-").map(Number);

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
  }).format(new Date(year, month - 1, date));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatMetadata(metadata: LetterDetailAuditLog["metadata"]) {
  return JSON.stringify(metadata, null, 2);
}

function VersionCard({ version }: { version: LetterDetailVersion }) {
  return (
    <article className="rounded-lg border bg-card p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
              Versi {version.versionNumber}
            </span>
            <span className="rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
              {version.versionType}
            </span>
          </div>
          <h3 className="mt-3 break-words text-base font-semibold">
            {version.title}
          </h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Dibuat oleh {version.createdByName} pada{" "}
            {formatDateTime(version.createdAt)}
          </p>
          {version.reviewerRole ? (
            <p className="text-sm leading-6 text-muted-foreground">
              Reviewer: {version.reviewerName ?? version.reviewerRole} (
              {version.reviewerRole})
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {version.documentUrl ? (
            <Button asChild size="sm" variant="outline">
              <a href={version.documentUrl} rel="noreferrer" target="_blank">
                <FileText className="h-4 w-4" aria-hidden="true" />
                Unduh
              </a>
            </Button>
          ) : null}
          {version.googleDocUrl ? (
            <Button asChild size="sm" variant="outline">
              <a href={version.googleDocUrl} rel="noreferrer" target="_blank">
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                Google Docs
              </a>
            </Button>
          ) : null}
        </div>
      </div>

      <dl className="mt-4 grid gap-3 border-t pt-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="font-medium text-foreground">Sumber</dt>
          <dd className="mt-1 text-muted-foreground">{version.sourceLabel}</dd>
        </div>
        <div>
          <dt className="font-medium text-foreground">Putaran</dt>
          <dd className="mt-1 text-muted-foreground">
            {version.revisionRound}
          </dd>
        </div>
        <div>
          <dt className="font-medium text-foreground">File</dt>
          <dd className="mt-1 break-words text-muted-foreground">
            {version.fileMeta ?? "Link atau metadata dokumen"}
          </dd>
        </div>
        <div>
          <dt className="font-medium text-foreground">Checksum</dt>
          <dd className="mt-1 break-all text-muted-foreground">
            {version.checksumSha256?.slice(0, 16) ?? "Tidak ada"}
          </dd>
        </div>
      </dl>

      {version.notes || version.changeSummary || version.hasCommentsJson ? (
        <div className="mt-4 grid gap-3 border-t pt-4 md:grid-cols-2">
          {version.notes ? (
            <div>
              <p className="text-sm font-medium">Catatan</p>
              <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">
                {version.notes}
              </p>
            </div>
          ) : null}
          {version.changeSummary ? (
            <div>
              <p className="text-sm font-medium">Ringkasan Perubahan</p>
              <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">
                {version.changeSummary}
              </p>
            </div>
          ) : null}
          {version.hasCommentsJson ? (
            <p className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
              Metadata komentar Google Docs tersimpan.
            </p>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

export function LetterDetailView({ detail }: LetterDetailViewProps) {
  const showActions = detail.canCreateFinal || detail.canCancel;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-5 py-6 sm:px-6 sm:py-8">
      <div>
        <Button asChild size="sm" variant="ghost">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Dashboard
          </Link>
        </Button>
      </div>

      <section className="border-b pb-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-muted-foreground">
              Detail Naskah
            </p>
            <h1 className="mt-2 break-words text-2xl font-semibold leading-8">
              {detail.subject}
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {detail.teamName} oleh {detail.creatorName}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-secondary px-3 py-2 text-sm font-semibold text-secondary-foreground">
              {detail.status}
            </span>
            {detail.googleDocUrl ? (
              <Button asChild size="sm" variant="outline">
                <a href={detail.googleDocUrl} rel="noreferrer" target="_blank">
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  Google Docs
                </a>
              </Button>
            ) : null}
          </div>
        </div>

        <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="font-medium text-foreground">Tujuan</dt>
            <dd className="mt-1 break-words text-muted-foreground">
              {detail.recipient}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-foreground">Tanggal Naskah</dt>
            <dd className="mt-1 text-muted-foreground">
              {formatDate(detail.letterDate)}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-foreground">Putaran Revisi</dt>
            <dd className="mt-1 text-muted-foreground">
              {detail.revisionRound}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-foreground">Update Terakhir</dt>
            <dd className="mt-1 text-muted-foreground">
              {formatDateTime(detail.updatedAt)}
            </dd>
          </div>
        </dl>

        {detail.cancelReason ? (
          <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <p className="font-medium">Alasan pembatalan</p>
            <p className="mt-1 whitespace-pre-wrap break-words">
              {detail.cancelReason}
            </p>
          </div>
        ) : null}
      </section>

      {showActions ? (
        <section className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
          {detail.canCreateFinal ? (
            <details className="rounded-lg border bg-card p-5" open>
              <summary className="cursor-pointer text-sm font-semibold">
                Buat Final Internal
              </summary>
              <div className="mt-4">
                <FinalLetterForm
                  defaultGoogleDocUrl={detail.googleDocUrl}
                  letterId={detail.id}
                />
              </div>
            </details>
          ) : null}

          {detail.canCancel ? (
            <details className="rounded-lg border bg-card p-5">
              <summary className="cursor-pointer text-sm font-semibold">
                Batalkan Dokumen
              </summary>
              <div className="mt-4">
                <CancelLetterForm letterId={detail.id} />
              </div>
            </details>
          ) : null}
        </section>
      ) : null}

      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" aria-hidden="true" />
          <div>
            <h2 className="text-lg font-semibold">Timeline Versi</h2>
            <p className="text-sm text-muted-foreground">
              Semua versi bersifat append-only, snapshot lama tidak tertimpa.
            </p>
          </div>
        </div>

        {detail.versions.length ? (
          <div className="grid gap-4">
            {detail.versions.map((version) => (
              <VersionCard key={version.id} version={version} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border bg-card p-5 text-sm text-muted-foreground">
            Belum ada versi dokumen.
          </div>
        )}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border bg-card p-5">
          <h2 className="text-lg font-semibold">Riwayat Approval</h2>
          <div className="mt-4 grid gap-3">
            {detail.approvals.length ? (
              detail.approvals.map((approval) => (
                <div className="rounded-md bg-muted/50 p-3" key={approval.id}>
                  <p className="text-sm font-semibold">{approval.action}</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {approval.actorName} ({approval.actorRole}) pada{" "}
                    {formatDateTime(approval.createdAt)}
                  </p>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {approval.fromStatus ?? "-"} menuju{" "}
                    {approval.toStatus ?? "-"}
                  </p>
                  {approval.notes ? (
                    <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">
                      {approval.notes}
                    </p>
                  ) : null}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                Belum ada approval.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-lg border bg-card p-5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-lg font-semibold">Audit Log</h2>
          </div>

          {detail.canViewAudit ? (
            <div className="mt-4 grid gap-3">
              {detail.auditLogs.length ? (
                detail.auditLogs.map((audit) => (
                  <details
                    className="rounded-md bg-muted/50 p-3"
                    key={audit.id}
                  >
                    <summary className="cursor-pointer text-sm font-semibold">
                      {audit.action}
                    </summary>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {audit.actorName ?? "System"}{" "}
                      {audit.actorRole ? `(${audit.actorRole})` : ""} pada{" "}
                      {formatDateTime(audit.createdAt)}
                    </p>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {audit.fromStatus ?? "-"} menuju {audit.toStatus ?? "-"}
                    </p>
                    <pre className="mt-3 max-h-60 overflow-auto rounded-md bg-background p-3 text-xs leading-5 text-muted-foreground">
                      {formatMetadata(audit.metadata)}
                    </pre>
                  </details>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Belum ada audit log.
                </p>
              )}
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              Audit log hanya ditampilkan sesuai permission.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
