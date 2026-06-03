import "server-only";

import {
  canCancelLetter,
  canCreateFinalVersion,
  canViewAuditLog,
  canViewLetter,
} from "@/lib/permissions/letter-permissions";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role-client";
import { SOURCE_TYPE } from "@/lib/workflow/constants";
import {
  createStoredDocumentSignedUrlMap,
  formatFileSize,
} from "@/server/queries/letter-working-documents";
import type {
  ApprovalAction,
  DomainUser,
  LetterStatus,
  SourceType,
  UserRole,
  VersionType,
} from "@/types/domain";
import type { Json } from "@/types/supabase";

type LetterDetailRow = {
  id: string;
  subject: string;
  recipient: string;
  letter_date: string;
  creator_user_id: string;
  team_id: string;
  status: string;
  current_reviewer_role: string | null;
  revision_target_role: string | null;
  revision_round: number;
  google_doc_url: string | null;
  final_version_id: string | null;
  cancel_reason: string | null;
  created_at: string;
  updated_at: string;
};

type LetterVersionRow = {
  id: string;
  parent_version_id: string | null;
  version_number: number;
  revision_round: number;
  version_type: string;
  title: string;
  source_type: string;
  storage_path: string | null;
  file_mime_type: string | null;
  file_size_bytes: number | string | null;
  checksum_sha256: string | null;
  google_doc_url: string | null;
  comments_json: Json | null;
  created_by_user_id: string;
  reviewer_user_id: string | null;
  reviewer_role: string | null;
  notes: string | null;
  change_summary: string | null;
  exported_at: string | null;
  created_at: string;
};

type ApprovalRow = {
  id: string;
  actor_user_id: string;
  actor_role: string;
  action: string;
  from_status: string | null;
  to_status: string | null;
  notes: string | null;
  version_id: string | null;
  created_at: string;
};

type AuditLogRow = {
  id: string;
  action: string;
  actor_user_id: string | null;
  actor_role: string | null;
  from_status: string | null;
  to_status: string | null;
  metadata: Json;
  created_at: string;
};

type UserLookupRow = {
  id: string;
  name: string;
  role: string;
};

type TeamLookupRow = {
  id: string;
  name: string;
};

export type LetterDetailVersion = {
  id: string;
  parentVersionId: string | null;
  versionNumber: number;
  revisionRound: number;
  versionType: VersionType;
  title: string;
  sourceType: SourceType;
  sourceLabel: string;
  documentUrl: string | null;
  googleDocUrl: string | null;
  fileMeta: string | null;
  checksumSha256: string | null;
  createdByName: string;
  reviewerName: string | null;
  reviewerRole: UserRole | null;
  notes: string | null;
  changeSummary: string | null;
  hasCommentsJson: boolean;
  exportedAt: string | null;
  createdAt: string;
};

export type LetterDetailApproval = {
  id: string;
  actorName: string;
  actorRole: UserRole;
  action: ApprovalAction;
  fromStatus: LetterStatus | null;
  toStatus: LetterStatus | null;
  notes: string | null;
  versionId: string | null;
  createdAt: string;
};

export type LetterDetailAuditLog = {
  id: string;
  action: string;
  actorName: string | null;
  actorRole: UserRole | null;
  fromStatus: LetterStatus | null;
  toStatus: LetterStatus | null;
  metadata: Json;
  createdAt: string;
};

export type LetterDetail = {
  id: string;
  subject: string;
  recipient: string;
  letterDate: string;
  status: LetterStatus;
  currentReviewerRole: UserRole | null;
  revisionTargetRole: UserRole | null;
  revisionRound: number;
  googleDocUrl: string | null;
  finalVersionId: string | null;
  cancelReason: string | null;
  creatorName: string;
  teamName: string;
  createdAt: string;
  updatedAt: string;
  canCreateFinal: boolean;
  canCancel: boolean;
  canViewAudit: boolean;
  versions: LetterDetailVersion[];
  approvals: LetterDetailApproval[];
  auditLogs: LetterDetailAuditLog[];
};

function uniqueValues(values: Array<string | null>) {
  return Array.from(
    new Set(values.filter((value): value is string => !!value)),
  );
}

