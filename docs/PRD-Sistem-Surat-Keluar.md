# Product Requirements Document

## SIKAWAL - Sistem Kendali Koreksi dan Validasi Naskah Internal

Status: PRD v1.1  
Tanggal update: 20 Mei 2026  
Target pilot: 1 Juli 2026  
Lingkup awal: workflow koreksi internal surat/naskah BPS Kabupaten Kepulauan Anambas sebelum dokumen dianggap final secara internal.

## 1. Ringkasan Produk

SIKAWAL adalah aplikasi internal untuk mengelola proses koreksi, revisi, validasi, snapshot, dan audit trail naskah surat sebelum dokumen dianggap final secara internal.

SIKAWAL tidak menggantikan:

- Google Docs sebagai alat menulis, memberi komentar, dan melakukan suggestion.
- SRIKANDI sebagai sistem resmi pemerintah untuk arsip/surat dinamis dan proses legal formal.
- Tanda tangan elektronik resmi atau tanda tangan basah.

SIKAWAL mengisi gap operasional yang sering terjadi saat koreksi dilakukan lewat print, chat, atau komentar dokumen tanpa kendali status yang rapi:

- Tidak jelas dokumen sedang menunggu siapa.
- Tidak jelas koreksi mana yang sudah ditindaklanjuti.
- Bukti koreksi tercecer di Google Docs, chat, atau file lokal.
- Riwayat draft -> koreksi -> revisi -> final tidak terkunci sebagai evidence trail.

## 2. Positioning Produk

```text
Google Docs = tempat menulis, komentar, suggestion, dan koreksi isi dokumen.
SIKAWAL = tempat mengelola alur koreksi internal, status, snapshot, versi, dan audit.
SRIKANDI = sistem resmi/legal pemerintah untuk surat/arsip/tanda tangan elektronik.
```

Keputusan produk:

- SIKAWAL adalah pendamping internal, bukan pesaing Google Docs atau SRIKANDI.
- Koreksi detail tetap boleh dilakukan di Google Docs.
- Tombol `Selesai Koreksi` di SIKAWAL mengunci bukti koreksi sebagai snapshot immutable.
- SRIKANDI hanya menjadi acuan pembanding untuk menjelaskan gap feedback rinci; SIKAWAL tidak menyimpan, menarik, atau mengirim data ke SRIKANDI.

## 3. Pengguna dan Role

### Pegawai/Penyusun

- Membuat pengajuan naskah.
- Menyediakan link Google Docs atau upload DOCX/PDF.
- Mengirim naskah untuk koreksi Kasubbag Umum.
- Mengirim hasil revisi setelah menerima koreksi.
- Melihat riwayat koreksi dan finalisasi.

### Kasubbag Umum

- Menjadi verifikator tahap pertama.
- Membuka dokumen kerja di Google Docs.
- Memberi komentar/suggestion/coretan melalui Google Docs.
- Menekan `Selesai Koreksi` untuk membuat snapshot koreksi.
- Menyetujui untuk lanjut ke Kepala BPS jika tidak perlu revisi.

### Kepala BPS/Bapak

- Menjadi verifikator terakhir.
- Melakukan koreksi akhir atau menyetujui internal.
- Menentukan dokumen siap final secara internal.

### Admin

- Mengelola user, role, tim, dan konfigurasi dasar.
- Membantu perbaikan data jika terjadi kesalahan operasional.
- Melihat audit trail.

## 4. Core Business

Core business SIKAWAL adalah:

1. Mengatur workflow koreksi internal bertingkat.
2. Menyimpan versi dokumen yang immutable.
3. Mengunci snapshot koreksi saat verifikator menekan `Selesai Koreksi`.
4. Menyimpan feedback/koreksi sebagai file snapshot dan metadata komentar.
5. Menyediakan history dokumen dari draft sampai final.
6. Menyediakan evidence trail untuk audit internal.

Penomoran resmi, arsip legal, dan tanda tangan elektronik bukan core business MVP karena area tersebut sudah menjadi domain SRIKANDI/SOP resmi.

## 5. Workflow Utama

### 5.1 Koreksi Satu Putaran

```text
Draft Pengajuan 1
-> Draft Dikoreksi 1 oleh Kasubbag Umum
-> Hasil Revisi 1 oleh Pegawai
-> Disetujui Kepala BPS
-> Final
```

### 5.2 Koreksi Bertingkat

```text
Draft Pengajuan 1
-> Draft Dikoreksi 1 oleh Kasubbag Umum
-> Hasil Revisi 1 oleh Pegawai
-> Draft Dikoreksi 2 oleh Kepala BPS
-> Hasil Revisi 2 oleh Pegawai
-> Disetujui Internal
-> Final
```

