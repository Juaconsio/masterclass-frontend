export const AUTH_TOKEN_KEY = 'token';
export const AUTH_USER_KEY = 'user';

function safeRemove(storage: Storage, key: string) {
  try {
    storage.removeItem(key);
  } catch {
    // noop
  }
}

function safeGet(storage: Storage, key: string): string | null {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return (
    safeGet(window.localStorage, AUTH_TOKEN_KEY) || safeGet(window.sessionStorage, AUTH_TOKEN_KEY)
  );
}

export function clearAuthStorage() {
  if (typeof window === 'undefined') return;
  safeRemove(window.localStorage, AUTH_TOKEN_KEY);
  safeRemove(window.localStorage, AUTH_USER_KEY);
  safeRemove(window.sessionStorage, AUTH_TOKEN_KEY);
  safeRemove(window.sessionStorage, AUTH_USER_KEY);
}
