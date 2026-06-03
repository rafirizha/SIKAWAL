# Database Schema

Database utama MVP adalah Supabase Postgres. Schema harus ditulis sebagai migration SQL agar mudah dipindahkan ke PostgreSQL internal BPS.

## Prinsip Schema

- Gunakan UUID untuk primary key.
- Gunakan foreign key untuk relasi penting.
- Gunakan check constraint untuk status dan enum sederhana.
- Gunakan index untuk dashboard, timeline, dan audit.
- Simpan audit log append-only secara konsep.
- Simpan snapshot/version sebagai immutable secara aplikasi dan constraint jika memungkinkan.
- Jangan bergantung pada fitur non-PostgreSQL untuk logic inti.

## RLS Policy Posture

- RLS wajib aktif pada tabel public.
- Tabel workflow utama (`letters`, `letter_versions`, `correction_snapshot_jobs`, `approvals`, `audit_logs`) tidak dibuka langsung ke client. Akses perubahan workflow harus lewat server action/RPC yang mengecek permission, status transition, versioning, snapshot evidence, dan audit log.
- Policy `server only deny direct access` dipakai sebagai default deny untuk tabel workflow agar tidak ada akses langsung dari `anon` atau `authenticated`.
- Tabel `users` boleh dibaca oleh user login untuk profil dirinya sendiri memakai policy `using ((select auth.uid()) = id)`.
- Tabel `teams` boleh dibaca oleh user login untuk kebutuhan pemetaan tim.

## Tables

### users

```text
id
name
email
role
team_id
is_active
created_at
updated_at
```

Role:

```text
Pegawai
Kasubbag Umum
Kepala BPS
Admin
```

### teams

```text
id
name
leader_user_id
created_at
updated_at
```

### letters

`letters` tetap dipakai untuk naskah/surat internal agar naming tidak melebar.

```text
id
subject
recipient
letter_date
creator_user_id
team_id
status
current_reviewer_role
revision_target_role
revision_round
google_doc_id
google_doc_url
final_version_id
data_classification
cancel_reason
created_at
updated_at
```

Check constraint:

```text
status in (
  'Draft',
  'Menunggu Koreksi Kasubbag Umum',
  'Perlu Revisi Pegawai',
  'Menunggu Koreksi Kepala BPS',
  'Disetujui Internal',
  'Final',
  'Dibatalkan'
)

data_classification in (
  'dummy',
  'anonymized',
  'approved_real_data'
)
```

Index:

```text
creator_user_id
team_id
status
letter_date
current_reviewer_role
created_at
```

### letter_versions

```text
id
letter_id
parent_version_id
version_number
revision_round
version_type
title
source_type
storage_path
file_url
file_mime_type
file_size_bytes
checksum_sha256
google_doc_id
google_doc_url
comments_json
created_by_user_id
reviewer_user_id
reviewer_role
notes
change_summary
exported_at
created_at
```

`version_type`:

```text
Draft Pengajuan
Draft Dikoreksi
Hasil Revisi
Naskah Final
```

`source_type`:

```text
google_docs
upload_docx
upload_pdf
apps_script_export
manual_snapshot_upload
system_final
```

Constraint:

- `parent_version_id` harus menunjuk versi pada `letter_id` yang sama.
- `Hasil Revisi` wajib punya `change_summary`.
- `Draft Dikoreksi` wajib punya `reviewer_user_id` dan `reviewer_role`.
- Satu versi minimal punya `storage_path`, `google_doc_url`, atau `comments_json`.
- Versi lama tidak boleh di-update oleh flow biasa.
- `version_number` unik per `letter_id`.

Index:

```text
letter_id
parent_version_id
version_type
revision_round
created_at
```

### correction_snapshot_jobs

Digunakan untuk export otomatis/fallback tombol `Selesai Koreksi`.

```text
id
letter_id
requested_by_user_id
reviewer_role
source_google_doc_id
status
error_message
result_version_id
created_at
completed_at
```

Status:

```text
PENDING
SUCCESS
FAILED
FALLBACK_REQUIRED
```

### approvals

Mencatat aksi workflow penting.

```text
id
letter_id
actor_user_id
actor_role
action
from_status
to_status
notes
version_id
created_at
```

