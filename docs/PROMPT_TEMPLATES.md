# Prompt Templates

Dokumen ini berisi template prompt untuk menjaga coding SIKAWAL tetap PRD-first, snapshot-first, clean, dan migration-ready.

## Cara Pakai Cepat

```text
Kerjakan [nama task] untuk SIKAWAL.

Acuan wajib:
- PRD-Sistem-Surat-Keluar.md
- docs/PROJECT_GUARDRAILS.md
- docs/ARCHITECTURE.md
- docs/GOOGLE_DOCS_SNAPSHOT_WORKFLOW.md jika menyentuh Google Docs/Apps Script/snapshot
- docs/DOMAIN_RULES.md
- docs/PERMISSION_MATRIX.md
- docs/NAMING_CONVENTIONS.md
- docs/DATABASE_SCHEMA.md jika menyentuh database
- docs/MIGRATION_READY.md
- docs/AI_CODING_RULES.md
- docs/BACKLOG.md jika task berasal dari backlog

Positioning wajib:
- Google Docs adalah editor/tempat komentar.
- SIKAWAL adalah workflow koreksi internal, snapshot, versi, audit, dan evidence trail.
- SRIKANDI adalah sistem resmi/legal pemerintah.

Wajib:
- Pahami scope task dan hubungkan ke PRD v1.1.
- Ikuti struktur folder dan boundary pada ARCHITECTURE.
- Jangan taruh business logic utama di UI component.
- Permission, workflow, snapshot, versioning, audit, dan status harus dicek di server.
- Gunakan transaction untuk operasi penting seperti submit draft, selesai koreksi, submit revisi, approve internal, finalisasi, dan cancel.
- Jaga versi dokumen immutable.
- Jaga database tetap PostgreSQL-friendly dan migration-ready.
- Isolasi Supabase, Google Docs, dan Apps Script di adapter/layer terkait.
- Sediakan fallback manual upload jika export otomatis gagal.
- Jangan ubah scope di luar task tanpa alasan kuat.
- Ikuti naming conventions.
- Tambahkan test/check yang relevan.

Sebelum coding:
- Jelaskan singkat file/dokumen mana yang relevan.
- Jelaskan rencana implementasi 3-7 langkah.
- Sebutkan risiko utama dari task ini.

Output akhir:
- Ringkasan perubahan.
- File yang dibuat/diubah.
- Test/check yang dijalankan.
- Risiko/sisa pekerjaan.
- Catatan migration-ready jika ada.
```

## Template Implementasi Fitur

```text
Implement fitur [nama fitur] untuk SIKAWAL.

Konteks fitur:
- Tujuan: [jelaskan tujuan fitur]
- Role terkait: [Pegawai/Ketua Tim/Kepala BPS/Admin]
- Status terkait: [Draft/Menunggu Koreksi Ketua Tim/dst]
- Data terkait: [letters/letter_versions/approvals/audit_logs/correction_snapshot_jobs]

Acuan wajib:
- PRD-Sistem-Surat-Keluar.md
- docs/PROJECT_GUARDRAILS.md
- docs/ARCHITECTURE.md
- docs/DOMAIN_RULES.md
- docs/PERMISSION_MATRIX.md
- docs/NAMING_CONVENTIONS.md
- docs/MIGRATION_READY.md
- docs/AI_CODING_RULES.md

Jika menyentuh database:
- Ikuti docs/DATABASE_SCHEMA.md
- Buat atau update migration SQL
- Pastikan constraint dan index sesuai kebutuhan

Requirement teknis:
- UI hanya untuk tampilan, input, dan memanggil server action/API.
- Business logic taruh di lib/workflow, lib/permissions, lib/snapshots, lib/audit, lib/storage, atau lib/google sesuai domain.
- Mutasi data taruh di server/actions.
- Query data taruh di server/queries.
- Permission final wajib dicek di server.
- Aksi penting wajib membuat audit log.
- Operasi penting wajib atomic pada sisi database.
- Error message harus bisa dipahami user.
- Provider-specific code harus terisolasi.
- Jika terkait koreksi selesai, wajib membuat snapshot/evidence.

Output akhir:
- Apa yang berubah.
- File yang dibuat/diubah.
- Test/check yang dijalankan.
- Risiko dan sisa pekerjaan.
```

## Template Selesai Koreksi

Gunakan untuk fitur tombol `Selesai Koreksi`.

```text
Implement server action/API [completeTeamLeadCorrection atau completeHeadCorrection].

Acuan wajib:
- docs/DOMAIN_RULES.md
- docs/PERMISSION_MATRIX.md
- docs/DATABASE_SCHEMA.md
- docs/MIGRATION_READY.md
- docs/AI_CODING_RULES.md

Action ini harus:
- Memvalidasi input.
- Mengambil user session dan role dari server.
- Mengecek permission reviewer berdasarkan role, team, ownership, dan status.
- Mengecek transisi status yang valid.
- Memastikan ada evidence snapshot minimal: file snapshot atau comments_json.
- Membuat version `Draft Dikoreksi`.
- Menyimpan reviewer, reviewer_role, revision_round, source_google_doc_id/url, checksum jika ada.
- Menggunakan transaction untuk membuat version, approval/audit, dan update status.
- Mengembalikan error message yang jelas.
- Tidak membuat versi palsu jika upload/export gagal.

Jangan:
- Mengandalkan tombol tersembunyi di UI sebagai permission.
- Mengubah status tanpa audit log.
- Menimpa versi lama.
- Menganggap Google Docs link saja sebagai evidence final.

Output akhir:
- Action yang dibuat.
- Rule permission yang dipakai.
- Evidence snapshot yang didukung.
- Status transition yang didukung.
- Test/check yang dijalankan.
```

