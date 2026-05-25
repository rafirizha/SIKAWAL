import { afterEach, describe, expect, it, vi } from "vitest";

import { exportCorrectionSnapshotWithAppsScript } from "@/lib/google/apps-script-export";
import { USER_ROLE } from "@/lib/workflow/constants";

vi.mock("server-only", () => ({}));

const exportInput = {
  exportUrl: "https://script.google.com/macros/s/example/exec",
  googleDocId: "doc-123",
  googleDocUrl: "https://docs.google.com/document/d/doc-123/edit",
  letterId: "00000000-0000-4000-8000-000000000001",
  reviewerRole: USER_ROLE.GENERAL_SUBDIVISION_HEAD,
  reviewerUserId: "00000000-0000-4000-8000-000000000002",
  revisionRound: 1,
  sharedSecret: "test-secret",
  timeoutMs: 10_000,
} as const;

function mockFetchJson(payload: unknown, init?: ResponseInit) {
  return vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(JSON.stringify(payload), {
      status: init?.status ?? 200,
      statusText: init?.statusText ?? "OK",
    }),
  );
}

describe("exportCorrectionSnapshotWithAppsScript", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("returns exported file and comments_json evidence", async () => {
    const fetchSpy = mockFetchJson({
      ok: true,
      exportedAt: "2026-05-21T10:00:00.000Z",
      snapshot: {
        fileName: "koreksi.pdf",
        mimeType: "application/pdf",
        base64: Buffer.from("%PDF-1.7 snapshot").toString("base64"),
      },
      commentsJson: {
        comments: [{ text: "Perbaiki tanggal naskah" }],
      },
    });

    const result = await exportCorrectionSnapshotWithAppsScript(exportInput);

    expect(result.file?.name).toBe("koreksi.pdf");
    expect(result.file?.type).toBe("application/pdf");
    if (!result.file) {
      throw new Error("Expected Apps Script export to include a file.");
    }
    await expect(result.file.text()).resolves.toBe("%PDF-1.7 snapshot");
    expect(result.commentsJson).toEqual({
      comments: [{ text: "Perbaiki tanggal naskah" }],
    });
    expect(result.exportedAt).toBe("2026-05-21T10:00:00.000Z");

    const [, requestInit] = fetchSpy.mock.calls[0];
    expect(requestInit?.method).toBe("POST");
    expect(requestInit?.headers).toMatchObject({
      "content-type": "application/json",
      "x-sikawal-bridge-secret": exportInput.sharedSecret,
    });
    expect(JSON.parse(String(requestInit?.body))).toMatchObject({
      letter_id: exportInput.letterId,
      shared_secret: exportInput.sharedSecret,
      source_google_doc_id: exportInput.googleDocId,
      source_google_doc_url: exportInput.googleDocUrl,
      reviewer_user_id: exportInput.reviewerUserId,
      reviewer_role: USER_ROLE.GENERAL_SUBDIVISION_HEAD,
      revision_round: exportInput.revisionRound,
    });
  });

  it("accepts comments_json-only evidence", async () => {
    mockFetchJson({
      ok: true,
      commentsJson: {
        comments: [{ text: "Komentar tersimpan tanpa file export." }],
      },
    });

    const result = await exportCorrectionSnapshotWithAppsScript(exportInput);

    expect(result.file).toBeNull();
    expect(result.commentsJson).toEqual({
      comments: [{ text: "Komentar tersimpan tanpa file export." }],
    });
  });

  it("can request a Kepala BPS export payload", async () => {
    const fetchSpy = mockFetchJson({
      ok: true,
      commentsJson: {
        comments: [{ text: "Perbaiki penutup." }],
      },
    });

    await exportCorrectionSnapshotWithAppsScript({
      ...exportInput,
      reviewerRole: USER_ROLE.HEAD,
    });

    const [, requestInit] = fetchSpy.mock.calls[0];
    expect(JSON.parse(String(requestInit?.body))).toMatchObject({
      reviewer_role: USER_ROLE.HEAD,
    });
  });

  it("rejects empty comments_json without file evidence", async () => {
    mockFetchJson({
      ok: true,
      commentsJson: {
        comments: [],
      },
    });

    await expect(
      exportCorrectionSnapshotWithAppsScript(exportInput),
    ).rejects.toThrow("bridge tidak mengirim file atau comments_json");
  });

  it("returns a manual fallback message when export fails", async () => {
    mockFetchJson(
      {
        ok: false,
        errorMessage: "Quota Apps Script habis",
      },
      {
        status: 200,
      },
    );

    await expect(
      exportCorrectionSnapshotWithAppsScript(exportInput),
    ).rejects.toThrow(
      "Export otomatis gagal: Quota Apps Script habis. Upload DOCX/PDF hasil koreksi secara manual.",
    );
  });

  it("wraps network failure with manual fallback guidance", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(
      new Error("Network timeout"),
    );

    await expect(
      exportCorrectionSnapshotWithAppsScript(exportInput),
    ).rejects.toThrow(
      "Export otomatis gagal: Network timeout. Upload DOCX/PDF hasil koreksi secara manual.",
    );
  });

  it("aborts slow export requests with manual fallback guidance", async () => {
    vi.useFakeTimers();
    vi.spyOn(globalThis, "fetch").mockImplementation(
      (_input: URL | RequestInfo, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            reject(new Error("Aborted"));
          });
        }),
    );

    const result = expect(
      exportCorrectionSnapshotWithAppsScript({
        ...exportInput,
        timeoutMs: 25,
      }),
    ).rejects.toThrow(
      "Export otomatis gagal: timeout setelah 25ms. Upload DOCX/PDF hasil koreksi secara manual.",
    );

    await vi.advanceTimersByTimeAsync(25);
    await result;
  });

  it("rejects bridge payload without snapshot evidence", async () => {
    mockFetchJson({
      ok: true,
    });

    await expect(
      exportCorrectionSnapshotWithAppsScript(exportInput),
    ).rejects.toThrow("bridge tidak mengirim file atau comments_json");
  });
});
