const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '/api/backend';

export async function apiFetch<T = unknown>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include'
  });

  const data = await response.json().catch(() => null);
  if (response.status === 401) {
    if (typeof window !== 'undefined') window.location.assign('/login');
    throw new Error(data?.message || 'Phiên đăng nhập đã hết hạn.');
  }
  if (!response.ok) throw new Error(data?.message || `HTTP ${response.status}`);
  return data as T;
}

export const login = (body: { email?: string; tenDangNhap?: string; password: string }) =>
  apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify(body) });
export const getProfile = () => apiFetch('/api/user/profile');
export const logout = () => apiFetch('/api/auth/logout', { method: 'POST' });
