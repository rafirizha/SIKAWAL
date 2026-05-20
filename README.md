# SIKAWAL

SIKAWAL adalah aplikasi internal untuk workflow koreksi naskah, snapshot bukti koreksi, history versi, dan audit trail sebelum dokumen final masuk proses resmi seperti SRIKANDI atau tanda tangan basah.

## Positioning

```text
Google Docs = editor dan tempat komentar/suggestion.
SIKAWAL = workflow koreksi internal, snapshot, versi, audit, dan evidence trail.
SRIKANDI = sistem resmi/legal pemerintah.
```

SIKAWAL tidak menggantikan Google Docs atau SRIKANDI.

## Setup Lokal

1. Install dependency:

```bash
npm install
```

2. Salin environment:

```bash
cp .env.example .env.local
```

3. Isi nilai Supabase dan konfigurasi lokal di `.env.local`.

4. Jalankan validasi environment:

```bash
npm run env:check
```

5. Jalankan development server:

```bash
npm run dev
```

App akan berjalan di `http://localhost:3000`.

## Script

```bash
npm run dev
npm run build
npm run lint
npm run typecheck
npm run format:check
npm run env:check
```

## Dokumen Pagar

Mulai dari:

- `docs/PROJECT_GUARDRAILS.md`
- `docs/BACKLOG.md`
- `docs/ARCHITECTURE.md`
- `docs/DOMAIN_RULES.md`
- `docs/GOOGLE_DOCS_SNAPSHOT_WORKFLOW.md`

## Scope Saat Ini

Foundation BL-001 sampai BL-008:

- Next.js App Router + TypeScript.
- Tailwind CSS + baseline shadcn/ui.
- Struktur folder architecture.
- Linting, formatter, typecheck.
- Environment validation.
- Supabase wrapper awal.
- Domain constants/types awal.
- README setup lokal.
