export type AuthActionState = {
  status: "idle" | "error";
  message: string;
};

export const initialAuthActionState: AuthActionState = {
  status: "idle",
  message: "",
};

export type DraftActionState = {
  status: "idle" | "success" | "error";
  message: string;
  letterId?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export const initialDraftActionState: DraftActionState = {
  status: "idle",
  message: "",
};

export type CorrectionActionState = {
  status: "idle" | "success" | "error";
  message: string;
  letterId?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export const initialCorrectionActionState: CorrectionActionState = {
  status: "idle",
  message: "",
};
