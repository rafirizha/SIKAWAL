const googleDocsHost = "docs.google.com";
const documentIdPattern = /^[A-Za-z0-9_-]+$/;

export type ParsedGoogleDocUrl = {
  googleDocId: string;
  googleDocUrl: string;
};

export function parseGoogleDocUrl(input: string): ParsedGoogleDocUrl | null {
  const trimmedInput = input.trim();

  if (!trimmedInput) {
    return null;
  }

  let url: URL;

  try {
    url = new URL(trimmedInput);
  } catch {
    return null;
  }

  if (url.protocol !== "https:" || url.hostname !== googleDocsHost) {
    return null;
  }

  const pathSegments = url.pathname.split("/").filter(Boolean);
  const documentIndex = pathSegments.indexOf("document");
  const idMarkerIndex = pathSegments.indexOf("d");

  if (documentIndex === -1 || idMarkerIndex === -1) {
    return null;
  }

  const googleDocId = pathSegments[idMarkerIndex + 1];

  if (!googleDocId || !documentIdPattern.test(googleDocId)) {
    return null;
  }

  return {
    googleDocId,
    googleDocUrl: url.toString(),
  };
}

export function isGoogleDocUrl(input: string) {
  return parseGoogleDocUrl(input) !== null;
}
