import { describe, expect, it } from "vitest";

import {
  canCompleteHeadCorrection,
  canCompleteGeneralSubdivisionCorrection,
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

const generalSubdivisionHead: PermissionUser = {
  id: "general-subdivision-head-1",
  role: USER_ROLE.GENERAL_SUBDIVISION_HEAD,
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
  it("allows employee and Kasubbag Umum to create drafts but rejects head", () => {
    expect(canCreateDraft(employee)).toBe(true);
    expect(canCreateDraft(generalSubdivisionHead)).toBe(true);
    expect(canCreateDraft(head)).toBe(false);
  });

  it("keeps employee drafts private before submit", () => {
    expect(canViewLetter(employee, draftLetter)).toBe(true);
    expect(canViewLetter(otherEmployee, draftLetter)).toBe(false);
    expect(canViewLetter(generalSubdivisionHead, draftLetter)).toBe(false);
    expect(canViewLetter(admin, draftLetter)).toBe(true);
  });

  it("allows only owner or admin to submit a draft", () => {
    expect(canSubmitDraft(employee, draftLetter)).toBe(true);
    expect(canSubmitDraft(otherEmployee, draftLetter)).toBe(false);
    expect(canSubmitDraft(admin, draftLetter)).toBe(true);
  });

  it("allows Kasubbag Umum correction only for same-team waiting documents", () => {
    const waitingLetter = {
      ...draftLetter,
      status: LETTER_STATUS.WAITING_GENERAL_SUBDIVISION_CORRECTION,
    };

    expect(
      canCompleteGeneralSubdivisionCorrection(
        generalSubdivisionHead,
        waitingLetter,
      ),
    ).toBe(true);
    expect(canCompleteGeneralSubdivisionCorrection(head, waitingLetter)).toBe(
      false,
    );
  });

  it("allows head correction only at head review stage", () => {
    const headLetter = {
      ...draftLetter,
      status: LETTER_STATUS.WAITING_HEAD_CORRECTION,
    };

    expect(canCompleteHeadCorrection(head, headLetter)).toBe(true);
    expect(canCompleteHeadCorrection(generalSubdivisionHead, headLetter)).toBe(
      false,
    );
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
    const generalSubdivisionOwnedFinalLetter = {
      ...finalLetter,
      creatorUserId: generalSubdivisionHead.id,
    };

    expect(canUpdateSrikandiReference(employee, finalLetter)).toBe(true);
    expect(
      canUpdateSrikandiReference(
        generalSubdivisionHead,
        generalSubdivisionOwnedFinalLetter,
      ),
    ).toBe(false);
    expect(canUpdateSrikandiReference(head, finalLetter)).toBe(true);
    expect(canUpdateSrikandiReference(admin, finalLetter)).toBe(true);
    expect(canUpdateSrikandiReference(employee, draftLetter)).toBe(false);
  });
});
