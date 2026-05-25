export const USER_ROLE = {
  EMPLOYEE: "Pegawai",
  GENERAL_SUBDIVISION_HEAD: "Kasubbag Umum",
  HEAD: "Kepala BPS",
  ADMIN: "Admin",
} as const;

export const LETTER_STATUS = {
  DRAFT: "Draft",
  WAITING_GENERAL_SUBDIVISION_CORRECTION: "Menunggu Koreksi Kasubbag Umum",
  NEEDS_REVISION: "Perlu Revisi Pegawai",
  WAITING_HEAD_CORRECTION: "Menunggu Koreksi Kepala BPS",
  INTERNALLY_APPROVED: "Disetujui Internal",
  FINAL: "Final",
  CANCELED: "Dibatalkan",
} as const;

export const VERSION_TYPE = {
  DRAFT_SUBMISSION: "Draft Pengajuan",
  CORRECTED_DRAFT: "Draft Dikoreksi",
  REVISION_RESULT: "Hasil Revisi",
  FINAL_DOCUMENT: "Naskah Final",
} as const;

export const SOURCE_TYPE = {
  GOOGLE_DOCS: "google_docs",
  UPLOAD_DOCX: "upload_docx",
  UPLOAD_PDF: "upload_pdf",
  APPS_SCRIPT_EXPORT: "apps_script_export",
  MANUAL_SNAPSHOT_UPLOAD: "manual_snapshot_upload",
  SYSTEM_FINAL: "system_final",
} as const;

export const APPROVAL_ACTION = {
  SUBMIT_DRAFT: "SUBMIT_DRAFT",
  COMPLETE_CORRECTION: "COMPLETE_CORRECTION",
  REQUEST_REVISION: "REQUEST_REVISION",
  SUBMIT_REVISION: "SUBMIT_REVISION",
  FORWARD_TO_HEAD: "FORWARD_TO_HEAD",
  APPROVE_INTERNAL: "APPROVE_INTERNAL",
  CREATE_FINAL: "CREATE_FINAL",
  CANCEL: "CANCEL",
  UPDATE_SRIKANDI_REFERENCE: "UPDATE_SRIKANDI_REFERENCE",
} as const;

export const DATA_CLASSIFICATION = {
  DUMMY: "dummy",
  ANONYMIZED: "anonymized",
  APPROVED_REAL_DATA: "approved_real_data",
} as const;

export const GOOGLE_INTEGRATION_MODE = {
  MANUAL: "manual",
  APPS_SCRIPT: "apps_script",
} as const;

export const GENERAL_SUBDIVISION_CORRECTION_DECISION = {
  REQUEST_REVISION: "request_revision",
  FORWARD_TO_HEAD: "forward_to_head",
} as const;
