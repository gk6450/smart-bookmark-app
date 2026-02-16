export function normalizeUrl(rawValue: string): string {
  const trimmed = rawValue.trim();

  if (!trimmed) {
    throw new Error("URL is required");
  }

  const hasScheme = /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed);
  if (hasScheme && !/^https?:/i.test(trimmed)) {
    throw new Error("Only http and https URLs are allowed");
  }

  const withProtocol = hasScheme ? trimmed : `https://${trimmed}`;

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(withProtocol);
  } catch {
    throw new Error("Enter a valid URL");
  }

  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    throw new Error("Only http and https URLs are allowed");
  }

  return parsedUrl.toString();
}
