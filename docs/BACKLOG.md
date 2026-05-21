# Backlog MVP

Project: SIKAWAL  
Tanggal update: 20 Mei 2026  
Target usable MVP build: 18 Juni 2026  
Target pilot testing: 1 Juli 2026

Backlog ini menerjemahkan PRD v1.1 menjadi pekerjaan implementasi untuk internal correction workflow, snapshot, version history, dan audit trail.

## Prinsip Eksekusi

- Kerjakan fondasi server, database, domain, dan permission sebelum UI detail.
- UI boleh sederhana, tetapi workflow, snapshot, versi, dan audit harus benar.
- Google Docs dipakai sebagai alat komentar/suggestion.
- Apps Script dipakai sebagai bridge opsional, bukan core workflow.
- Wajib ada fallback manual upload snapshot.
- Data pilot eksternal hanya dummy/anonymized kecuali ada izin resmi.

## Prioritas

```text
P0 = wajib untuk pilot usable
P1 = penting untuk kenyamanan pilot
P2 = nice-to-have setelah MVP stabil
```

## Keputusan Yang Perlu Dikunci

| ID      | Keputusan                                                    | Status | Default MVP                                   |
| ------- | ------------------------------------------------------------ | ------ | --------------------------------------------- |
| DEC-001 | Apakah kantor memakai Google Workspace resmi atau akun biasa | TODO   | Link Google Docs manual + fallback upload     |
| DEC-002 | Snapshot wajib DOCX, PDF, atau keduanya                      | TODO   | DOCX wajib, PDF optional jika export tersedia |
| DEC-003 | Istilah UI untuk reviewer terakhir                           | TODO   | `Kepala BPS`                                  |
| DEC-004 | Bentuk referensi SRIKANDI                                    | TODO   | Nomor/ID + catatan manual                     |
| DEC-005 | Apakah Apps Script diperbolehkan domain kantor               | TODO   | Manual upload snapshot tetap tersedia         |

## Sprint 1: Foundation

| ID     | Prioritas | Task                                      | Acceptance                             | Dependency | Status |
| ------ | --------- | ----------------------------------------- | -------------------------------------- | ---------- | ------ |
| BL-001 | P0        | Setup Next.js App Router + TypeScript     | `npm run dev` berjalan                 | None       | DONE   |
| BL-002 | P0        | Setup Tailwind CSS dan shadcn/ui baseline | Layout dasar render                    | BL-001     | DONE   |
| BL-003 | P0        | Buat struktur folder architecture         | Folder sesuai docs/ARCHITECTURE.md     | BL-001     | DONE   |
| BL-004 | P0        | Setup linting, formatter, typecheck       | Script check tersedia                  | BL-001     | DONE   |
| BL-005 | P0        | Environment validation                    | Missing env error jelas                | BL-001     | DONE   |
| BL-006 | P0        | Supabase wrappers                         | Supabase-specific code terisolasi      | BL-005     | DONE   |
| BL-007 | P0        | Domain constants/types                    | Status/role/version constants tersedia | BL-003     | DONE   |
| BL-008 | P0        | README setup lokal                        | Developer bisa run lokal               | BL-001     | DONE   |

## Sprint 2: Database, Auth, Permission

| ID     | Prioritas | Task                   | Acceptance                            | Dependency | Status |
| ------ | --------- | ---------------------- | ------------------------------------- | ---------- | ------ |
| BL-009 | P0        | Migration schema utama | Tables, FK, checks, indexes tersedia  | BL-007     | DONE   |
| BL-010 | P0        | Seed dummy             | User/team/letter sample tersedia      | BL-009     | DONE   |
| BL-011 | P0        | Auth session mapping   | Role aplikasi dari tabel `users`      | BL-009     | DONE   |
| BL-012 | P0        | Permission helper      | Unit test permission dasar lewat      | BL-011     | DONE   |
| BL-013 | P0        | Route protection       | Dashboard tidak terbuka tanpa session | BL-011     | DONE   |