function getSourceLabel(sourceType: SourceType | string) {
  if (sourceType === SOURCE_TYPE.GOOGLE_DOCS) {
    return "Google Docs";
  }

  if (sourceType === SOURCE_TYPE.UPLOAD_DOCX) {
    return "DOCX";
  }

  if (sourceType === SOURCE_TYPE.UPLOAD_PDF) {
    return "PDF";
  }

  if (sourceType === SOURCE_TYPE.APPS_SCRIPT_EXPORT) {
    return "Snapshot otomatis";
  }

  if (sourceType === SOURCE_TYPE.MANUAL_SNAPSHOT_UPLOAD) {
    return "Snapshot manual";
  }

  if (sourceType === SOURCE_TYPE.SYSTEM_FINAL) {
    return "Final sistem";
  }

  return "Dokumen";
}

function getFileMeta(row: LetterVersionRow) {
  const parts = [
    getSourceLabel(row.source_type),
    row.file_mime_type,
    formatFileSize(row.file_size_bytes),
  ].filter(Boolean);

  return parts.length ? parts.join(" - ") : null;
}

async function getUserMap(userIds: string[]) {
  if (!userIds.length) {
    return new Map<string, UserLookupRow>();
  }

  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("users")
    .select("id, name, role")
    .in("id", userIds);

  if (error) {
    throw new Error("Daftar user timeline belum bisa dibaca.");
  }

  return new Map((data as UserLookupRow[]).map((row) => [row.id, row]));
}

async function getTeamMap(teamIds: string[]) {
  if (!teamIds.length) {
    return new Map<string, TeamLookupRow>();
  }

  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("teams")
    .select("id, name")
    .in("id", teamIds);

  if (error) {
    throw new Error("Daftar tim timeline belum bisa dibaca.");
  }

  return new Map((data as TeamLookupRow[]).map((row) => [row.id, row]));
}

