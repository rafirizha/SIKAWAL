# Project Guardrails

Project: SIKAWAL

Nama lengkap: Sistem Kendali Koreksi dan Validasi Naskah Internal

Dokumen ini adalah pintu masuk sebelum coding. Tujuannya menjaga SIKAWAL tetap fokus sebagai aplikasi internal untuk workflow koreksi, snapshot, history, dan audit trail naskah sebelum finalisasi/SRIKANDI.

## Sumber Kebenaran

Urutan acuan saat ada konflik:

1. PRD-Sistem-Surat-Keluar.md
2. docs/DOMAIN_RULES.md
3. docs/PERMISSION_MATRIX.md
4. docs/DATABASE_SCHEMA.md
5. docs/ARCHITECTURE.md
6. docs/GOOGLE_DOCS_SNAPSHOT_WORKFLOW.md
7. docs/NAMING_CONVENTIONS.md
8. docs/AI_CODING_RULES.md
9. docs/IMPLEMENTATION_ROADMAP.md
10. docs/MIGRATION_READY.md
11. docs/PROMPT_TEMPLATES.md
12. docs/BACKLOG.md

## Positioning Wajib

```text
Google Docs = editor dan tempat komentar/suggestion.
SIKAWAL = workflow koreksi internal, snapshot, versi, audit, dan evidence trail.
SRIKANDI = sistem resmi/legal pemerintah untuk surat/arsip/tanda tangan elektronik.
```

SIKAWAL tidak boleh diposisikan sebagai pengganti Google Docs atau SRIKANDI.

## Prinsip Utama

- PRD-first: fitur hanya dibuat jika masuk MVP atau jelas mendukung MVP.
- Internal-review-first: core business adalah koreksi, revisi, snapshot, history, dan audit internal.
- Server-authoritative: permission, workflow, status, versioning, dan audit divalidasi di server.
- Thin frontend: React component tidak boleh menjadi tempat utama business logic.
- Snapshot-first: tombol `Selesai Koreksi` harus membuat bukti koreksi immutable.
- Immutable versions: versi dokumen tidak ditimpa.
- Audit everything important: semua aksi penting tercatat.
- Migration-ready: logic inti tidak boleh terkunci ke Vercel, Supabase, Google Apps Script, atau provider tertentu.
- Dummy-first pilot: hosting eksternal hanya untuk data dummy/anonymized kecuali ada izin resmi.
- Naming-consistent: semua penamaan mengikuti `docs/NAMING_CONVENTIONS.md`.

## Definition of Done Untuk Fitur

Sebuah fitur dianggap selesai jika:

- Sesuai PRD atau acceptance criteria terkait.
- Ada validasi input.
- Ada validasi role dan permission di server.
- Menggunakan domain service yang tepat.
- Menghasilkan audit log jika mengubah status, versi, snapshot, finalisasi, atau data penting.
- Membuat versi/snapshot immutable jika terkait dokumen.
- Memiliki error handling yang tidak meninggalkan data setengah jadi.
- Ada test/check untuk rule utama atau edge case berisiko.
- Tidak menambah provider lock-in tanpa alasan.
- Nama file, function, type, table, column, status constant, dan environment variable konsisten.

## Batasan MVP

- Google Docs boleh dipakai sebagai alat koreksi.
- Google Apps Script boleh dipakai sebagai bridge export snapshot, tetapi wajib ada fallback manual upload.
- SRIKANDI hanya dicatat sebagai referensi setelah final/proses resmi.
- Penomoran resmi, e-signature, integrasi SRIKANDI, dan PDF annotation native penuh ditunda.

## Stop Conditions

AI/developer harus berhenti dan memberi peringatan jika:

- Fitur mencoba menggantikan SRIKANDI.
- Fitur menyimpan dokumen resmi/sensitif di cloud eksternal tanpa izin.
- Fitur membuat versi lama bisa ditimpa.
- Fitur membuat koreksi selesai tanpa snapshot/evidence minimal.
- Fitur membuat permission lebih longgar dari matrix.
- Fitur membuat logic inti terlalu tergantung pada Google Apps Script atau provider tertentu.