## Sprint 3: Draft dan Submit

| ID     | Prioritas | Task                             | Acceptance                                                         | Dependency     | Status |
| ------ | --------- | -------------------------------- | ------------------------------------------------------------------ | -------------- | ------ |
| BL-014 | P0        | Draft schema validation          | Input invalid ditolak jelas                                        | BL-007         | DONE   |
| BL-015 | P0        | Google Docs URL parser/validator | Google Doc ID bisa diekstrak                                       | BL-014         | DONE   |
| BL-016 | P0        | Upload DOCX/PDF initial document | File valid tersimpan via adapter                                   | BL-006         | DONE   |
| BL-017 | P0        | Create draft action              | Status `Draft`, versi awal optional                                | BL-012, BL-014 | DONE   |
| BL-018 | P0        | Submit draft to Kasubbag Umum    | Status `Menunggu Koreksi Kasubbag Umum`, versi `Draft Pengajuan 1` | BL-012, BL-017 | DONE   |
| BL-019 | P0        | Draft form UI                    | Pegawai bisa submit draft                                          | BL-015, BL-018 | DONE   |

## Sprint 4: Koreksi Kasubbag Umum dan Snapshot

| ID     | Prioritas | Task                          | Acceptance                                               | Dependency     | Status |
| ------ | --------- | ----------------------------- | -------------------------------------------------------- | -------------- | ------ |
| BL-020 | P0        | Kasubbag Umum dashboard query | Kasubbag Umum hanya melihat timnya                       | BL-012, BL-018 | TODO   |
| BL-021 | P0        | Open Google Docs action/link  | Reviewer bisa buka dokumen kerja                         | BL-015, BL-020 | TODO   |
| BL-022 | P0        | Manual snapshot upload        | Reviewer bisa upload DOCX/PDF koreksi                    | BL-016         | TODO   |
| BL-023 | P0        | Complete correction action    | Membuat `Draft Dikoreksi 1`, audit, status revisi/lanjut | BL-012, BL-022 | TODO   |
| BL-024 | P1        | Apps Script export bridge POC | Export snapshot otomatis berhasil atau fallback jelas    | BL-023         | TODO   |
| BL-025 | P1        | comments_json capture POC     | Komentar tersimpan jika API memungkinkan                 | BL-024         | TODO   |

## Sprint 5: Revisi dan Kepala BPS

| ID     | Prioritas | Task                            | Acceptance                               | Dependency     | Status |
| ------ | --------- | ------------------------------- | ---------------------------------------- | -------------- | ------ |
| BL-026 | P0        | Submit revision action          | `Hasil Revisi 1`, `change_summary` wajib | BL-023         | TODO   |
| BL-027 | P0        | Head dashboard query            | Kepala BPS melihat antrean valid         | BL-026         | TODO   |
| BL-028 | P0        | Complete Head correction action | Membuat snapshot koreksi Kepala BPS      | BL-027         | TODO   |
| BL-029 | P0        | Approve internal action         | Status `Disetujui Internal`, audit log   | BL-027         | TODO   |
| BL-030 | P1        | Review UI pages                 | Reviewer bisa koreksi/revisi/setuju      | BL-023, BL-029 | TODO   |

## Sprint 6: Final, SRIKANDI Reference, Audit

