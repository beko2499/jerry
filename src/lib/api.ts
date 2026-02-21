const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function getToken(): string | null {
    return localStorage.getItem('jerry_token');
}

export function getAdminToken(): string | null {
    return localStorage.getItem('jerry_admin_token');
}

export function setToken(token: string) {
    localStorage.setItem('jerry_token', token);
}

export function setAdminToken(token: string) {
    localStorage.setItem('jerry_admin_token', token);
}

export function clearToken() {
    localStorage.removeItem('jerry_token');
}

export function clearAdminToken() {
    localStorage.removeItem('jerry_admin_token');
}

// Auth headers for user requests
export function authHeaders(): Record<string, string> {
    const token = getToken();
    return token ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } : { 'Content-Type': 'application/json' };
}

// Auth headers for admin requests
export function adminHeaders(): Record<string, string> {
    const token = getAdminToken();
    return token ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } : { 'Content-Type': 'application/json' };
}

// Fetch wrapper for authenticated user requests
export async function apiFetch(path: string, options: RequestInit = {}) {
    const res = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: { ...authHeaders(), ...(options.headers || {}) },
    });
    if (res.status === 401) {
        clearToken();
        localStorage.removeItem('jerry_user');
    }
    return res;
}

// Fetch wrapper for admin requests
export async function adminFetch(path: string, options: RequestInit = {}) {
    const headers: Record<string, string> = { ...adminHeaders() };
    // Don't set Content-Type for FormData
    if (options.body instanceof FormData) {
        delete headers['Content-Type'];
    }
    const res = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: { ...headers, ...(options.headers || {}) },
    });
    if (res.status === 401) {
        clearAdminToken();
        localStorage.removeItem('adminSession');
        window.location.reload();
    }
    return res;
}

export { API_URL };
