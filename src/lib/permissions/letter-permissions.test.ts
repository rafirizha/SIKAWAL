import { describe, expect, it } from "vitest";

import {
  canCompleteHeadCorrection,
  canCompleteTeamLeadCorrection,
  canCreateDraft,
  canSubmitDraft,
  canSubmitRevision,
  canUpdateSrikandiReference,
  canViewLetter,
  type PermissionLetter,
  type PermissionUser,
} from "@/lib/permissions/letter-permissions";
import { LETTER_STATUS, USER_ROLE } from "@/lib/workflow/constants";

const employee: PermissionUser = {
  id: "employee-1",
  role: USER_ROLE.EMPLOYEE,
  teamId: "team-1",
  isActive: true,
};

const otherEmployee: PermissionUser = {
  id: "employee-2",
  role: USER_ROLE.EMPLOYEE,
  teamId: "team-2",
  isActive: true,
};

const teamLead: PermissionUser = {
  id: "lead-1",
  role: USER_ROLE.TEAM_LEAD,
  teamId: "team-1",
  isActive: true,
};

const head: PermissionUser = {
  id: "head-1",
  role: USER_ROLE.HEAD,
  teamId: null,
  isActive: true,
};

const admin: PermissionUser = {
  id: "admin-1",
  role: USER_ROLE.ADMIN,
  teamId: null,
  isActive: true,
};

const draftLetter: PermissionLetter = {
  creatorUserId: employee.id,
  teamId: "team-1",
  status: LETTER_STATUS.DRAFT,
};

describe("letter permissions", () => {
  it("allows employee and team lead to create drafts but rejects head", () => {
    expect(canCreateDraft(employee)).toBe(true);
    expect(canCreateDraft(teamLead)).toBe(true);
    expect(canCreateDraft(head)).toBe(false);
  });

  it("keeps employee drafts private before submit", () => {
    expect(canViewLetter(employee, draftLetter)).toBe(true);
    expect(canViewLetter(otherEmployee, draftLetter)).toBe(false);
    expect(canViewLetter(teamLead, draftLetter)).toBe(false);
    expect(canViewLetter(admin, draftLetter)).toBe(true);
  });

  it("allows only owner or admin to submit a draft", () => {
    expect(canSubmitDraft(employee, draftLetter)).toBe(true);
    expect(canSubmitDraft(otherEmployee, draftLetter)).toBe(false);
    expect(canSubmitDraft(admin, draftLetter)).toBe(true);
  });

  it("allows team lead correction only for same-team waiting documents", () => {
    const waitingLetter = {
      ...draftLetter,
      status: LETTER_STATUS.WAITING_TEAM_LEAD_CORRECTION,
    };

    expect(canCompleteTeamLeadCorrection(teamLead, waitingLetter)).toBe(true);
    expect(canCompleteTeamLeadCorrection(head, waitingLetter)).toBe(false);
  });

  it("allows head correction only at head review stage", () => {
    const headLetter = {
      ...draftLetter,
      status: LETTER_STATUS.WAITING_HEAD_CORRECTION,
    };

    expect(canCompleteHeadCorrection(head, headLetter)).toBe(true);
    expect(canCompleteHeadCorrection(teamLead, headLetter)).toBe(false);
  });

  it("allows creator to submit revision only when revision is required", () => {
    const revisionLetter = {
      ...draftLetter,
      status: LETTER_STATUS.NEEDS_REVISION,
    };

    expect(canSubmitRevision(employee, revisionLetter)).toBe(true);
    expect(canSubmitRevision(employee, draftLetter)).toBe(false);
  });

  it("allows SRIKANDI reference only after final", () => {
    const finalLetter = {
      ...draftLetter,
      status: LETTER_STATUS.FINAL,
    };
    const teamLeadOwnedFinalLetter = {
      ...finalLetter,
      creatorUserId: teamLead.id,
    };

    expect(canUpdateSrikandiReference(employee, finalLetter)).toBe(true);
    expect(canUpdateSrikandiReference(teamLead, teamLeadOwnedFinalLetter)).toBe(
      false,
    );
    expect(canUpdateSrikandiReference(head, finalLetter)).toBe(true);
    expect(canUpdateSrikandiReference(admin, finalLetter)).toBe(true);
    expect(canUpdateSrikandiReference(employee, draftLetter)).toBe(false);
  });
});