### 5.3 Batas Setelah Final Internal

```text
Koreksi internal tetap dicatat di SIKAWAL
-> dokumen final internal siap
-> proses setelah final mengikuti SOP kantor di luar SIKAWAL
```

## 6. Tombol Selesai Koreksi

Tombol `Selesai Koreksi` adalah fitur kunci.

Saat verifikator menekan tombol ini:

1. Sistem memastikan user berhak menjadi verifikator tahap tersebut.
2. Sistem membuat snapshot koreksi jika reviewer memberi koreksi atau meminta revisi:
   - DOCX hasil export/manual upload.
   - PDF hasil export/manual upload jika tersedia.
   - `comments_json` dari Google Docs jika integrasi tersedia.
   - metadata reviewer, waktu, role, tahap, dan checksum file.
3. Sistem membuat versi immutable jika ada snapshot/koreksi baru:
   - `Draft Dikoreksi 1 oleh Kasubbag Umum`
   - atau `Draft Dikoreksi 2 oleh Kepala BPS`
4. Status berubah ke `Perlu Revisi Pegawai` atau `Disetujui Internal`.
5. Audit log dibuat.

Jika export otomatis gagal, verifikator dapat menggunakan fallback manual upload. Workflow tetap sama.

Setelah Pegawai mengirim hasil revisi, naskah selalu kembali ke Kasubbag Umum sebagai quality gate. Kasubbag Umum yang menentukan apakah revisi perlu diperbaiki lagi atau sudah layak diteruskan ke Kepala BPS.

Jika Kasubbag Umum hanya meneruskan hasil revisi ke Kepala BPS tanpa koreksi tambahan, snapshot tidak wajib. Keputusan tersebut tetap tercatat sebagai approval dan audit trail.

## 7. Status Dokumen

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

## 8. Jenis Versi Dokumen

```text
Draft Pengajuan
Draft Dikoreksi
Hasil Revisi
Naskah Final
```

Aturan:

- Setiap versi baru harus membuat record baru.
- Versi lama tidak boleh ditimpa.
- Versi koreksi wajib memiliki reviewer.
- Hasil revisi wajib memiliki `change_summary`.
- Snapshot koreksi wajib menyimpan minimal satu bukti: file snapshot atau `comments_json`, jika reviewer meminta revisi atau memberi koreksi tambahan.

## 9. Requirement Fungsional MVP

### FR-01 Pengajuan Draft

Pegawai dapat membuat pengajuan naskah dengan metadata minimal:

- Perihal.
- Tujuan/penerima.
- Tanggal naskah.
- Tim/unit.
- Link Google Docs atau file DOCX/PDF.
- Catatan awal jika diperlukan.

### FR-02 Workflow Kasubbag Umum

Kasubbag Umum dapat melihat antrean naskah timnya, membuka Google Docs, memberi koreksi, lalu menekan `Selesai Koreksi` atau menyetujui lanjut ke Kepala BPS.

### FR-03 Workflow Kepala BPS

Kepala BPS dapat melihat naskah yang sudah melalui Kasubbag Umum, memberi koreksi akhir, atau menyetujui internal.

### FR-04 Snapshot Koreksi

Sistem menyimpan bukti koreksi ketika verifikator menekan `Selesai Koreksi`.

Bukti minimal:

- File snapshot DOCX/PDF hasil koreksi atau upload manual.
- Reviewer.
- Role reviewer.
- Waktu snapshot.
- Source Google Doc ID/URL jika ada.
- Checksum file jika ada file.
- Audit log.

### FR-05 History dan Timeline

Sistem menampilkan timeline:

```text
Draft Pengajuan 1
Draft Dikoreksi 1 oleh Kasubbag Umum
Hasil Revisi 1 oleh Pegawai
Draft Dikoreksi 2 oleh Kepala BPS
Hasil Revisi 2 oleh Pegawai
Final
```

### FR-06 Audit Trail

Audit log dibuat untuk:

- Draft dibuat.
- Draft diajukan.
- Koreksi selesai.
- Revisi dikirim.
- Disetujui internal.
- Final dibuat.
- Dokumen dibatalkan.
- Admin mengubah data penting.

### FR-07 Batas Sistem Resmi

SIKAWAL berhenti pada finalisasi internal. Sistem tidak menyimpan metadata proses aplikasi pemerintah lain, tidak membuat penomoran resmi, dan tidak membuat tanda tangan elektronik resmi.

## 10. Non-Goals MVP