export async function getLetterDetail(
  currentUser: DomainUser,
  letterId: string,
): Promise<LetterDetail | null> {
  if (!currentUser.isActive) {
    return null;
  }

  const supabase = createSupabaseServiceRoleClient();
  const { data: letter, error: letterError } = await supabase
    .from("letters")
    .select(
      "id, subject, recipient, letter_date, creator_user_id, team_id, status, current_reviewer_role, revision_target_role, revision_round, google_doc_url, final_version_id, cancel_reason, created_at, updated_at",
    )
    .eq("id", letterId)
    .single();

  if (letterError || !letter) {
    return null;
  }

  const letterRow = letter as LetterDetailRow;
  const permissionLetter = {
    creatorUserId: letterRow.creator_user_id,
    teamId: letterRow.team_id,
    status: letterRow.status as LetterStatus,
  };

  if (!canViewLetter(currentUser, permissionLetter)) {
    return null;
  }

  const canViewAudit = canViewAuditLog(currentUser, permissionLetter);
  const [
    { data: versionRows, error: versionError },
    { data: approvalRows, error: approvalError },
    auditResult,
  ] = await Promise.all([
    supabase
      .from("letter_versions")
      .select(
        "id, parent_version_id, version_number, revision_round, version_type, title, source_type, storage_path, file_mime_type, file_size_bytes, checksum_sha256, google_doc_url, comments_json, created_by_user_id, reviewer_user_id, reviewer_role, notes, change_summary, exported_at, created_at",
      )
      .eq("letter_id", letterId)
      .order("version_number", { ascending: true }),
    supabase
      .from("approvals")
      .select(
        "id, actor_user_id, actor_role, action, from_status, to_status, notes, version_id, created_at",
      )
      .eq("letter_id", letterId)
      .order("created_at", { ascending: true }),
    canViewAudit
      ? supabase
          .from("audit_logs")
          .select(
            "id, action, actor_user_id, actor_role, from_status, to_status, metadata, created_at",
          )
          .eq("entity_type", "letter")
          .eq("entity_id", letterId)
          .order("created_at", { ascending: true })
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (versionError) {
    throw new Error("Timeline versi belum bisa dibaca.");
  }

  if (approvalError) {
    throw new Error("Riwayat approval belum bisa dibaca.");
  }

  if (auditResult.error) {
    throw new Error("Audit log belum bisa dibaca.");
  }

  const versions = (versionRows ?? []) as LetterVersionRow[];
  const approvals = (approvalRows ?? []) as ApprovalRow[];
  const auditLogs = (auditResult.data ?? []) as AuditLogRow[];
  const [userMap, teamMap, signedUrlMap] = await Promise.all([
    getUserMap(
      uniqueValues([
        letterRow.creator_user_id,
        ...versions.flatMap((row) => [
          row.created_by_user_id,
          row.reviewer_user_id,
        ]),
        ...approvals.map((row) => row.actor_user_id),
        ...auditLogs.map((row) => row.actor_user_id),
      ]),
    ),
    getTeamMap([letterRow.team_id]),
    createStoredDocumentSignedUrlMap(
      uniqueValues(versions.map((row) => row.storage_path)),
    ),
  ]);

  return {
    id: letterRow.id,
    subject: letterRow.subject,
    recipient: letterRow.recipient,
    letterDate: letterRow.letter_date,
    status: letterRow.status as LetterStatus,
    currentReviewerRole: letterRow.current_reviewer_role as UserRole | null,
    revisionTargetRole: letterRow.revision_target_role as UserRole | null,
    revisionRound: letterRow.revision_round,
    googleDocUrl: letterRow.google_doc_url,
    finalVersionId: letterRow.final_version_id,
    cancelReason: letterRow.cancel_reason,
    creatorName:
      userMap.get(letterRow.creator_user_id)?.name ?? "Penyusun tidak aktif",
    teamName: teamMap.get(letterRow.team_id)?.name ?? "Tim tidak ditemukan",
    createdAt: letterRow.created_at,
    updatedAt: letterRow.updated_at,
    canCreateFinal: canCreateFinalVersion(currentUser, permissionLetter),
    canCancel: canCancelLetter(currentUser, permissionLetter),
    canViewAudit,
    versions: versions.map((row) => ({
      id: row.id,
      parentVersionId: row.parent_version_id,
      versionNumber: row.version_number,
      revisionRound: row.revision_round,
      versionType: row.version_type as VersionType,
      title: row.title,
      sourceType: row.source_type as SourceType,
      sourceLabel: getSourceLabel(row.source_type),
      documentUrl: row.storage_path
        ? (signedUrlMap.get(row.storage_path) ?? null)
        : null,
      googleDocUrl: row.google_doc_url,
      fileMeta: getFileMeta(row),
      checksumSha256: row.checksum_sha256,
      createdByName:
        userMap.get(row.created_by_user_id)?.name ?? "User tidak aktif",
      reviewerName: row.reviewer_user_id
        ? (userMap.get(row.reviewer_user_id)?.name ?? "Reviewer tidak aktif")
        : null,
      reviewerRole: row.reviewer_role as UserRole | null,
      notes: row.notes,
      changeSummary: row.change_summary,
      hasCommentsJson: row.comments_json !== null,
      exportedAt: row.exported_at,
      createdAt: row.created_at,
    })),
    approvals: approvals.map((row) => ({
      id: row.id,
      actorName: userMap.get(row.actor_user_id)?.name ?? "User tidak aktif",
      actorRole: row.actor_role as UserRole,
      action: row.action as ApprovalAction,
      fromStatus: row.from_status as LetterStatus | null,
      toStatus: row.to_status as LetterStatus | null,
      notes: row.notes,
      versionId: row.version_id,
      createdAt: row.created_at,
    })),
    auditLogs: auditLogs.map((row) => ({
      id: row.id,
      action: row.action,
      actorName: row.actor_user_id
        ? (userMap.get(row.actor_user_id)?.name ?? "User tidak aktif")
        : null,
      actorRole: row.actor_role as UserRole | null,
      fromStatus: row.from_status as LetterStatus | null,
      toStatus: row.to_status as LetterStatus | null,
      metadata: row.metadata,
      createdAt: row.created_at,
    })),
  };
}
