function readPublic(name: string, fallback = ""): string {
  const value = process.env[name];
  return value === undefined || value === null ? fallback : value;
}

/** Prefix for browser fetch. Empty = same-origin (Next rewrite → gateway). */
export const API_BASE_URL = readPublic("NEXT_PUBLIC_API_BASE_URL", "").replace(
  /\/$/,
  "",
);

export const DEMO_EMAIL = readPublic(
  "NEXT_PUBLIC_DEMO_EMAIL",
  "demo@aris.local",
);

export const BURST_SIZE = (() => {
  const raw = Number(readPublic("NEXT_PUBLIC_BURST_SIZE", "10"));
  return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 10;
})();

export function apiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalized}`;
}
