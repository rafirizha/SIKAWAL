# Product

## Register

product

## Users

Staf internal BPS Kabupaten Kepulauan Anambas, sebagian besar **non-teknis**, bekerja dari meja kantor di bawah pencahayaan terang. Empat peran:

- **Pegawai/Penyusun** — membuat pengajuan naskah, melampirkan Google Docs atau DOCX/PDF, mengirim untuk koreksi, dan mengirim hasil revisi.
- **Kasubbag Umum** — verifikator tahap pertama dan quality gate; mengoreksi, mengunci snapshot, lalu meneruskan ke Kepala BPS atau meminta revisi.
- **Kepala BPS** — verifikator terakhir; koreksi akhir atau menyetujui internal.
- **Admin** — mengelola user/role/tim dan menelusuri audit trail.

Konteks kerja: menyelesaikan koreksi surat di sela tugas lain. Yang mereka butuhkan dari layar mana pun adalah jawaban cepat atas "dokumen ini menunggu siapa, dan apa langkah saya berikutnya".

## Product Purpose

SIKAWAL mengendalikan alur koreksi internal naskah surat sebelum dokumen dianggap final secara internal: workflow koreksi bertingkat, versi immutable (append-only), snapshot bukti koreksi saat verifikator menekan `Selesai Koreksi`, dan audit trail lengkap.

SIKAWAL **bukan** pengganti Google Docs (tempat menulis/komentar) atau SRIKANDI (sistem legal/arsip resmi). Ia mengisi gap operasional ketika koreksi tercecer di chat, print, atau komentar dokumen tanpa kendali status: tidak jelas dokumen menunggu siapa, koreksi mana yang sudah ditindaklanjuti, dan bukti prosesnya hilang.

Sukses = saat audit internal, siapa pun bisa membuka satu dokumen dan melihat urutan utuh draft → koreksi → revisi → final, lengkap dengan reviewer, waktu, snapshot, dan audit log, tanpa rekonstruksi manual.

## Brand Personality

Tiga kata: **tenang-terpercaya, rapi-profesional, ramah-tak-intimidatif.**

Institusional dan kredibel (pengguna harus yakin datanya aman dan tercatat sebagai bukti), tetapi mudah didekati staf non-teknis. Bahasa membantu dan jelas, bukan birokratis. Terasa seperti alat kerja yang kompeten, bukan etalase. Arah visual mengacu pada dashboard kelas Stripe/Vercel: profesional, padat informasi namun terorganisir, hierarki kuat, ruang bernapas.

## Anti-references

- **Aplikasi pemerintah jadul** — kaku, ramai, tabel padat tanpa hierarki, tombol abu-abu generik, kesan warisan 2010-an.
- **Startup playful berlebihan** — warna norak, emoji, ilustrasi lucu, gradient mencolok. Tidak pantas untuk konteks formal.
- **Korporat abu-abu membosankan** — generik, hambar, tanpa karakter, semuanya template biru-abu.
- **Ramai & overdesigned** — terlalu banyak kartu, bayangan, animasi, dan dekorasi yang mengganggu fokus kerja.

## Design Principles

1. **Status selalu jelas.** Dari layar mana pun, pengguna langsung tahu dokumen menunggu siapa dan apa langkah berikutnya. Ini masalah inti yang produk ini selesaikan; jangan pernah mengaburkannya dengan dekorasi.
2. **Evidence, bukan klaim.** Setiap koreksi, revisi, dan approval adalah bukti immutable. UI menampilkan jejak yang bisa ditelusuri, bukan sekadar label status.
3. **Alat kerja, bukan etalase.** Desain melayani penyelesaian tugas. Kurangi friksi, klik, dan ornamen; utamakan kecepatan membaca dan bertindak.
4. **Percaya tapi ramah.** Kredibel dan institusional tanpa terasa kaku atau mengintimidasi staf non-teknis. Bahasa dan alur memandu, tidak menghakimi.
5. **Hormati konteks pemerintah.** Formal, akurat, dan aksesibel. Bukti dan kejelasan menang di atas gaya; tapi "formal" tidak berarti jadul atau hambar.

## Accessibility & Inclusion

Target **WCAG 2.1 AA**. Kontras teks tubuh ≥ 4.5:1 (besar/tebal ≥ 3:1), navigasi keyboard penuh dengan focus ring jelas, label dan pesan error yang dapat dibaca screen reader, serta alternatif `prefers-reduced-motion` untuk setiap animasi. Pengguna non-teknis dan pencahayaan kantor yang terang menjadikan keterbacaan dan kontras sebagai prioritas, bukan tambahan.
