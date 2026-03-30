import axios from 'axios';

function pickResponseMessage(data: unknown): string | undefined {
  if (data == null) return undefined;
  if (typeof data === 'string' && data.trim()) return data.trim();
  if (typeof data !== 'object' || Array.isArray(data)) return undefined;

  const o = data as Record<string, unknown>;
  for (const key of ['error', 'message'] as const) {
    const v = o[key];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return undefined;
}

/**
 * Returns a human-readable API error string for toasts / inline errors.
 * Never returns raw objects (avoids dumping axios config or nested JSON in the UI).
 */
export function extractApiError(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const fromBody = pickResponseMessage(error.response?.data);
    if (fromBody) return fromBody;

    if (error.response) {
      return fallback;
    }

    if (typeof error.message === 'string' && error.message.trim()) {
      return error.message.trim();
    }
    return fallback;
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message.trim();
  }

  return fallback;
}
