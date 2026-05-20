# Naming Conventions

Dokumen ini mengunci aturan penamaan untuk SIKAWAL agar kode, database, dan UI tetap konsisten sejak awal.

## Prinsip Umum

- Nama teknis di code memakai bahasa Inggris.
- Label, teks UI, dan istilah yang terlihat user memakai bahasa Indonesia.
- Database memakai `snake_case` agar PostgreSQL-friendly.
- TypeScript application code memakai `camelCase` dan `PascalCase`.
- Jangan menyebarkan string status atau role mentah di banyak file. Gunakan constant/domain type.
- Jangan mencampur istilah Indonesia dan Inggris untuk konsep teknis yang sama.

Contoh:

```text
Code: createDraftLetter, correctionSnapshot, approvalAction
UI: Buat Draft, Selesai Koreksi, Menunggu Koreksi Ketua Tim
DB: letters, letter_versions, correction_snapshot_jobs
```

## Database

Gunakan `snake_case`.

- Table: plural snake_case.
- Column: singular/contextual snake_case.
- Index/constraint: descriptive snake_case.
- Migration file: timestamp + kebab/snake readable name.

Contoh:

```text
letters
letter_versions
correction_snapshot_jobs
audit_logs

letter_id
creator_user_id
revision_target_role
data_classification

idx_letters_status
idx_letter_versions_letter_id
idx_correction_snapshot_jobs_letter_id
```

Nilai status yang disimpan di database mengikuti domain docs, misalnya `Draft`, `Menunggu Koreksi Ketua Tim`, dan `Final`. Di TypeScript, nilai tersebut wajib dibungkus constant agar tidak tersebar sebagai string literal.

## TypeScript

Gunakan `camelCase` untuk variable, function, parameter, dan property application/domain object.

Contoh:

```ts
const letterId = input.letterId;
const currentUser = await getCurrentUser();

function canSubmitLetter(user: User, letter: Letter) {
  return user.id === letter.creatorUserId && letter.status === LETTER_STATUS.DRAFT;
}
```

Boolean memakai awalan yang jelas:

```text
isActive
hasPermission
canSubmitLetter
shouldRequireInsertionApproval
```

## React dan Type

Gunakan `PascalCase` untuk component, type, interface, dan schema/domain model.

Contoh:

```text
CreateLetterForm
LetterTimeline
LetterDetailPage
LetterStatus
UserRole
NumberReservation
```

Custom hook memakai `use` + `PascalCase` concept:

```text
useLetterDraft
useClassificationSearch
useLetterPermissions
```

## Files dan Folders

Gunakan `kebab-case` untuk file dan folder source code.

Contoh:

```text
create-letter-form.tsx
letter-timeline.tsx
submit-letter-action.ts
number-reservation-service.ts
classification-search.ts
```

Next.js route folder juga memakai `kebab-case`, dengan pengecualian dynamic segment boleh memakai `camelCase` agar nama param di code rapi.

Contoh:

```text
src/app/(dashboard)/letters/[letterId]/page.tsx
src/app/(dashboard)/number-reservations/page.tsx
```

## Constants dan Enum-Like Values

Gunakan `UPPER_SNAKE_CASE` untuk nama constant object. Value yang tersimpan di DB atau tampil di UI tetap mengikuti domain docs.

Contoh:

```ts
export const LETTER_STATUS = {
  DRAFT: "Draft",
  WAITING_TEAM_LEAD_CORRECTION: "Menunggu Koreksi Ketua Tim",
  NEEDS_REVISION: "Perlu Revisi",
  WAITING_HEAD_CORRECTION: "Menunggu Koreksi Kepala BPS",
  INTERNALLY_APPROVED: "Disetujui Internal",
  FINAL: "Final",
  CANCELED: "Dibatalkan",
} as const;
```

Role juga harus dibungkus constant:

```ts
export const USER_ROLE = {
  EMPLOYEE: "Pegawai",
  TEAM_LEAD: "Ketua Tim",
  HEAD: "Kepala BPS",
  ADMIN: "Admin",
} as const;
```

## Boundary Database ke Application Code

Database row dari Supabase/PostgreSQL boleh berbentuk `snake_case` di data access layer.

Application/domain object harus memakai `camelCase`.

Mapping dilakukan di boundary `lib/db`, `server/queries`, atau adapter terkait. UI component tidak boleh menerima row database mentah jika row tersebut membawa banyak field `snake_case`.

Contoh:

```ts
type LetterRow = {
  creator_user_id: string;
  revision_target_role: string | null;
};

type Letter = {
  creatorUserId: string;
  revisionTargetRole: UserRole | null;
};
```

## Server Actions dan Domain Services

Nama action/function harus memakai verb yang jelas.

Contoh:

```text
createDraftLetter
submitDraftToTeamLead
requestRevision
submitRevision
completeTeamLeadCorrection
forwardToHead
completeHeadCorrection
approveInternal
createFinalVersion
updateSrikandiReference
cancelLetter
createAuditLog
```

Permission function memakai prefix `can`.

Contoh:

```text
canViewLetter
canEditDraft
canSubmitDraft
canCompleteTeamLeadCorrection
canForwardToHead
canCompleteHeadCorrection
canApproveInternal
canCreateFinalVersion
```

## Environment Variables

Gunakan `UPPER_SNAKE_CASE`.

Contoh:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
APP_BASE_URL
MAX_DOCX_UPLOAD_MB
DATA_PILOT_MODE
STORAGE_PROVIDER
```

## Test Naming

File test mengikuti nama file/module yang diuji.

Contoh:

```text
letter-permissions.test.ts
number-reservation-service.test.ts
submit-letter-action.test.ts
```

Nama test harus menjelaskan behavior, bukan implementasi internal.

Contoh:

```text
rejects employee opening another employee draft
reserves unique numbers on parallel submit
keeps previous document version immutable
```

## Jangan Dilakukan

- Jangan memakai `PascalCase` untuk table atau column database.
- Jangan memakai string status langsung seperti `"Final"` di banyak file.
- Jangan mencampur `letter_number`, `letterNumber`, dan `nomorSurat` untuk object yang sama di layer yang sama.
- Jangan memberi nama generic seperti `handleSubmit` untuk domain function. Gunakan nama spesifik seperti `submitLetter`.
- Jangan menaruh logic mapping database di component UI.