| ID     | Prioritas | Task                        | Acceptance                            | Dependency     | Status |
| ------ | --------- | --------------------------- | ------------------------------------- | -------------- | ------ |
| BL-031 | P0        | Create final version action | Final hanya dari `Disetujui Internal` | BL-029         | TODO   |
| BL-032 | P0        | Update SRIKANDI reference   | Nomor/ID/catatan tersimpan audit      | BL-031         | TODO   |
| BL-033 | P0        | Letter detail timeline      | Semua versi dan snapshot terlihat     | BL-018, BL-031 | TODO   |
| BL-034 | P0        | Audit log viewer            | Audit terbatas sesuai permission      | BL-012         | TODO   |
| BL-035 | P0        | Cancel action               | Batal sebelum final sesuai permission | BL-012         | TODO   |
| BL-036 | P1        | Dashboard filters/search    | Search perihal/status/tim             | BL-033         | TODO   |
| BL-037 | P1        | User guide pilot            | Instruksi Pegawai/Reviewer/Admin      | BL-033         | TODO   |

## Testing dan Hardening

| ID     | Prioritas | Task                         | Acceptance                                              | Dependency     | Status |
| ------ | --------- | ---------------------------- | ------------------------------------------------------- | -------------- | ------ |
| BL-038 | P0        | Permission test suite        | Role utama diuji                                        | BL-012         | TODO   |
| BL-039 | P0        | Workflow transition tests    | Transition ilegal ditolak                               | BL-023, BL-029 | TODO   |
| BL-040 | P0        | Snapshot evidence tests      | Koreksi selesai tanpa evidence ditolak                  | BL-023         | TODO   |
| BL-041 | P0        | Version immutability tests   | Versi lama tidak tertimpa                               | BL-026         | TODO   |
| BL-042 | P0        | Upload/export failure tests  | Gagal upload/export tidak membuat versi palsu           | BL-023         | TODO   |
| BL-043 | P0        | End-to-end one revision path | Draft -> koreksi -> revisi -> approve -> final berhasil | BL-031         | TODO   |
| BL-044 | P0        | End-to-end two reviewer path | Kasubbag Umum dan Kepala BPS tercatat lengkap           | BL-031         | TODO   |
| BL-045 | P1        | Migration-ready audit        | Provider-specific code tetap di adapter                 | BL-024         | TODO   |

## P2 Setelah MVP Stabil

| ID     | Prioritas | Task                             | Alasan Ditunda                           | Status |
| ------ | --------- | -------------------------------- | ---------------------------------------- | ------ |
| BL-046 | P2        | PDF annotation native di SIKAWAL | Berat untuk MVP, Google Docs sudah cukup | TODO   |
| BL-047 | P2        | Integrasi SRIKANDI langsung      | Butuh izin dan API resmi                 | TODO   |
| BL-048 | P2        | Auto-diff dokumen                | Kompleks dan bukan core pilot            | TODO   |
| BL-049 | P2        | Reminder otomatis WhatsApp/email | Useful, bukan core evidence trail        | TODO   |
| BL-050 | P2        | Full Google Docs add-on          | Lebih kompleks dari Apps Script bridge   | TODO   |

## Prompt Next Task

```text
Kerjakan BL-001 sampai BL-008 untuk SIKAWAL.

Acuan wajib:
- PRD-Sistem-Surat-Keluar.md
- docs/PROJECT_GUARDRAILS.md
- docs/ARCHITECTURE.md
- docs/NAMING_CONVENTIONS.md
- docs/AI_CODING_RULES.md
- docs/MIGRATION_READY.md
- docs/BACKLOG.md

Scope:
- Setup Next.js App Router + TypeScript.
- Setup Tailwind CSS dan shadcn/ui baseline.
- Buat struktur folder sesuai architecture.
- Setup linting, formatter, typecheck.
- Buat env validation.
- Buat Supabase client wrapper awal.
- Buat domain constants/types awal untuk status, role, version type, source type.
- Tambahkan README setup lokal.

Jangan:
- Implement workflow koreksi dulu.
- Taruh business logic di UI component.
- Menyimpan data resmi/sensitif.
- Mengunci logic inti ke Google Apps Script.

Output akhir:
- Ringkasan perubahan.
- File yang dibuat/diubah.
- Cara menjalankan lokal.
- Test/check yang dijalankan.
- Risiko/sisa pekerjaan.
```
