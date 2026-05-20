# AI Coding Rules

Dokumen ini adalah aturan untuk Codex/AI saat membantu coding SIKAWAL.

## Sebelum Coding

AI wajib membaca dokumen terkait:

- `PRD-Sistem-Surat-Keluar.md` untuk requirement produk.
- `docs/PROJECT_GUARDRAILS.md` untuk positioning dan stop conditions.
- `docs/DOMAIN_RULES.md` untuk workflow koreksi, snapshot, versi, dan audit.
- `docs/PERMISSION_MATRIX.md` untuk role.
- `docs/DATABASE_SCHEMA.md` jika menyentuh data.
- `docs/ARCHITECTURE.md` untuk struktur kode.
- `docs/GOOGLE_DOCS_SNAPSHOT_WORKFLOW.md` jika menyentuh Google Docs, Apps Script, atau tombol `Selesai Koreksi`.
- `docs/NAMING_CONVENTIONS.md` untuk penamaan.
- `docs/MIGRATION_READY.md` untuk anti vendor lock-in.
- `docs/BACKLOG.md` jika task berasal dari backlog.

## Positioning Wajib

```text
Google Docs = editor dan tempat komentar/suggestion.
SIKAWAL = workflow koreksi internal, snapshot, versi, audit, dan evidence trail.
SRIKANDI = sistem resmi/legal pemerintah.
```

AI tidak boleh membuat fitur yang memposisikan SIKAWAL sebagai pengganti Google Docs atau SRIKANDI.

## Aturan Scope

- Kerjakan hanya fitur yang diminta.
- Jangan refactor besar tanpa alasan.
- Jangan mengambil P2 sebelum P0 selesai.
- Jangan membuat e-signature atau integrasi SRIKANDI langsung pada MVP.
- Jangan membuat PDF annotation native penuh kecuali diminta eksplisit.
- Jika requirement ambigu, pilih opsi paling sesuai PRD dan catat asumsi.

## Aturan Business Logic

Tidak boleh:

- Menaruh keputusan permission hanya di UI.
- Mengubah status tanpa audit log.
- Menimpa versi dokumen lama.
- Membuat koreksi selesai tanpa snapshot/evidence minimal.
- Mengandalkan Google Docs sebagai satu-satunya bukti tanpa snapshot di SIKAWAL.
- Menaruh workflow utama di Google Apps Script.

Wajib:

- Validasi input dengan schema yang jelas.
- Validasi role dan ownership/team di server.
- Panggil domain service untuk workflow, permission, snapshots, versioning, dan audit.
- Gunakan transaction untuk perubahan status, versi, finalisasi, dan audit.
- Buat error message yang bisa dipahami user.
- Sediakan fallback manual upload jika Apps Script/export gagal.
- Ikuti naming conventions.
- Bungkus status, role, action, source type, dan version type dalam constant/type.

## Aturan Snapshot

Fitur `Selesai Koreksi` wajib:

- Mengecek permission reviewer.
- Mengecek status saat ini.
- Membuat versi `Draft Dikoreksi`.
- Menyimpan evidence minimal: file snapshot atau `comments_json`.
- Menyimpan reviewer, reviewer role, revision round, dan timestamp.
- Membuat audit log.
- Mengubah status sesuai workflow valid.

## Aturan Migration-Ready

- Vercel hanya deployment preview/testing.
- Supabase adalah provider MVP, bukan pusat arsitektur.
- Google Apps Script adalah bridge optional, bukan core workflow.
- Database tetap PostgreSQL-friendly.
- Storage harus lewat adapter.
- Auth harus dimapping ke user domain aplikasi.
- Jangan gunakan provider-specific feature untuk logic inti jika ada alternatif portable.

## Review Checklist

Sebelum selesai:

- Apakah fitur sesuai PRD v1.1?
- Apakah positioning terhadap Google Docs dan SRIKANDI aman?
- Apakah role/permission dicek di server?
- Apakah status transition valid?
- Apakah snapshot/evidence dibuat jika koreksi selesai?
- Apakah versi dokumen immutable?
- Apakah error handling mencegah data parsial?
- Apakah provider-specific logic terisolasi?
- Apakah ada test/check untuk rule penting?
