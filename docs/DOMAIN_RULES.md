# Domain Rules

Dokumen ini berisi aturan inti SIKAWAL. Jika fitur menyentuh koreksi, revisi, snapshot, status, versi, finalisasi, atau audit, baca dokumen ini sebelum coding.

## Status Naskah

Status MVP:

```text
Draft
Menunggu Koreksi Kasubbag Umum
Perlu Revisi Pegawai
Menunggu Koreksi Kepala BPS
Disetujui Internal
Final
Dibatalkan
```

Status terminal:

```text
Final
Dibatalkan
```

## Transisi Status Yang Valid

```text
Draft -> Menunggu Koreksi Kasubbag Umum
Draft -> Dibatalkan

Menunggu Koreksi Kasubbag Umum -> Perlu Revisi Pegawai
Menunggu Koreksi Kasubbag Umum -> Menunggu Koreksi Kepala BPS
Menunggu Koreksi Kasubbag Umum -> Dibatalkan

Perlu Revisi Pegawai -> Menunggu Koreksi Kasubbag Umum
Perlu Revisi Pegawai -> Dibatalkan

Menunggu Koreksi Kepala BPS -> Perlu Revisi Pegawai
Menunggu Koreksi Kepala BPS -> Disetujui Internal
Menunggu Koreksi Kepala BPS -> Dibatalkan

Disetujui Internal -> Final
Disetujui Internal -> Dibatalkan

Final -> terminal
Dibatalkan -> terminal
```

## Role Review

Alur utama:

```text
Pegawai/Penyusun -> Kasubbag Umum -> Kepala BPS/Bapak -> Final
```

Aturan:

- Pegawai hanya dapat mengajukan dan merevisi dokumen miliknya sendiri, kecuali admin.
- Kasubbag Umum hanya dapat mengoreksi dokumen dari timnya.
- Kepala BPS dapat mengoreksi dokumen yang sudah melewati Kasubbag Umum atau ditujukan ke tahap Kepala BPS.
- Admin dapat membantu lintas role, tetapi semua perubahan admin wajib audit log.

## Tombol Selesai Koreksi

`Selesai Koreksi` berarti verifikator menyatakan keputusan tahap koreksinya selesai. Bukti koreksi wajib dikunci jika reviewer meminta revisi atau memberi koreksi tambahan.

Saat tombol ditekan, sistem wajib:

- Memvalidasi role reviewer dan status saat ini.
- Membuat versi `Draft Dikoreksi` jika ada koreksi/snapshot baru.
- Menyimpan reviewer role, reviewer user, timestamp, dan revision round pada versi koreksi jika dibuat.
- Menyimpan minimal satu evidence jika keputusan adalah `Perlu Revisi Pegawai`:
  - file snapshot DOCX/PDF, atau
  - `comments_json` dari Google Docs.
- Membuat audit log.
- Mengubah status:
  - ke `Perlu Revisi Pegawai` jika perlu revisi.
  - ke `Menunggu Koreksi Kepala BPS` jika Kasubbag Umum menyetujui lanjut.
  - ke `Disetujui Internal` jika Kepala BPS menyetujui.

Jika Kasubbag Umum hanya memvalidasi hasil revisi Pegawai dan meneruskan ke Kepala BPS tanpa koreksi tambahan, snapshot tidak wajib. Sistem tetap wajib mencatat `FORWARD_TO_HEAD` pada approval dan audit log dengan version_id versi terakhir.

Catatan: export otomatis dari Google Docs boleh gagal. Fallback manual upload harus tetap tersedia.

## Versi Dokumen

Versi dokumen harus immutable.

Jenis versi:

```text
Draft Pengajuan
Draft Dikoreksi
Hasil Revisi
Naskah Final
```

Aturan:

- Setiap upload, link, export, atau snapshot baru membuat record `letter_versions` baru.
- Versi lama tidak ditimpa.
- `parent_version_id` menghubungkan versi baru ke versi sebelumnya.
- `revision_round` naik setiap siklus koreksi/revisi.
- `Hasil Revisi` wajib punya `change_summary`.
- Setelah Pegawai mengirim `Hasil Revisi`, dokumen selalu kembali ke Kasubbag Umum sebagai quality gate sebelum dapat diteruskan ke Kepala BPS.
- `Draft Dikoreksi` wajib punya reviewer dan evidence koreksi jika versi tersebut dibuat.
- `Naskah Final` hanya dapat dibuat dari status `Disetujui Internal`.

## Snapshot

Snapshot adalah bukti kondisi dokumen pada saat tertentu, khususnya saat verifikator memberi koreksi atau meminta revisi.

Snapshot dapat berupa:

- DOCX hasil export Google Docs.
- PDF hasil export Google Docs.
- File koreksi upload manual.
- `comments_json` berisi komentar/reply/resolved metadata jika tersedia.

Snapshot wajib menyimpan:

```text
source_google_doc_id
source_google_doc_url
snapshot_storage_path
snapshot_mime_type
checksum_sha256
exported_at
reviewer_user_id
reviewer_role
revision_round
```

Jika sebagian metadata tidak tersedia karena fallback manual, sistem tetap harus menyimpan alasan/fallback mode.

## Google Docs

Google Docs adalah workspace koreksi, bukan sumber arsip final tunggal.

Aturan:

- SIKAWAL boleh menyimpan link dan Google Doc ID.
- Komentar/suggestion dilakukan di Google Docs.
- Setelah reviewer memberi koreksi atau meminta revisi, evidence harus disalin/dikunci di SIKAWAL.
- Perubahan Google Docs setelah snapshot tidak mengubah evidence lama.
- Jika perlu koreksi lanjutan, buat versi/snapshot baru.

## SRIKANDI

SRIKANDI adalah sistem resmi/legal pemerintah yang menjadi acuan pembanding untuk menjelaskan gap feedback rinci. SIKAWAL tidak terhubung ke SRIKANDI dan tidak menyimpan metadata proses SRIKANDI.

Aturan:

- SIKAWAL tidak membuat tanda tangan elektronik resmi.
- SIKAWAL tidak mengganti arsip legal SRIKANDI.
- SIKAWAL tidak menyimpan nomor, link, tanggal proses, atau status dari aplikasi pemerintah lain.
- SIKAWAL berhenti pada finalisasi internal dan evidence trail internal.

## Audit Trail

Audit log wajib dibuat untuk:

- Draft dibuat.
- Draft diajukan.
- Link Google Docs ditambahkan/diubah.
- Snapshot koreksi dibuat.
- `Selesai Koreksi`.
- Hasil revisi dikirim.
- Dokumen disetujui internal.
- Naskah final dibuat.
- Dokumen dibatalkan.
- Admin mengubah data penting.

Audit minimal berisi:

```text
actor_user_id
actor_role
entity_type
entity_id
action
from_status
to_status
metadata
created_at
```

## Error Handling

Operasi penting harus atomic pada sisi database:

- Submit draft.
- Membuat versi dokumen.
- Menyelesaikan koreksi.
- Mengirim hasil revisi.
- Menyetujui internal.
- Membuat final.
- Membatalkan dokumen.

Karena file storage dan Google export berada di luar transaksi database, gunakan pola:

```text
prepare upload/export -> validate file/evidence -> db transaction create version/status/audit -> cleanup jika gagal
```

Jika gagal:

- Status tidak berubah sebagian.
- Versi palsu tidak dibuat.
- Evidence yang gagal tidak dianggap snapshot.
- User mendapat pesan error yang bisa dipahami.
- Error teknis dicatat untuk debugging.
