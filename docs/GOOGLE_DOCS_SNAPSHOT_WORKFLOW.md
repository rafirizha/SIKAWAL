# Google Docs Snapshot Workflow

Dokumen ini menjelaskan alur teknis Google Docs, Apps Script, dan fallback manual untuk tombol `Selesai Koreksi`.

## Tujuan

Menyediakan bukti koreksi yang immutable tanpa membuat SIKAWAL menjadi editor dokumen penuh.

```text
Google Docs = koreksi/komentar/suggestion.
Apps Script = bridge export snapshot opsional.
SIKAWAL = status, snapshot, versi, audit, dan evidence trail.
```

## Alur Best Case

1. Pegawai mengajukan draft dengan `google_doc_url`.
2. SIKAWAL menyimpan `google_doc_id`.
3. Verifikator klik `Buka Dokumen Koreksi`.
4. Verifikator memberi komentar/suggestion di Google Docs.
5. Verifikator kembali ke SIKAWAL dan klik `Selesai Koreksi`.
6. SIKAWAL memanggil export bridge.
7. Export bridge membuat snapshot:
   - DOCX.
   - PDF jika tersedia.
   - `comments_json` jika tersedia.
8. SIKAWAL menyimpan file ke storage.
9. SIKAWAL membuat version `Draft Dikoreksi`.
10. SIKAWAL mengubah status dan membuat audit log.

## Alur Fallback Manual

Jika Apps Script/export otomatis gagal:

1. SIKAWAL menampilkan pesan bahwa export otomatis gagal.
2. Verifikator download file dari Google Docs secara manual.
3. Verifikator upload DOCX/PDF hasil koreksi ke SIKAWAL.
4. Verifikator klik `Selesai Koreksi`.
5. SIKAWAL membuat version dan audit seperti alur best case.

Fallback manual adalah wajib. Jangan membuat workflow bergantung penuh pada Apps Script.

## Payload Snapshot

Minimal data snapshot:

```text
letter_id
source_google_doc_id
source_google_doc_url
reviewer_user_id
reviewer_role
revision_round
snapshot_file
snapshot_mime_type
comments_json
exported_at
checksum_sha256
fallback_reason
```

Evidence minimal:

```text
snapshot_file OR comments_json
```

Jika hanya ada Google Docs URL tanpa file atau comments JSON, itu belum cukup sebagai evidence `Selesai Koreksi`.

## Apps Script Bridge

Panduan setup teknis ada di `docs/GOOGLE_APPS_SCRIPT_SETUP.md`.

Apps Script boleh digunakan untuk:

- Menerima request export dari SIKAWAL.
- Membaca Google Docs/Drive sesuai permission.
- Export Google Docs ke DOCX/PDF.
- Mengambil komentar/reply jika API dan permission memungkinkan.
- Mengembalikan payload export ke action SIKAWAL.

Response bridge yang diterima SIKAWAL:

```text
ok
status
errorMessage
fallbackReason
exportedAt
snapshot/docx/pdf: { fileName, mimeType, base64 }
commentsJson
```

`commentsJson` hanya dianggap evidence jika berisi data non-empty. Object/array kosong bukan bukti koreksi.

Apps Script tidak boleh:

- Menentukan status workflow.
- Mengubah role/permission.
- Menjadi database utama.
- Menyimpan audit utama.
- Menjadi satu-satunya cara menyelesaikan koreksi.

## Security Notes

- Jangan memakai public link untuk dokumen sensitif.
- Reviewer harus diberi akses sesuai kebutuhan.
- Apps Script URL disimpan di environment variable.
- Request dari SIKAWAL ke Apps Script wajib memakai shared secret di server env.
- Shared secret dikirim di body request sebagai `shared_secret`; header `x-sikawal-bridge-secret` tetap dikirim sebagai defense tambahan, tetapi script memvalidasi dari body agar kompatibel dengan Apps Script Web App.
- Request export wajib memiliki timeout agar fallback manual tetap responsif.
- Jangan log isi dokumen sensitif ke console.
- Pilot cloud eksternal memakai dummy/anonymized data.

## Failure Modes dan Mitigasi

| Failure                                  | Mitigasi                                            |
| ---------------------------------------- | --------------------------------------------------- |
| Apps Script quota habis                  | Fallback manual upload                              |
| Export DOCX tidak membawa semua komentar | Simpan `comments_json`, PDF optional                |
| Verifikator lupa klik `Selesai Koreksi`  | Dashboard status tetap menunggu                     |
| Google Doc berubah setelah snapshot      | Snapshot lama tetap bukti resmi                     |
| Reviewer tidak punya akses Google Docs   | Validasi/instruksi share akses                      |
| Callback ke SIKAWAL gagal                | Simpan job `FAILED`, minta retry atau manual upload |

## Acceptance Gate

Sebelum fitur `Selesai Koreksi` dianggap selesai:

```text
[x] Permission reviewer dicek server-side
[x] Status transition valid
[x] Evidence minimal dipenuhi
[x] Version Draft Dikoreksi dibuat
[x] Versi lama tidak ditimpa
[x] Audit log dibuat
[x] Export gagal punya fallback manual
[x] Error message bisa dipahami user
```
