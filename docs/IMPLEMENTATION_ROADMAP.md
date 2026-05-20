# Implementation Roadmap

Roadmap ini mengikuti positioning baru SIKAWAL sebagai internal correction workflow dan evidence trail sebelum finalisasi/SRIKANDI.

## Phase 0: Guardrails

Output:

- PRD v1.1 internal review.
- Project guardrails.
- Domain rules.
- Permission matrix.
- Database schema awal.
- Architecture.
- Naming conventions.
- AI coding rules.
- Migration-ready notes.
- MVP backlog.

Exit criteria:

- Scope MVP tidak bentrok dengan Google Docs/SRIKANDI.
- Core business koreksi/snapshot/history/audit jelas.
- Backlog MVP tersedia dan diprioritaskan.

## Phase 1: Project Setup

Output:

- Next.js + TypeScript.
- Tailwind CSS.
- shadcn/ui.
- Linting, formatter, typecheck.
- Struktur folder awal.
- Environment validation.
- Supabase client/server wrapper.
- Domain constants/status/type awal.

Exit criteria:

- App berjalan lokal.
- Struktur folder sesuai architecture.
- Tidak ada business logic di UI awal.

## Phase 2: Database, Auth, Role

Output:

- SQL migration tabel utama.
- Seed dummy user, team, dan surat contoh.
- Supabase Auth MVP.
- Mapping user auth ke tabel `users`.
- Permission helper awal.

Exit criteria:

- User bisa login.
- Role terbaca dari server.
- Permission dasar bisa dites.

## Phase 3: Draft dan Google Docs Link

Output:

- Form draft pengajuan.
- Validasi metadata.
- Validasi link Google Docs.
- Upload DOCX/PDF awal.
- Version `Draft Pengajuan 1`.
- Submit ke Kasubbag Umum.

Exit criteria:

- Pegawai bisa membuat draft.
- Draft bisa diajukan ke Kasubbag Umum.
- Versi awal tersimpan immutable.

## Phase 4: Koreksi Kasubbag Umum

Output:

- Dashboard antrean Kasubbag Umum.
- Tombol buka Google Docs.
- Action `Selesai Koreksi`.
- Upload/export snapshot manual/otomatis.
- Version `Draft Dikoreksi 1`.
- Status `Perlu Revisi Pegawai` atau `Menunggu Koreksi Kepala BPS`.

Exit criteria:

- Kasubbag Umum hanya melihat dokumen timnya.
- Snapshot koreksi tersimpan.
- Audit log dibuat.

## Phase 5: Revisi Pegawai

Output:

- Form kirim hasil revisi.
- Upload/link versi revisi.
- `change_summary` wajib.
- Version `Hasil Revisi 1`.
- Routing status ke reviewer berikutnya.

Exit criteria:

- Pegawai bisa mengirim revisi.
- Versi lama tidak tertimpa.
- Status kembali ke Kasubbag Umum atau Kepala BPS sesuai tahap.

## Phase 6: Koreksi dan Persetujuan Kepala BPS

Output:

- Dashboard Kepala BPS.
- Tombol buka Google Docs.
- Action `Selesai Koreksi Kepala BPS`.
- Action `Setujui Internal`.
- Version koreksi Kepala BPS jika perlu.

Exit criteria:

- Kepala BPS hanya memproses dokumen valid.
- Koreksi akhir dan persetujuan internal tercatat.

## Phase 7: Finalisasi dan Referensi SRIKANDI

Output:

- Upload/link naskah final bersih.
- Status `Final`.
- Field referensi SRIKANDI.
- Timeline final.

Exit criteria:

- Final hanya dibuat setelah `Disetujui Internal`.
- Referensi SRIKANDI bisa dicatat tanpa membuat SIKAWAL menjadi sistem legal resmi.

## Phase 8: Dashboard, Audit, Polish

Output:

- Dashboard role-based.
- Detail naskah dengan metadata, timeline, dokumen, audit.
- Filter/search.
- Error, empty, loading states.
- Dokumentasi pengguna pilot.

Exit criteria:

- 10 sampai 50 naskah dummy/anonymized bisa diuji end-to-end.
- Evidence trail bisa menjawab pertanyaan audit.

## Testing Minimum

Test wajib:

- Permission Pegawai, Kasubbag Umum, Kepala BPS, Admin.
- Transition status valid/invalid.
- `Selesai Koreksi` membuat snapshot/version/audit.
- Hasil revisi wajib `change_summary`.
- Versi lama immutable.
- Export/upload snapshot gagal tidak membuat versi palsu.
- Final hanya dari `Disetujui Internal`.
- Referensi SRIKANDI tidak mengubah dokumen final lama.
