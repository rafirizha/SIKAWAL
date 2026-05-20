# Permission Matrix

Permission harus divalidasi di server. UI boleh menyembunyikan tombol, tetapi backend tetap wajib menolak aksi ilegal.

## Role

```text
Pegawai
Ketua Tim
Kepala BPS
Admin
```

## Aturan Umum

- Pegawai hanya melihat dan mengubah pengajuan miliknya sendiri.
- Ketua Tim melihat dan mengoreksi pengajuan anggota timnya.
- Kepala BPS melihat pengajuan yang sudah sampai tahap Kepala BPS, disetujui internal, atau final.
- Admin dapat melihat seluruh data dan membantu perbaikan operasional.
- Semua perubahan admin pada data penting wajib audit log.

## Matrix Aksi

| Aksi                             | Pegawai                           | Ketua Tim                           | Kepala BPS        | Admin |
| -------------------------------- | --------------------------------- | ----------------------------------- | ----------------- | ----- |
| Membuat draft                    | Ya, milik sendiri                 | Ya, milik sendiri                   | Tidak             | Ya    |
| Melihat draft sendiri            | Ya                                | Ya                                  | Tidak             | Ya    |
| Melihat draft pegawai lain       | Tidak                             | Tidak                               | Tidak             | Ya    |
| Mengajukan ke Ketua Tim          | Ya, milik sendiri                 | Ya, milik sendiri                   | Tidak             | Ya    |
| Melihat antrean koreksi tim      | Tidak                             | Ya, timnya                          | Tidak             | Ya    |
| Selesai koreksi tahap Ketua Tim  | Tidak                             | Ya, timnya                          | Tidak             | Ya    |
| Menyetujui lanjut ke Kepala BPS  | Tidak                             | Ya, timnya                          | Tidak             | Ya    |
| Melihat antrean Kepala BPS       | Tidak                             | Tidak                               | Ya                | Ya    |
| Selesai koreksi tahap Kepala BPS | Tidak                             | Tidak                               | Ya                | Ya    |
| Menyetujui internal              | Tidak                             | Tidak                               | Ya                | Ya    |
| Mengirim hasil revisi            | Ya, milik sendiri                 | Ya, milik sendiri                   | Tidak             | Ya    |
| Upload naskah final              | Ya, milik sendiri jika disetujui  | Ya, milik sendiri jika disetujui    | Ya                | Ya    |
| Mengisi referensi SRIKANDI       | Terbatas milik sendiri jika final | Tidak                               | Ya                | Ya    |
| Membatalkan dokumen              | Ya, sebelum final                 | Ya, sebelum Kepala BPS untuk timnya | Ya, sebelum final | Ya    |
| Melihat audit trail              | Terbatas milik sendiri            | Terbatas timnya                     | Ya                | Ya    |
| Mengelola user/role/tim          | Tidak                             | Tidak                               | Tidak             | Ya    |

## Permission Function Yang Disarankan

```text
canViewLetter(user, letter)
canCreateDraft(user)
canSubmitDraft(user, letter)
canCompleteTeamLeadCorrection(user, letter)
canForwardToHead(user, letter)
canCompleteHeadCorrection(user, letter)
canApproveInternal(user, letter)
canSubmitRevision(user, letter)
canCreateFinalVersion(user, letter)
canUpdateSrikandiReference(user, letter)
canCancelLetter(user, letter)
canViewAuditLog(user, letter)
canManageUsers(user)
```

Jangan menyebarkan kondisi role langsung di component. Component boleh memakai hasil permission untuk tampilan, tetapi keputusan final tetap di server action.
