const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3020/api/v1';

if (!API_BASE_URL) {
  throw new Error(
    'NEXT_PUBLIC_API_URL is not set. Copy admin/.env.example to admin/.env.development (or .env.production) and fill it in.',
  );
}

function parseApiError(payload: unknown, status: number): string {
  if (
    payload &&
    typeof payload === 'object' &&
    'message' in payload &&
    typeof payload.message === 'string'
  ) {
    return payload.message;
  }

  if (
    payload &&
    typeof payload === 'object' &&
    'errors' in payload &&
    payload.errors &&
    typeof payload.errors === 'object'
  ) {
    const details = Object.entries(payload.errors as Record<string, unknown>)
      .map(([field, value]) => `${field}: ${String(value)}`)
      .join(' | ');

    if (details) {
      return details;
    }
  }

  if (
    payload &&
    typeof payload === 'object' &&
    'error' in payload &&
    typeof payload.error === 'string'
  ) {
    return payload.error;
  }

  if (status === 403) {
    return 'You do not have access to this admin area.';
  }

  return `API Error: ${status}`;
}

export function getToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('admin_token');
  }

  return null;
}

export function setToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('admin_token', token);
  }
}

export function removeToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('admin_token');
  }
}

export function getErrorMessage(
  error: unknown,
  fallback = 'Something went wrong.',
) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (error) {
    const message = getErrorMessage(error);
    const looksLikeNetworkFailure =
      message.toLowerCase().includes('fetch') ||
      message.toLowerCase().includes('network');

    if (looksLikeNetworkFailure) {
      throw new Error(
        `Backend API is unavailable at ${API_BASE_URL}. Start ./scripts/start-backend.sh or ./scripts/start-all.sh.`,
      );
    }

    throw error;
  }

  if (!response.ok) {
    if (response.status === 401) {
      removeToken();

      if (
        typeof window !== 'undefined' &&
        window.location.pathname !== '/login'
      ) {
        window.location.href = '/login';
      }
    }

    const rawPayload = await response.text();
    let payload: unknown = rawPayload;

    if (rawPayload) {
      try {
        payload = JSON.parse(rawPayload);
      } catch {
        payload = rawPayload;
      }
    }

    throw new Error(parseApiError(payload, response.status));
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json() as Promise<T>;
}
