const AUTH_CACHE_KEY = "protein-ledger-auth-cache-v1";
const AUTH_CACHE_MAX_AGE = 1000 * 60 * 60 * 24 * 30;

type AuthCache = {
  email?: string;
  savedAt: number;
};

export function saveAuthCache(email?: string | null) {
  if (typeof window === "undefined") return;
  const cache: AuthCache = { email: email ?? undefined, savedAt: Date.now() };
  window.localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(cache));
}

export function clearAuthCache() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_CACHE_KEY);
}

export function getAuthCache() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(AUTH_CACHE_KEY);
    if (!raw) return null;
    const cache = JSON.parse(raw) as AuthCache;
    if (!cache.savedAt || Date.now() - cache.savedAt > AUTH_CACHE_MAX_AGE) {
      clearAuthCache();
      return null;
    }
    return cache;
  } catch {
    clearAuthCache();
    return null;
  }
}

export function hasValidAuthCache() {
  return getAuthCache() !== null;
}
