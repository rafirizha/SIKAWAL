import { afterEach, describe, expect, it, vi } from "vitest";

import {
  LETTER_STATUS,
  USER_ROLE,
  VERSION_TYPE,
} from "@/lib/workflow/constants";
import { getEmployeeStatusItems } from "@/server/queries/employee-status-queries";

vi.mock("server-only", () => ({}));

const mockState = vi.hoisted(() => ({
  lettersRows: [] as Array<Record<string, unknown>>,
  storedDocumentMap: new Map<
    string,
    { label: string; meta: string; url: string }
  >(),
  teamRows: [] as Array<{ id: string; name: string }>,
  versionRows: [] as Array<Record<string, unknown>>,
}));

function createThenableQuery(result: { data: unknown[]; error: null }) {
  const query: {
    select: (columns: string) => typeof query;
    eq: (column: string, value: string) => typeof query;
    in: (column: string, values: string[]) => typeof query;
    not: (column: string, operator: string, value: null) => typeof query;
    order: (column: string, options?: { ascending?: boolean }) => typeof query;
    then: (
      resolve: (value: { data: unknown[]; error: null }) => void,
      reject: (reason?: unknown) => void,
    ) => Promise<void>;
  } = {
    select: () => query,
    eq: () => query,
    in: () => query,
    not: () => query,
    order: () => query,
    then: (resolve, reject) => Promise.resolve(result).then(resolve, reject),
  };

  return query;
}

const mockFrom = vi.fn((table: string) => {
  if (table === "letters") {
    return createThenableQuery({
      data: mockState.lettersRows,
      error: null,
    });
  }

  if (table === "teams") {
    return createThenableQuery({
      data: mockState.teamRows,
      error: null,
    });
  }

  if (table === "letter_versions") {
    return createThenableQuery({
      data: mockState.versionRows,
      error: null,
    });
  }

  throw new Error(`Unexpected table: ${table}`);
});

vi.mock("@/lib/supabase/service-role-client", () => ({
  createSupabaseServiceRoleClient: () => ({
    from: mockFrom,
  }),
}));

vi.mock("@/server/queries/letter-working-documents", () => ({
  getLatestStoredDocumentMap: vi.fn(async () => mockState.storedDocumentMap),
}));

describe("getEmployeeStatusItems", () => {
  afterEach(() => {
    mockState.lettersRows = [];
    mockState.storedDocumentMap = new Map();
    mockState.teamRows = [];
    mockState.versionRows = [];
    vi.clearAllMocks();
  });

  it("shows Kepala BPS the head-stage document even when another user created it", async () => {
    mockState.lettersRows = [
      {
        id: "letter-head",
        subject: "Undangan Rapat Coba",
        recipient: "BPK",
        letter_date: "2026-05-26",
        creator_user_id: "dbb737a6-2428-4b97-b1cf-500607e342a1",
        team_id: "10000000-0000-0000-0000-000000000001",
        status: LETTER_STATUS.WAITING_HEAD_CORRECTION,
        current_reviewer_role: USER_ROLE.HEAD,
        revision_target_role: null,
        revision_round: 1,
        google_doc_url: "https://docs.google.com/document/d/head-stage/edit",
        updated_at: "2026-05-26T10:01:27.700968+00:00",
      },
      {
        id: "letter-draft",
        subject: "Draft Pribadi",
        recipient: "Internal",
        letter_date: "2026-05-26",
        creator_user_id: "another-user",
        team_id: "10000000-0000-0000-0000-000000000001",
        status: LETTER_STATUS.DRAFT,
        current_reviewer_role: null,
        revision_target_role: null,
        revision_round: 0,
        google_doc_url: null,
        updated_at: "2026-05-26T09:01:27.700968+00:00",
      },
    ];
    mockState.teamRows = [
      {
        id: "10000000-0000-0000-0000-000000000001",
        name: "Tim Umum",
      },
    ];
    mockState.versionRows = [
      {
        letter_id: "letter-head",
        version_number: 2,
        version_type: VERSION_TYPE.CORRECTED_DRAFT,
        title: "Draft Dikoreksi 2",
        created_at: "2026-05-26T09:45:00.000Z",
      },
    ];

    const items = await getEmployeeStatusItems({
      id: "718fd459-daf9-4aeb-92b9-b909208c7c4c",
      name: "Kepala BPS Dummy",
      email: "kepala-bps@example.test",
      role: USER_ROLE.HEAD,
      teamId: null,
      isActive: true,
    });

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      id: "letter-head",
      subject: "Undangan Rapat Coba",
      status: LETTER_STATUS.WAITING_HEAD_CORRECTION,
      teamName: "Tim Umum",
      latestVersionNumber: 2,
      latestVersionTitle: "Draft Dikoreksi 2",
      currentStageLabel: "Kepala BPS",
      nextActionLabel: "Menunggu Kepala BPS",
    });
    expect(mockFrom).toHaveBeenCalledWith("letters");
  });
});
