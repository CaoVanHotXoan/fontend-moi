// Route API requests through this Next.js deployment to avoid browser CORS restrictions.
export const BACKEND_URL = '/api/backend';

export async function apiFetch<T = unknown>(url: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  const fullUrl = url.startsWith('http') ? url : `${BACKEND_URL}${url.startsWith('/') ? '' : '/'}${url}`;

  const response = await fetch(fullUrl, {
    ...options,
    headers,
    credentials: 'include',
  });

  const data = await response.json().catch(() => null);
  if (response.status === 401) {
    if (typeof window !== 'undefined' && !window.location.pathname.toLowerCase().includes('/login')) {
      window.location.assign('/Login/Login');
    }
    throw new Error(data?.message || 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
  }

  if (!response.ok) {
    throw new Error(data?.message || `HTTP ${response.status}`);
  }

  return data as T;
}

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const fullUrl = url.startsWith('http') ? url : `${BACKEND_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  return fetch(fullUrl, { ...options, credentials: 'include' });
}

export async function apiRequest<T = any>(url: string, options: RequestInit = {}): Promise<T> {
  return apiFetch<T>(url, options);
}
