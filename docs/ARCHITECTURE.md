# Architecture

## Tujuan Arsitektur

SIKAWAL adalah workflow system untuk koreksi internal naskah. Fokusnya bukan membuat editor dokumen dan bukan menggantikan SRIKANDI, tetapi mengelola:

- status koreksi,
- role verifikator,
- snapshot bukti koreksi,
- riwayat versi,
- hasil revisi,
- finalisasi internal,
- audit trail.

## Tech Stack MVP

- Next.js App Router.
- TypeScript.
- Tailwind CSS.
- shadcn/ui.
- Supabase Auth.
- Supabase Postgres.
- Supabase Storage lewat adapter.
- Vercel untuk preview/testing.
- Google Docs untuk komentar/suggestion.
- Google Apps Script sebagai bridge opsional untuk export snapshot.

Fallback wajib:

- Jika Apps Script/export otomatis gagal, verifikator dapat upload DOCX/PDF snapshot manual.
- Detail workflow ada di `docs/GOOGLE_DOCS_SNAPSHOT_WORKFLOW.md`.

## Layer Aplikasi

Struktur awal:

```text
src/
  app/
    (auth)/
    (dashboard)/
    api/
  components/
    ui/
    layout/
  features/
    letters/
    correction/
    revisions/
    dashboard/
    admin/
  lib/
    auth/
    audit/
    db/
    google/
    permissions/
    snapshots/
    storage/
    supabase/
    validation/
    workflow/
  server/
    actions/
    queries/
  types/
```

## Naming Convention

Ikuti `docs/NAMING_CONVENTIONS.md`.

Ringkasan:

- Database table/column: `snake_case`.
- TypeScript variable/function: `camelCase`.
- React component/type/interface: `PascalCase`.
- File/folder source: `kebab-case`.
- Constant object: `UPPER_SNAKE_CASE`.
- UI label bahasa Indonesia, code teknis bahasa Inggris.

## Boundary Penting

### UI Layer

Tugas UI:

- Menampilkan dashboard, detail, timeline, dan form.
- Mengumpulkan input.
- Membuka link Google Docs.
- Memanggil server action/API.
- Menampilkan loading, empty, error, dan success state.

UI tidak boleh menjadi sumber utama:

- Validasi permission final.
- Transisi status.
- Pembuatan snapshot.
- Pembuatan audit log.
- Keputusan reviewer berikutnya.

### Server Actions/API Layer

Contoh action:

```text
createDraftLetter()
submitDraftToGeneralSubdivision()
completeGeneralSubdivisionCorrection()
submitRevision()
forwardToHead()
completeHeadCorrection()
approveInternal()
createFinalVersion()
updateSrikandiReference()
cancelLetter()
```

Tugas:

- Validasi input.
- Validasi session dan role.
- Memanggil domain service.
- Mengatur transaction.
- Mengembalikan error yang jelas.

### Domain Layer

Folder utama:

```text
lib/workflow/
lib/permissions/
lib/snapshots/
lib/audit/
```

Tugas:

- Menentukan status transition valid.
- Menentukan reviewer berikutnya.
- Mengecek permission.
- Menentukan version type dan revision round.
- Memastikan evidence snapshot cukup.
- Memastikan audit log dibuat.

### Google Integration Layer

Folder:

```text
lib/google/
```

Tugas:

- Extract Google Doc ID dari URL.
- Validasi format URL Google Docs.
- Memanggil Apps Script/Google export adapter jika tersedia.
- Menyediakan fallback mode saat export gagal.

Google-specific logic tidak boleh tersebar di UI atau domain workflow.

### Storage Layer

Folder:

```text
lib/storage/
```

Interface:

```text
uploadLetterDocument()
uploadCorrectionSnapshot()
getLetterDocumentUrl()
deleteTemporaryUpload()
```

Jangan memanggil Supabase Storage langsung dari component atau domain workflow.

## Anti Vendor Lock-In

Hindari:

- Logic workflow hanya di Apps Script.
- Supabase-specific call tersebar di component.
- Vercel-specific runtime untuk core workflow.
- Google Docs sebagai satu-satunya arsip bukti tanpa snapshot di SIKAWAL.

Boleh:

- Google Docs untuk koreksi.
- Apps Script untuk bridge export snapshot.
- Supabase Storage lewat adapter.
- Supabase Auth dengan mapping ke tabel `users`.

## Environment

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SECRET_KEY
APP_BASE_URL
MAX_DOCX_UPLOAD_MB
MAX_PDF_UPLOAD_MB
DATA_PILOT_MODE
STORAGE_PROVIDER
LETTER_DOCUMENTS_BUCKET
GOOGLE_APPS_SCRIPT_EXPORT_URL
GOOGLE_APPS_SCRIPT_SHARED_SECRET
GOOGLE_APPS_SCRIPT_TIMEOUT_MS
GOOGLE_INTEGRATION_MODE
```

Jangan hardcode URL provider, bucket, Apps Script URL, atau domain deployment di business logic.
