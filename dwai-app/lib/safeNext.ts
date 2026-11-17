/**
 * Returns `next` if it's a path on this site, or `/` otherwise, so a
 * `?next=` parameter can't send someone to another site after logging in
 * (an open redirect). Protocol-relative (`//evil.com`) and backslash
 * (`/\evil.com`, which browsers treat like `//`) paths are rejected.
 */
export const safeNext = (
  next: string | string[] | null | undefined,
): string => {
  if (typeof next !== "string") return "/";
  if (!next.startsWith("/") || next.startsWith("//")) return "/";
  if (next.includes("\\")) return "/";
  // Control characters (tabs, newlines) are stripped by URL parsers, which
  // can turn "/\t/evil.com" into "//evil.com".
  if (/[\u0000-\u001f\u007f]/.test(next)) return "/";

  return next;
};

/** The login page's URL, returning to `path` afterwards. */
export const loginHref = (path: string): string =>
  path === "/" ? "/login" : `/login?next=${encodeURIComponent(path)}`;
