import "server-only";

import { canViewLetter } from "@/lib/permissions/letter-permissions";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role-client";
import { LETTER_STATUS } from "@/lib/workflow/constants";
import { getLatestStoredDocumentMap } from "@/server/queries/letter-working-documents";
import type {
  DomainUser,
  LetterStatus,
  UserRole,
  VersionType,
} from "@/types/domain";

type EmployeeStatusLetterRow = {
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
  updated_at: string;
};

type TeamLookupRow = {
  id: string;
  name: string;
};

type LatestVersionRow = {
  letter_id: string;
  version_number: number;
  version_type: string;
  title: string;
  created_at: string;
};

type LatestVersionSummary = {
  title: string;
  versionNumber: number;
  versionType: VersionType;
};

export type EmployeeStatusItem = {
  id: string;
  subject: string;
  recipient: string;
  letterDate: string;
  status: LetterStatus;
  currentReviewerRole: UserRole | null;
  revisionTargetRole: UserRole | null;
  revisionRound: number;
  googleDocUrl: string | null;
  storedDocumentLabel: string | null;
  storedDocumentMeta: string | null;
  storedDocumentUrl: string | null;
  teamName: string;
  updatedAt: string;
  latestVersionTitle: string | null;
  latestVersionNumber: number | null;
  latestVersionType: VersionType | null;
  currentStageLabel: string;
  nextActionLabel: string;
};

function uniqueValues(values: string[]) {
  return Array.from(new Set(values));
}

function getCurrentStageLabel(row: EmployeeStatusLetterRow) {
  if (row.status === LETTER_STATUS.DRAFT) {
    return "Penyusun";
  }

  if (row.status === LETTER_STATUS.WAITING_GENERAL_SUBDIVISION_CORRECTION) {
    return "Kasubbag Umum";
  }

  if (row.status === LETTER_STATUS.NEEDS_REVISION) {
    return "Penyusun";
  }

  if (row.status === LETTER_STATUS.WAITING_HEAD_CORRECTION) {
    return "Kepala BPS";
  }

  if (row.status === LETTER_STATUS.INTERNALLY_APPROVED) {
    return "Finalisasi internal";
  }

  return "Selesai";
}

function getNextActionLabel(row: EmployeeStatusLetterRow) {
  if (row.status === LETTER_STATUS.DRAFT) {
    return "Ajukan draft";
  }

  if (row.status === LETTER_STATUS.WAITING_GENERAL_SUBDIVISION_CORRECTION) {
    return "Menunggu Kasubbag";
  }

  if (row.status === LETTER_STATUS.NEEDS_REVISION) {
    return "Kirim revisi";
  }

  if (row.status === LETTER_STATUS.WAITING_HEAD_CORRECTION) {
    return "Menunggu Kepala BPS";
  }

  if (row.status === LETTER_STATUS.INTERNALLY_APPROVED) {
    return "Buat naskah final";
  }

  if (row.status === LETTER_STATUS.FINAL) {
    return "Final";
  }

  return "Dibatalkan";
}

async function getTeamNameMap(teamIds: string[]) {
  if (!teamIds.length) {
    return new Map<string, string>();
  }

  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("teams")
    .select("id, name")
    .in("id", teamIds);

  if (error) {
    throw new Error("Daftar tim/unit dokumen belum bisa dibaca.");
  }

  return new Map((data as TeamLookupRow[]).map((row) => [row.id, row.name]));
}

async function getLatestVersionMap(letterIds: string[]) {
  const uniqueLetterIds = uniqueValues(letterIds);

  if (!uniqueLetterIds.length) {
    return new Map<string, LatestVersionSummary>();
  }

  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("letter_versions")
    .select("letter_id, version_number, version_type, title, created_at")
    .in("letter_id", uniqueLetterIds)
    .order("version_number", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Versi terakhir dokumen belum bisa dibaca.");
  }

  const versionMap = new Map<string, LatestVersionSummary>();

  for (const row of (data ?? []) as LatestVersionRow[]) {
    if (versionMap.has(row.letter_id)) {
      continue;
    }

    versionMap.set(row.letter_id, {
      title: row.title,
      versionNumber: row.version_number,
      versionType: row.version_type as VersionType,
    });
  }

  return versionMap;
}

export async function getEmployeeStatusItems(
  currentUser: DomainUser,
): Promise<EmployeeStatusItem[]> {
  if (!currentUser.isActive) {
    return [];
  }

  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("letters")
    .select(
      "id, subject, recipient, letter_date, creator_user_id, team_id, status, current_reviewer_role, revision_target_role, revision_round, google_doc_url, updated_at",
    )
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error("Status dokumen belum bisa dibaca.");
  }

  const rows = ((data ?? []) as EmployeeStatusLetterRow[]).filter((row) =>
    canViewLetter(currentUser, {
      creatorUserId: row.creator_user_id,
      teamId: row.team_id,
      status: row.status as LetterStatus,
    }),
  );
  const [teamNameMap, storedDocumentMap, latestVersionMap] = await Promise.all([
    getTeamNameMap(uniqueValues(rows.map((row) => row.team_id))),
    getLatestStoredDocumentMap(rows.map((row) => row.id)),
    getLatestVersionMap(rows.map((row) => row.id)),
  ]);

  return rows.map((row) => {
    const storedDocument = storedDocumentMap.get(row.id);
    const latestVersion = latestVersionMap.get(row.id);

    return {
      id: row.id,
      subject: row.subject,
      recipient: row.recipient,
      letterDate: row.letter_date,
      status: row.status as LetterStatus,
      currentReviewerRole: row.current_reviewer_role as UserRole | null,
      revisionTargetRole: row.revision_target_role as UserRole | null,
      revisionRound: row.revision_round,
      googleDocUrl: row.google_doc_url,
      storedDocumentLabel: storedDocument?.label ?? null,
      storedDocumentMeta: storedDocument?.meta ?? null,
      storedDocumentUrl: storedDocument?.url ?? null,
      teamName: teamNameMap.get(row.team_id) ?? "Tim tidak ditemukan",
      updatedAt: row.updated_at,
      latestVersionTitle: latestVersion?.title ?? null,
      latestVersionNumber: latestVersion?.versionNumber ?? null,
      latestVersionType: latestVersion?.versionType ?? null,
      currentStageLabel: getCurrentStageLabel(row),
      nextActionLabel: getNextActionLabel(row),
    };
  });
}
