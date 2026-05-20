import { describe, expect, it } from "vitest";

import { parseGoogleDocUrl } from "@/lib/google/google-docs";

describe("parseGoogleDocUrl", () => {
  it("extracts a document ID from a Google Docs edit URL", () => {
    const parsed = parseGoogleDocUrl(
      "https://docs.google.com/document/d/abcDEF_123-xyz/edit",
    );

    expect(parsed?.googleDocId).toBe("abcDEF_123-xyz");
  });

  it("extracts a document ID from a user-scoped Google Docs URL", () => {
    const parsed = parseGoogleDocUrl(
      "https://docs.google.com/document/u/0/d/abcDEF_123-xyz/edit",
    );

    expect(parsed?.googleDocId).toBe("abcDEF_123-xyz");
  });

  it("rejects non-Google Docs URLs", () => {
    expect(parseGoogleDocUrl("https://drive.google.com/file/d/abc/view")).toBe(
      null,
    );
    expect(parseGoogleDocUrl("https://example.com/document/d/abc/edit")).toBe(
      null,
    );
  });
});