- Menggantikan SRIKANDI.
- Menggantikan Google Docs.
- Membuat legal e-signature.
- Membuat editor dokumen penuh di SIKAWAL.
- PDF annotation native penuh di SIKAWAL.
- Penomoran surat resmi otomatis.
- Integrasi langsung SRIKANDI.
- Auto-diff isi dokumen.
- Membaca semua suggestion Google Docs secara sempurna.

## 11. Tech Stack Rekomendasi

MVP gratis/hemat:

- Next.js App Router.
- TypeScript.
- Tailwind CSS.
- shadcn/ui.
- Supabase Auth.
- Supabase Postgres.
- Supabase Storage via adapter.
- Vercel preview/testing.
- Google Docs sebagai editor/koreksi.
- Google Apps Script sebagai bridge opsional untuk export snapshot.

Scale path:

- Supabase paid untuk storage/database lebih besar.
- Google Workspace resmi kantor jika tersedia.
- Storage internal/S3-compatible saat masuk production internal.
- PostgreSQL internal BPS saat migrasi.

## 12. Acceptance Criteria Utama

### AC-01 Draft dan Submit

Given Pegawai membuat draft dengan link Google Docs atau file valid  
When Pegawai mengajukan ke Kasubbag Umum  
Then status menjadi `Menunggu Koreksi Kasubbag Umum`  
And versi `Draft Pengajuan 1` tersimpan.

### AC-02 Selesai Koreksi Kasubbag Umum

Given naskah berstatus `Menunggu Koreksi Kasubbag Umum`  
When Kasubbag Umum menekan `Selesai Koreksi`  
Then sistem membuat versi `Draft Dikoreksi 1 oleh Kasubbag Umum`  
And status menjadi `Perlu Revisi Pegawai`  
And audit log dibuat.

### AC-03 Hasil Revisi

Given naskah berstatus `Perlu Revisi Pegawai`  
When Pegawai mengirim hasil revisi dengan ringkasan perubahan  
Then sistem membuat versi `Hasil Revisi 1`  
And status kembali ke reviewer berikutnya sesuai tahap.

### AC-04 Persetujuan Kepala BPS

Given naskah sudah sampai tahap Kepala BPS  
When Kepala BPS menyetujui internal  
Then status menjadi `Disetujui Internal`  
And dokumen dapat difinalisasi.

### AC-05 Final

Given naskah berstatus `Disetujui Internal`  
When Pegawai/Admin mengunggah naskah final bersih  
Then status menjadi `Final`  
And versi `Naskah Final` tersimpan immutable.

### AC-06 Evidence Trail

Given auditor meminta bukti proses revisi  
When user membuka timeline dokumen  
Then sistem menampilkan urutan versi, reviewer, waktu, snapshot, dan audit log.

## 13. Risiko dan Mitigasi

| Risiko                                            | Mitigasi                                                                                 |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Verifikator lupa menekan `Selesai Koreksi`        | Dashboard menampilkan status masih menunggu, reminder/manual follow-up                   |
| Google Docs berubah setelah koreksi               | Snapshot saat `Selesai Koreksi` menjadi bukti resmi                                      |
| Export DOCX tidak membawa komentar sempurna       | Simpan `comments_json`, PDF snapshot jika tersedia, fallback upload manual               |
| Apps Script gagal/quota habis                     | Fallback manual upload snapshot                                                          |
| Link Google Docs salah akses                      | Validasi URL dan instruksi share hanya ke reviewer terkait                               |
| Dokumen sensitif di cloud eksternal               | Pilot hanya dummy/anonymized kecuali izin resmi                                          |
| Penguji bertanya "kenapa bukan Google Docs saja?" | Jawaban: Google Docs alat komentar, SIKAWAL workflow/evidence trail/status/audit         |
| Penguji bertanya "kenapa bukan SRIKANDI?"         | Jawaban: SRIKANDI legal/arsip resmi, SIKAWAL pre-review internal dan bukti koreksi rinci |

## 14. Open Questions

Open questions ini tidak memblokir setup dan MVP dasar:

- Apakah kantor memiliki Google Workspace resmi atau memakai akun personal/kantor biasa?
- Apakah Apps Script diperbolehkan oleh admin domain jika memakai Workspace?
- Apakah snapshot wajib DOCX saja, PDF saja, atau keduanya?
- Apakah Kepala BPS selalu menjadi verifikator terakhir sebelum final?
- Apakah istilah role final memakai `Kepala BPS`, `Bapak`, atau keduanya di UI?

## 15. Kesimpulan

SIKAWAL layak dilanjutkan sebagai sistem internal untuk mengendalikan koreksi, revisi, snapshot, dan bukti proses sebelum dokumen dianggap final secara internal.

Konsep ini tidak bentrok dengan Google Docs atau SRIKANDI karena SIKAWAL tidak mengambil peran editor utama maupun sistem legal resmi.
