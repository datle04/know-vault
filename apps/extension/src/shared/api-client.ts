const API_BASE_URL = 'http://localhost:3001/api';

interface StoredAuth {
  accessToken: string;
}

async function getAccessToken(): Promise<string | null> {
  const result = await chrome.storage.session.get('auth');
  const auth = result['auth'] as StoredAuth | undefined;
  return auth?.accessToken ?? null;
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getAccessToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new ApiError(response.status, body.errorCode ?? 'UNKNOWN_ERROR');
  }

  return response.json() as Promise<T>;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly errorCode: string,
  ) {
    super(`API error ${status}: ${errorCode}`);
  }
}

export const apiClient = {
  quickSave: (payload: { url: string; title?: string; html?: string; selection?: string }) =>
    apiFetch<{ articleId: string; status: string }>('/extension/quick-save', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  checkUrl: (url: string) =>
    apiFetch<{ exists: boolean; articleId?: string; status?: string }>(
      `/extension/check-url?url=${encodeURIComponent(url)}`,
    ),

  login: (email: string, password: string) =>
    apiFetch<{ accessToken: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
};

export async function storeAuth(accessToken: string): Promise<void> {
  await chrome.storage.session.set({ auth: { accessToken } });
}

export async function clearAuth(): Promise<void> {
  await chrome.storage.session.remove('auth');
}
