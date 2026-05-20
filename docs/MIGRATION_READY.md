# Migration-Ready Notes

MVP boleh memakai stack gratis/hemat, tetapi core workflow SIKAWAL tidak boleh terkunci pada Vercel, Supabase, Google Docs, atau Google Apps Script.

## Strategi Bertahap

```text
Tahap 1: MVP cloud gratis/hemat
- Vercel + Supabase Free
- Google Docs sebagai workspace koreksi
- Apps Script bridge optional
- Data dummy/anonymized

Tahap 2: Pilot terbatas
- Gunakan data yang diizinkan
- Snapshot evidence tetap tersimpan di SIKAWAL
- SRIKANDI tetap sistem resmi/legal

Tahap 3: Migrasi internal
- PostgreSQL internal BPS
- Storage internal atau S3-compatible
- Server/domain BPS
- Auth internal/SSO jika tersedia

Tahap 4: Produksi
- Backup
- Monitoring
- SOP admin
- Audit dan hardening keamanan
```

## Anti Lock-In

### Database

- Gunakan PostgreSQL-compatible migration.
- Constraint dan index eksplisit.
- Business logic workflow berada di app/domain service.
- Jangan mengandalkan helper Supabase untuk rule inti jika bisa portable.

### Storage

Semua file operation lewat adapter:

```text
uploadLetterDocument()
uploadCorrectionSnapshot()
getSignedUrl()
deleteTemporaryUpload()
```

Provider awal boleh Supabase Storage. Provider berikutnya bisa internal storage atau S3-compatible.

### Google Docs dan Apps Script

Google Docs adalah workspace koreksi, bukan storage evidence tunggal.

Apps Script boleh menjadi bridge:

- export DOCX/PDF snapshot,
- ambil comments metadata jika bisa,
- kirim hasil ke SIKAWAL.

Namun:

- workflow status tetap di SIKAWAL,
- audit tetap di SIKAWAL,
- fallback manual upload wajib ada,
- Apps Script URL dan mode harus environment variable,
- kegagalan Apps Script tidak boleh menghentikan proses manual.

### SRIKANDI

SRIKANDI tetap sistem resmi/legal. SIKAWAL hanya menyimpan referensi internal:

```text
srikandi_reference_number
srikandi_reference_url
srikandi_processed_at
```

Jangan membuat fitur yang mengklaim menggantikan proses legal SRIKANDI.

### Auth

Supabase Auth boleh untuk MVP, tetapi aplikasi harus punya tabel `users`.

Aturan:

- Role aplikasi dibaca dari tabel `users`.
- Permission tidak bergantung langsung pada provider metadata.
- Session provider dipetakan ke user domain.

### Deployment

Vercel dipakai untuk preview/testing.

Hindari:

- Vercel-specific runtime untuk core workflow.
- Vercel Blob/KV untuk data inti.
- Hardcoded URL deployment.

Gunakan:

- Environment variable.
- Node-compatible server logic.
- Adapter provider.

## Batas Data Untuk Cloud Gratis

Selama memakai hosting eksternal:

- Gunakan data dummy/anonymized.
- Jangan upload surat resmi/sensitif tanpa izin.
- Jangan simpan data pribadi yang tidak dibutuhkan.
- Tandai dataset dengan `data_classification`.

Nilai:

```text
dummy
anonymized
approved_real_data
```

## Checklist Migrasi Internal

- Export schema migration.
- Export data pilot yang diizinkan.
- Review tabel users/role.
- Review storage path snapshot.
- Review Google Docs dependency.
- Review Apps Script fallback.
- Review environment variable.
- Review backup/restore.
- Review audit log.
- Uji workflow end-to-end di environment internal.

## Kalimat Pengingat

Setiap kali menambah fitur, tanyakan:

```text
Jika besok Google Apps Script dimatikan dan storage pindah ke server internal, apakah workflow koreksi SIKAWAL tetap bisa jalan?
```

Jawaban yang benar harus: bisa, minimal lewat manual upload snapshot dan adapter storage.
