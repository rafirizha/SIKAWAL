import { LETTER_STATUS, USER_ROLE } from "@/lib/workflow/constants";
import type { DomainUser, LetterStatus, UserRole } from "@/types/domain";

export type PermissionUser = Pick<
  DomainUser,
  "id" | "role" | "teamId" | "isActive"
>;

export type PermissionLetter = {
  creatorUserId: string;
  teamId: string;
  status: LetterStatus;
};

function isActive(user: PermissionUser) {
  return user.isActive;
}

function isAdmin(user: PermissionUser) {
  return user.role === USER_ROLE.ADMIN;
}

function isOwner(user: PermissionUser, letter: PermissionLetter) {
  return user.id === letter.creatorUserId;
}

function isSameTeam(user: PermissionUser, letter: PermissionLetter) {
  return Boolean(user.teamId) && user.teamId === letter.teamId;
}

function isBeforeFinal(letter: PermissionLetter) {
  return letter.status !== LETTER_STATUS.FINAL;
}

function hasRole(user: PermissionUser, role: UserRole) {
  return user.role === role;
}

function isStatusIn(status: LetterStatus, statuses: readonly LetterStatus[]) {
  return statuses.includes(status);
}

export function canCreateDraft(user: PermissionUser) {
  return (
    isActive(user) &&
    (hasRole(user, USER_ROLE.EMPLOYEE) ||
      hasRole(user, USER_ROLE.GENERAL_SUBDIVISION_HEAD) ||
      isAdmin(user))
  );
}

export function canViewLetter(user: PermissionUser, letter: PermissionLetter) {
  if (!isActive(user)) return false;
  if (isAdmin(user)) return true;
  if (isOwner(user, letter)) return true;

  if (letter.status === LETTER_STATUS.DRAFT) {
    return false;
  }

  if (hasRole(user, USER_ROLE.GENERAL_SUBDIVISION_HEAD)) {
    return isSameTeam(user, letter);
  }

  if (hasRole(user, USER_ROLE.HEAD)) {
    return isStatusIn(letter.status, [
      LETTER_STATUS.WAITING_HEAD_CORRECTION,
      LETTER_STATUS.INTERNALLY_APPROVED,
      LETTER_STATUS.FINAL,
    ]);
  }

  return false;
}

export function canEditDraft(user: PermissionUser, letter: PermissionLetter) {
  if (!isActive(user)) return false;
  if (isAdmin(user)) return letter.status === LETTER_STATUS.DRAFT;

  return (
    isOwner(user, letter) &&
    letter.status === LETTER_STATUS.DRAFT &&
    (hasRole(user, USER_ROLE.EMPLOYEE) ||
      hasRole(user, USER_ROLE.GENERAL_SUBDIVISION_HEAD))
  );
}

export function canSubmitDraft(user: PermissionUser, letter: PermissionLetter) {
  if (!isActive(user)) return false;
  if (isAdmin(user)) return letter.status === LETTER_STATUS.DRAFT;

  return (
    isOwner(user, letter) &&
    letter.status === LETTER_STATUS.DRAFT &&
    (hasRole(user, USER_ROLE.EMPLOYEE) ||
      hasRole(user, USER_ROLE.GENERAL_SUBDIVISION_HEAD))
  );
}

export function canCompleteGeneralSubdivisionCorrection(
  user: PermissionUser,
  letter: PermissionLetter,
) {
  if (!isActive(user)) return false;
  if (isAdmin(user)) {
    return (
      letter.status === LETTER_STATUS.WAITING_GENERAL_SUBDIVISION_CORRECTION
    );
  }

  return (
    hasRole(user, USER_ROLE.GENERAL_SUBDIVISION_HEAD) &&
    isSameTeam(user, letter) &&
    letter.status === LETTER_STATUS.WAITING_GENERAL_SUBDIVISION_CORRECTION
  );
}

export function canForwardToHead(
  user: PermissionUser,
  letter: PermissionLetter,
) {
  return canCompleteGeneralSubdivisionCorrection(user, letter);
}

export function canCompleteHeadCorrection(
  user: PermissionUser,
  letter: PermissionLetter,
) {
  if (!isActive(user)) return false;
  if (isAdmin(user)) {
    return letter.status === LETTER_STATUS.WAITING_HEAD_CORRECTION;
  }

  return (
    hasRole(user, USER_ROLE.HEAD) &&
    letter.status === LETTER_STATUS.WAITING_HEAD_CORRECTION
  );
}

export function canApproveInternal(
  user: PermissionUser,
  letter: PermissionLetter,
) {
  return canCompleteHeadCorrection(user, letter);
}

export function canSubmitRevision(
  user: PermissionUser,
  letter: PermissionLetter,
) {
  if (!isActive(user)) return false;
  if (isAdmin(user)) return letter.status === LETTER_STATUS.NEEDS_REVISION;

  return (
    isOwner(user, letter) &&
    letter.status === LETTER_STATUS.NEEDS_REVISION &&
    (hasRole(user, USER_ROLE.EMPLOYEE) ||
      hasRole(user, USER_ROLE.GENERAL_SUBDIVISION_HEAD))
  );
}

export function canCreateFinalVersion(
  user: PermissionUser,
  letter: PermissionLetter,
) {
  if (!isActive(user)) return false;
  if (letter.status !== LETTER_STATUS.INTERNALLY_APPROVED) return false;

  return (
    isAdmin(user) || hasRole(user, USER_ROLE.HEAD) || isOwner(user, letter)
  );
}

export function canUpdateSrikandiReference(
  user: PermissionUser,
  letter: PermissionLetter,
) {
  if (!isActive(user)) return false;
  if (letter.status !== LETTER_STATUS.FINAL) return false;

  return (
    isAdmin(user) ||
    hasRole(user, USER_ROLE.HEAD) ||
    (hasRole(user, USER_ROLE.EMPLOYEE) && isOwner(user, letter))
  );
}

export function canCancelLetter(
  user: PermissionUser,
  letter: PermissionLetter,
) {
  if (!isActive(user)) return false;
  if (!isBeforeFinal(letter)) return false;
  if (isAdmin(user)) return true;
  if (isOwner(user, letter)) return true;

  if (hasRole(user, USER_ROLE.GENERAL_SUBDIVISION_HEAD)) {
    return (
      isSameTeam(user, letter) &&
      isStatusIn(letter.status, [
        LETTER_STATUS.WAITING_GENERAL_SUBDIVISION_CORRECTION,
        LETTER_STATUS.NEEDS_REVISION,
      ])
    );
  }

  if (hasRole(user, USER_ROLE.HEAD)) {
    return letter.status === LETTER_STATUS.WAITING_HEAD_CORRECTION;
  }

  return false;
}

export function canViewAuditLog(
  user: PermissionUser,
  letter: PermissionLetter,
) {
  if (!isActive(user)) return false;
  if (isAdmin(user) || hasRole(user, USER_ROLE.HEAD)) return true;
  if (isOwner(user, letter)) return true;

  return (
    hasRole(user, USER_ROLE.GENERAL_SUBDIVISION_HEAD) &&
    isSameTeam(user, letter) &&
    letter.status !== LETTER_STATUS.DRAFT
  );
}

export function canManageUsers(user: PermissionUser) {
  return isActive(user) && isAdmin(user);
}
