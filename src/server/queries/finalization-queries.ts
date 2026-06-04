import "server-only";

import { canCreateFinalVersion } from "@/lib/permissions/letter-permissions";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role-client";
import { LETTER_STATUS, USER_ROLE } from "@/lib/workflow/constants";
import { getLatestStoredDocumentMap } from "@/server/queries/letter-working-documents";
import type { DomainUser, LetterStatus } from "@/types/domain";

type FinalizationLetterRow = {
  id: string;
  subject: string;
  recipient: string;
  letter_date: string;
  creator_user_id: string;
  team_id: string;
  status: string;
  revision_round: number;
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

export type FinalizationQueueItem = {
  id: string;
  subject: string;
  recipient: string;
  letterDate: string;
  status: LetterStatus;
  revisionRound: number;
  googleDocUrl: string | null;
  storedDocumentLabel: string | null;
  storedDocumentMeta: string | null;
  storedDocumentUrl: string | null;
  correctionNoteLabel: string | null;
  correctionNote: string | null;
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

export async function getFinalizationQueue(
  currentUser: DomainUser,
): Promise<FinalizationQueueItem[]> {
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
      "id, subject, recipient, letter_date, creator_user_id, team_id, status, revision_round, google_doc_url, updated_at",
    )
    .eq("status", LETTER_STATUS.INTERNALLY_APPROVED);

  if (currentUser.role !== USER_ROLE.ADMIN) {
    query = query.eq("creator_user_id", currentUser.id);
  }

  const { data, error } = await query.order("updated_at", {
    ascending: true,
  });

  if (error) {
    throw new Error("Daftar naskah siap final belum bisa dibaca.");
  }

  const rows = ((data ?? []) as FinalizationLetterRow[]).filter((row) =>
    canCreateFinalVersion(currentUser, {
      creatorUserId: row.creator_user_id,
      teamId: row.team_id,
      status: row.status as LetterStatus,
    }),
  );

  const [userNameMap, teamNameMap, storedDocumentMap] = await Promise.all([
    getUserNameMap(uniqueValues(rows.map((row) => row.creator_user_id))),
    getTeamNameMap(uniqueValues(rows.map((row) => row.team_id))),
    getLatestStoredDocumentMap(rows.map((row) => row.id)),
  ]);

  return rows.map((row) => {
    const storedDocument = storedDocumentMap.get(row.id);

    return {
      id: row.id,
      subject: row.subject,
      recipient: row.recipient,
      letterDate: row.letter_date,
      status: row.status as LetterStatus,
      revisionRound: row.revision_round,
      googleDocUrl: row.google_doc_url,
      storedDocumentLabel: storedDocument?.label ?? null,
      storedDocumentMeta: storedDocument?.meta ?? null,
      storedDocumentUrl: storedDocument?.url ?? null,
      correctionNoteLabel: null,
      correctionNote: null,
      creatorName:
        userNameMap.get(row.creator_user_id) ?? "Penyusun tidak aktif",
      teamName: teamNameMap.get(row.team_id) ?? "Tim tidak ditemukan",
      updatedAt: row.updated_at,
    };
  });
}
