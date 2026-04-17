export function sanitizeNextPath(
  value: string | null | undefined,
  fallback = "/profile",
) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  try {
    const parsed = new URL(value, "https://openseason.local");
    const segments = parsed.pathname.split("/").filter(Boolean);

    if (segments.includes("..")) {
      return fallback;
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}
