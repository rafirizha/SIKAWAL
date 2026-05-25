import {
  APPROVAL_ACTION,
  DATA_CLASSIFICATION,
  GENERAL_SUBDIVISION_CORRECTION_DECISION,
  LETTER_STATUS,
  SOURCE_TYPE,
  USER_ROLE,
  VERSION_TYPE,
} from "@/lib/workflow/constants";

type ValueOf<T> = T[keyof T];

export type UserRole = ValueOf<typeof USER_ROLE>;
export type LetterStatus = ValueOf<typeof LETTER_STATUS>;
export type VersionType = ValueOf<typeof VERSION_TYPE>;
export type SourceType = ValueOf<typeof SOURCE_TYPE>;
export type ApprovalAction = ValueOf<typeof APPROVAL_ACTION>;
export type DataClassification = ValueOf<typeof DATA_CLASSIFICATION>;
export type GeneralSubdivisionCorrectionDecision = ValueOf<
  typeof GENERAL_SUBDIVISION_CORRECTION_DECISION
>;

export type DomainUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  teamId: string | null;
  isActive: boolean;
};

export type LetterSummary = {
  id: string;
  subject: string;
  recipient: string;
  status: LetterStatus;
  creatorUserId: string;
  teamId: string;
  revisionRound: number;
  updatedAt: string;
};

export type LetterVersionSummary = {
  id: string;
  letterId: string;
  versionNumber: number;
  revisionRound: number;
  versionType: VersionType;
  sourceType: SourceType;
  title: string;
  createdByUserId: string;
  reviewerUserId: string | null;
  reviewerRole: UserRole | null;
  createdAt: string;
};