## Template Database Migration

```text
Buat/update database migration untuk [nama kebutuhan].

Acuan wajib:
- PRD-Sistem-Surat-Keluar.md
- docs/DATABASE_SCHEMA.md
- docs/DOMAIN_RULES.md
- docs/NAMING_CONVENTIONS.md
- docs/MIGRATION_READY.md

Wajib:
- Gunakan PostgreSQL-compatible SQL.
- Simpan migration di supabase/migrations.
- Tambahkan primary key, foreign key, check constraint, unique constraint, dan index yang relevan.
- Pastikan status, role, version_type, source_type, dan action dibatasi check constraint.
- Pastikan version_number unik per letter.
- Pastikan audit log append-only secara konsep.
- Gunakan table/column/index/constraint `snake_case`.
- Jangan memakai fitur non-portable jika tidak perlu.
- Sertakan seed dummy jika dibutuhkan.

Output akhir:
- File migration yang dibuat/diubah.
- Constraint penting yang ditambahkan.
- Cara menjalankan migration.
- Risiko migrasi atau data compatibility.
```

## Template UI

```text
Buat UI [nama halaman/komponen] untuk SIKAWAL.

Acuan wajib:
- PRD-Sistem-Surat-Keluar.md
- docs/ARCHITECTURE.md
- docs/PROJECT_GUARDRAILS.md
- docs/PERMISSION_MATRIX.md
- docs/NAMING_CONVENTIONS.md

Prinsip UI:
- UI administratif, sederhana, rapi, mudah discan.
- Jangan buat landing page jika yang dibutuhkan aplikasi.
- Component hanya mengelola tampilan, state form, dan call server action.
- Jangan taruh business logic utama di component.
- Tampilkan status koreksi dengan jelas.
- Tampilkan timeline versi dan snapshot.
- Tampilkan error yang bisa dipahami user.
- Tombol aksi boleh disembunyikan sesuai permission, tetapi server tetap wajib validasi.

Struktur:
- Page di src/app.
- Component fitur di src/features/[feature]/components.
- Schema/form helper di src/features/[feature].
- Data query dari server/queries.
- Mutasi dari server/actions.

Output akhir:
- Halaman/komponen yang dibuat.
- Alur interaksi.
- State loading/error/empty yang ditangani.
- Test/check visual atau manual yang dilakukan.
```

## Template Code Review

```text
Review perubahan terbaru pada project SIKAWAL.

Acuan wajib:
- PRD-Sistem-Surat-Keluar.md
- docs/PROJECT_GUARDRAILS.md
- docs/ARCHITECTURE.md
- docs/DOMAIN_RULES.md
- docs/PERMISSION_MATRIX.md
- docs/DATABASE_SCHEMA.md
- docs/NAMING_CONVENTIONS.md
- docs/MIGRATION_READY.md
- docs/AI_CODING_RULES.md

Fokus review:
- Bug atau risiko behavior.
- Pelanggaran positioning Google Docs/SIKAWAL/SRIKANDI.
- Permission yang hanya dicek di UI.
- Business logic yang tercecer di component.
- Koreksi selesai tanpa snapshot/evidence.
- Operasi penting tanpa transaction.
- Perubahan status tanpa audit log.
- Versi dokumen yang bisa tertimpa.
- Provider lock-in yang tidak perlu.
- Naming yang tidak konsisten.
- Missing test untuk rule berisiko.

Output:
- Findings berdasarkan severity.
- File dan line terkait.
- Rekomendasi fix.
- Test gap.
```

## Stop Conditions

AI harus berhenti dan bertanya atau memberi peringatan jika menemukan:

- Permintaan bertentangan dengan PRD.
- Permintaan membuat SIKAWAL menggantikan SRIKANDI.
- Permintaan memakai data resmi/sensitif di hosting eksternal tanpa izin.
- Fitur membutuhkan perubahan schema besar yang belum disepakati.
- Fitur membuat permission lebih longgar dari matrix.
- Fitur menghapus audit trail atau versi dokumen.
- Fitur membuat koreksi selesai tanpa evidence snapshot.
- Implementasi membuat project terlalu tergantung pada provider tertentu.

## Acceptance Gate Sebelum Final

```text
[ ] Scope sesuai request
[ ] PRD dan docs relevan diikuti
[ ] Positioning Google Docs/SIKAWAL/SRIKANDI aman
[ ] UI tidak memegang business logic utama
[ ] Permission dicek server-side
[ ] Status transition valid
[ ] Snapshot/evidence dibuat jika terkait koreksi
[ ] Audit log dibuat jika aksi penting
[ ] Versioning immutable jika terkait dokumen
[ ] Transaction digunakan untuk operasi penting
[ ] Migration-ready tetap terjaga
[ ] Naming conventions diikuti
[ ] Test/check dijalankan atau alasan tidak menjalankan disebutkan
```
