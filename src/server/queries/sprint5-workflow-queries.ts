import "server-only";

import {
  canCompleteHeadCorrection,
  canSubmitRevision,
} from "@/lib/permissions/letter-permissions";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role-client";
import { LETTER_STATUS, USER_ROLE } from "@/lib/workflow/constants";
import type { DomainUser, LetterStatus, UserRole } from "@/types/domain";

type WorkflowLetterRow = {
  id: string;
  subject: string;
  recipient: string;
  letter_date: string;
  creator_user_id: string;
  team_id: string;
  status: string;
  revision_round: number;
  revision_target_role: string | null;
  google_doc_url: string | null;
  updated_at: string;
};

type UserLookupRow = {
  id: string;
  name: string;
};

type TeamLookupRow = {
  id: string;
  name: string;
};

export type Sprint5WorkflowQueueItem = {
  id: string;
  subject: string;
  recipient: string;
  letterDate: string;
  status: LetterStatus;
  revisionRound: number;
  revisionTargetRole: UserRole | null;
  googleDocUrl: string | null;
  creatorName: string;
  teamName: string;
  updatedAt: string;
};

function uniqueValues(values: string[]) {
  return Array.from(new Set(values));
}

async function getUserNameMap(userIds: string[]) {
  if (!userIds.length) {
    return new Map<string, string>();
  }

  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("users")
    .select("id, name")
    .in("id", userIds);

  if (error) {
    throw new Error("Daftar penyusun belum bisa dibaca.");
  }

  return new Map((data as UserLookupRow[]).map((row) => [row.id, row.name]));
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
    throw new Error("Daftar tim/unit belum bisa dibaca.");
  }

  return new Map((data as TeamLookupRow[]).map((row) => [row.id, row.name]));
}

async function decorateRows(rows: WorkflowLetterRow[]) {
  const [userNameMap, teamNameMap] = await Promise.all([
    getUserNameMap(uniqueValues(rows.map((row) => row.creator_user_id))),
    getTeamNameMap(uniqueValues(rows.map((row) => row.team_id))),
  ]);

  return rows.map((row) => ({
    id: row.id,
    subject: row.subject,
    recipient: row.recipient,
    letterDate: row.letter_date,
    status: row.status as LetterStatus,
    revisionRound: row.revision_round,
    revisionTargetRole: row.revision_target_role as UserRole | null,
    googleDocUrl: row.google_doc_url,
    creatorName: userNameMap.get(row.creator_user_id) ?? "Penyusun tidak aktif",
    teamName: teamNameMap.get(row.team_id) ?? "Tim tidak ditemukan",
    updatedAt: row.updated_at,
  }));
}

export async function getRevisionQueue(
  currentUser: DomainUser,
): Promise<Sprint5WorkflowQueueItem[]> {
  if (!currentUser.isActive) {
    return [];
  }

  if (
    currentUser.role !== USER_ROLE.EMPLOYEE &&
    currentUser.role !== USER_ROLE.GENERAL_SUBDIVISION_HEAD &&
    currentUser.role !== USER_ROLE.ADMIN
  ) {
    return [];
  }

  const supabase = createSupabaseServiceRoleClient();
  let query = supabase
    .from("letters")
    .select(
      "id, subject, recipient, letter_date, creator_user_id, team_id, status, revision_round, revision_target_role, google_doc_url, updated_at",
    )
    .eq("status", LETTER_STATUS.NEEDS_REVISION);

  if (currentUser.role !== USER_ROLE.ADMIN) {
    query = query.eq("creator_user_id", currentUser.id);
  }

  const { data, error } = await query.order("updated_at", {
    ascending: true,
  });

  if (error) {
    throw new Error("Antrean revisi belum bisa dibaca.");
  }

  const rows = ((data ?? []) as WorkflowLetterRow[]).filter((row) =>
    canSubmitRevision(currentUser, {
      creatorUserId: row.creator_user_id,
      teamId: row.team_id,
      status: row.status as LetterStatus,
    }),
  );

  return decorateRows(rows);
}

export async function getHeadCorrectionQueue(
  currentUser: DomainUser,
): Promise<Sprint5WorkflowQueueItem[]> {
  if (!currentUser.isActive) {
    return [];
  }

  if (
    currentUser.role !== USER_ROLE.HEAD &&
    currentUser.role !== USER_ROLE.ADMIN
  ) {
    return [];
  }

  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("letters")
    .select(
      "id, subject, recipient, letter_date, creator_user_id, team_id, status, revision_round, revision_target_role, google_doc_url, updated_at",
    )
    .eq("status", LETTER_STATUS.WAITING_HEAD_CORRECTION)
    .order("updated_at", {
      ascending: true,
    });

  if (error) {
    throw new Error("Antrean Kepala BPS belum bisa dibaca.");
  }

  const rows = ((data ?? []) as WorkflowLetterRow[]).filter((row) =>
    canCompleteHeadCorrection(currentUser, {
      creatorUserId: row.creator_user_id,
      teamId: row.team_id,
      status: row.status as LetterStatus,
    }),
  );

  return decorateRows(rows);
}