Action:

```text
SUBMIT_DRAFT
COMPLETE_CORRECTION
REQUEST_REVISION
SUBMIT_REVISION
FORWARD_TO_HEAD
APPROVE_INTERNAL
CREATE_FINAL
CANCEL
```

### audit_logs

```text
id
entity_type
entity_id
action
actor_user_id
actor_role
from_status
to_status
metadata
created_at
```

Index:

```text
entity_type, entity_id
actor_user_id
created_at
```

## Storage Objects

Storage path disarankan:

```text
letters/{letter_id}/versions/{version_number}/{file_name}
letters/{letter_id}/snapshots/{revision_round}/{file_name}
```

Jangan menyimpan file resmi/sensitif di cloud eksternal tanpa izin. Pilot eksternal memakai dummy/anonymized.

## Transaction Wajib

Gunakan transaksi database untuk:

- Submit draft dan membuat versi pengajuan.
- Membuat snapshot koreksi jika ada evidence koreksi, lalu mengubah status.
- Mengirim hasil revisi.
- Approve internal.
- Membuat naskah final.
- Membatalkan dokumen.

File export/upload dilakukan sebelum transaksi DB dianggap final. Jika DB gagal, lakukan cleanup storage best-effort.

## Workflow RPC

Operasi status penting dijalankan lewat PostgreSQL function agar perubahan versi, status, approval, dan audit tetap atomik.

```text
create_draft_letter
create_and_submit_draft_letter
submit_draft_to_general_subdivision
complete_general_subdivision_correction
submit_letter_revision
complete_head_correction
approve_internal_letter
create_final_letter
cancel_letter
```

`complete_general_subdivision_correction` menerima evidence `storage_path` snapshot atau `comments_json`. Jika keputusan `request_revision`, evidence wajib tersedia. Jika keputusan `forward_to_head`, evidence bersifat opsional: jika tidak ada snapshot baru, RPC hanya mengubah status, mencatat `FORWARD_TO_HEAD`, dan memakai `version_id` terakhir sebagai referensi audit. Jika `source_type` adalah `manual_snapshot_upload` dan evidence file tersedia, file snapshot harus punya MIME DOCX/PDF, ukuran, serta checksum. Jika `source_type` adalah `apps_script_export`, `comments_json` dapat menjadi evidence minimal saat file export tidak tersedia, tetapi tidak boleh kosong. Jika export otomatis memakai `correction_snapshot_jobs`, status job diselesaikan dalam transaksi RPC yang sama.

`submit_letter_revision` membuat versi `Hasil Revisi` secara append-only, mewajibkan `change_summary`, lalu selalu mengembalikan status ke `Menunggu Koreksi Kasubbag Umum`. Jika revisi sebelumnya diminta oleh Kepala BPS, Kasubbag Umum tetap menjadi quality gate sebelum dokumen diteruskan lagi ke Kepala BPS.

`complete_head_correction` mengikuti aturan snapshot yang sama dengan koreksi Kasubbag Umum, tetapi reviewer role dikunci sebagai `Kepala BPS` dan status berikutnya menjadi `Perlu Revisi Pegawai`.

`approve_internal_letter` hanya mengubah status dari `Menunggu Koreksi Kepala BPS` ke `Disetujui Internal` dan tetap mencatat approval serta audit log tanpa membuat versi dokumen baru.

`create_final_letter` hanya menerima dokumen berstatus `Disetujui Internal`, membuat versi append-only `Naskah Final`, mengisi `final_version_id`, mengubah status ke `Final`, serta mencatat approval dan audit log dalam transaksi database yang sama. Evidence final minimal berupa file DOCX/PDF atau link Google Docs final.

`cancel_letter` menolak dokumen yang sudah `Final` atau `Dibatalkan`, mewajibkan alasan pembatalan, mengubah status ke `Dibatalkan`, serta mencatat approval dan audit log dalam transaksi database yang sama.

## Migration Notes

Semua migration disimpan di:

```text
supabase/migrations/
```

Jika pindah ke PostgreSQL internal, migration ini menjadi dasar schema internal. Provider-specific logic harus berada di adapter.
