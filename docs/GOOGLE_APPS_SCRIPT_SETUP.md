# Google Apps Script Setup

Dokumen ini menjelaskan cara membuat bridge export snapshot Google Docs untuk SIKAWAL.

```text
Google Docs = editor koreksi.
Google Apps Script = bridge export snapshot opsional.
SIKAWAL = workflow, versi, audit, dan evidence trail.
```

## Kapan Dipakai

Aktifkan Apps Script jika ingin tombol `Selesai Koreksi` mencoba export snapshot otomatis dari Google Docs. Fallback manual upload DOCX/PDF tetap wajib tersedia jika export gagal, kuota habis, atau akses Google Docs tidak cukup.

## Buat Project Apps Script

1. Buka <https://script.google.com>.
2. Klik `New project`.
3. Ubah nama project menjadi `SIKAWAL Snapshot Bridge`.
4. Buka `Project Settings`.
5. Tambahkan Script Property:
   - Property: `SIKAWAL_SHARED_SECRET`
   - Value: isi secret acak yang sama dengan `GOOGLE_APPS_SCRIPT_SHARED_SECRET` di `.env.local`.
6. Kembali ke editor `Code.gs`.
7. Paste script di bawah.

```js
const DOCX_MIME_TYPE =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const SHARED_SECRET_PROPERTY = "SIKAWAL_SHARED_SECRET";

function doGet() {
  return createJsonResponse({
    ok: true,
    service: "sikawal-snapshot-bridge",
  });
}

function doPost(e) {
  try {
    const payload = parseJsonPayload(e);
    const expectedSecret = PropertiesService.getScriptProperties().getProperty(
      SHARED_SECRET_PROPERTY,
    );

    if (!expectedSecret || payload.shared_secret !== expectedSecret) {
      return createJsonResponse({
        ok: false,
        status: "error",
        errorMessage: "Unauthorized",
      });
    }

    const googleDocId =
      payload.source_google_doc_id ||
      extractGoogleDocId(payload.source_google_doc_url);

    if (!googleDocId) {
      return createJsonResponse({
        ok: false,
        status: "error",
        fallbackReason: "Google Doc ID tidak tersedia",
      });
    }

    const file = DriveApp.getFileById(googleDocId);
    const exportedAt = new Date().toISOString();
    const docxBlob = file.getBlob().getAs(DOCX_MIME_TYPE);
    const fileName = ensureExtension(file.getName(), ".docx");

    return createJsonResponse({
      ok: true,
      status: "success",
      exportedAt: exportedAt,
      snapshot: {
        fileName: fileName,
        mimeType: DOCX_MIME_TYPE,
        base64: Utilities.base64Encode(docxBlob.getBytes()),
      },
      commentsJson: {
        source: "apps_script_basic_export",
        exportedAt: exportedAt,
        sourceGoogleDocId: googleDocId,
        reviewerUserId: payload.reviewer_user_id || null,
        reviewerRole: payload.reviewer_role || null,
        revisionRound: payload.revision_round || null,
        note: "Basic bridge exports DOCX snapshot. Manual upload remains the fallback if comments are not captured as expected.",
      },
    });
  } catch (error) {
    return createJsonResponse({
      ok: false,
      status: "error",
      errorMessage: error && error.message ? error.message : String(error),
    });
  }
}

function parseJsonPayload(e) {
  if (!e || !e.postData || !e.postData.contents) {
    throw new Error("Request body kosong");
  }

  return JSON.parse(e.postData.contents);
}

function extractGoogleDocId(url) {
  const match = String(url || "").match(/\/document\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

function ensureExtension(fileName, extension) {
  const normalizedName = String(fileName || "snapshot");
  return normalizedName.toLowerCase().endsWith(extension)
    ? normalizedName
    : normalizedName + extension;
}

function createJsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
```

## Deploy Web App

1. Klik `Deploy` > `New deployment`.
2. Klik ikon gear pada `Select type`, pilih `Web app`.
3. Isi description, misalnya `SIKAWAL snapshot bridge`.
4. `Execute as`: pilih `Me`.
5. `Who has access`: pilih `Anyone` agar server SIKAWAL bisa memanggil URL tanpa login Google.
6. Klik `Deploy`, beri izin akses Drive saat diminta.
7. Copy URL yang berakhir dengan `/exec`.

Catatan: endpoint web app memang dapat dipanggil publik, tetapi dokumen Google Docs tidak otomatis menjadi publik. Script hanya bisa membaca file yang dapat diakses oleh akun Google yang melakukan deploy, dan request tetap divalidasi memakai `shared_secret` dari body request.

Jika kebijakan kantor/domain Google Workspace tidak mengizinkan web app `Anyone`, jangan dipaksa. Tetap gunakan fallback manual upload dulu, atau naikkan bridge ke opsi yang lebih formal seperti Cloud Run/Google Workspace service account pada fase setelah MVP.

## Isi Environment SIKAWAL

Tambahkan di `.env.local`:

```env
GOOGLE_INTEGRATION_MODE=apps_script
GOOGLE_APPS_SCRIPT_EXPORT_URL=https://script.google.com/macros/s/ISI_DEPLOYMENT_ID/exec
GOOGLE_APPS_SCRIPT_SHARED_SECRET=isi-secret-yang-sama-dengan-script-property
GOOGLE_APPS_SCRIPT_TIMEOUT_MS=10000
```

Restart dev server setelah mengubah env.

## Checklist Uji Manual

1. Pastikan akun deployer Apps Script punya akses editor/viewer ke Google Docs target.
2. Buka URL `/exec` di browser. Response minimal harus `{"ok":true,...}`.
3. Di SIKAWAL, login sebagai `Kasubbag Umum`.
4. Buka surat status `Menunggu Koreksi Kasubbag Umum`.
5. Klik `Buka Dokumen Koreksi`, beri komentar/suggestion di Google Docs.
6. Kembali ke SIKAWAL, klik `Selesai Koreksi`.
7. Pastikan version `Draft Dikoreksi` dibuat, snapshot tersimpan, status berubah ke `Perlu Revisi Pegawai`, dan audit log tercatat.

## Failure Modes

| Kondisi                               | Tindakan                                                                       |
| ------------------------------------- | ------------------------------------------------------------------------------ |
| Apps Script URL salah                 | Cek env dan redeploy Web App                                                   |
| Unauthorized                          | Samakan `SIKAWAL_SHARED_SECRET` dan `GOOGLE_APPS_SCRIPT_SHARED_SECRET`         |
| File tidak bisa dibaca                | Share Google Docs ke akun deployer Apps Script                                 |
| Export terlalu besar atau kuota habis | Gunakan fallback manual upload DOCX/PDF                                        |
| Komentar tidak ikut di DOCX           | Pakai fallback manual atau lanjutkan bridge advanced dengan Drive API comments |

## Batasan v1

Bridge basic ini fokus pada snapshot file DOCX. Capture komentar secara terstruktur dari Google Drive API dapat ditambahkan nanti tanpa mengubah core business SIKAWAL, karena workflow, permission, versioning, dan audit tetap dikunci di server/database SIKAWAL.
