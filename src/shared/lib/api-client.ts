import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { ApiError } from '../types/api.types';
import type { RefreshTokenResponse } from '@/modules/UsersGuard/types/auth.types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TOKEN_KEY = 'auth_token';
const SUPERADMIN_TOKEN_KEY = 'superadmin_auth_token';
const TOKEN_ISSUED_KEY = 'auth_token_issued_at';
const SUPERADMIN_TOKEN_ISSUED_KEY = 'superadmin_auth_token_issued_at';

/** Sanctum token lifetime is 60 min — refresh proactively at 50 min */
const TOKEN_REFRESH_THRESHOLD_MS = 50 * 60 * 1000;

// ---------------------------------------------------------------------------
// Context helpers
// ---------------------------------------------------------------------------

const isSuperadminContext = (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.location.pathname.includes('/superadmin');
};

const getAuthToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(isSuperadminContext() ? SUPERADMIN_TOKEN_KEY : TOKEN_KEY);
};

const getTenantId = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('tenant_id');
};

const getCurrentLocale = (): string => {
    if (typeof window === 'undefined') return 'en';

    const pathParts = window.location.pathname.split('/').filter(Boolean);
    const langFromUrl = pathParts[0];

    if (['en', 'fr', 'ar'].includes(langFromUrl)) {
        return langFromUrl;
    }

    const locale = localStorage.getItem('app_language') || 'en';
    return locale.split('_')[0].split('-')[0].toLowerCase();
};

const getLoginUrl = (): string => {
    const locale = getCurrentLocale();
    return `/${locale}/login`;
};

// ---------------------------------------------------------------------------
// Token timestamp helpers (exported for auth services)
// ---------------------------------------------------------------------------

export const storeTokenTimestamp = (superadmin = false): void => {
    const key = superadmin ? SUPERADMIN_TOKEN_ISSUED_KEY : TOKEN_ISSUED_KEY;
    localStorage.setItem(key, Date.now().toString());
};

const getTokenIssuedAt = (): number => {
    const key = isSuperadminContext() ? SUPERADMIN_TOKEN_ISSUED_KEY : TOKEN_ISSUED_KEY;
    const val = localStorage.getItem(key);
    return val ? parseInt(val, 10) : 0;
};

/** True when the token will expire in the next ~10 minutes */
export const isTokenExpiringSoon = (superadmin?: boolean): boolean => {
    const contextIsSuperadmin = superadmin ?? isSuperadminContext();
    const key = contextIsSuperadmin ? SUPERADMIN_TOKEN_ISSUED_KEY : TOKEN_ISSUED_KEY;
    const val = localStorage.getItem(key);
    if (!val) return false;
    const issuedAt = parseInt(val, 10);
    return Date.now() - issuedAt > TOKEN_REFRESH_THRESHOLD_MS;
};

// ---------------------------------------------------------------------------
// Clear auth data
// ---------------------------------------------------------------------------

const clearAuthData = (): void => {
    if (typeof window === 'undefined') return;

    if (isSuperadminContext()) {
        localStorage.removeItem(SUPERADMIN_TOKEN_KEY);
        localStorage.removeItem(SUPERADMIN_TOKEN_ISSUED_KEY);
        localStorage.removeItem('superadmin_user');
    } else {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(TOKEN_ISSUED_KEY);
        localStorage.removeItem('user');
        localStorage.removeItem('tenant');
    }
};

// ---------------------------------------------------------------------------
// Token refresh — module-level state (shared across all axios instances)
// ---------------------------------------------------------------------------

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (err: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null): void => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) {
            reject(error);
        } else {
            resolve(token!);
        }
    });
    failedQueue = [];
};

/**
 * Call the backend refresh endpoint using a raw axios call (no interceptors)
 * to avoid infinite loops.
 */
const callRefreshEndpoint = async (): Promise<string> => {
    const baseURL = process.env.NEXT_PUBLIC_API_URL || '/api';
    const superadmin = isSuperadminContext();
    const refreshUrl = superadmin ? '/superadmin/auth/refresh' : '/admin/auth/refresh';
    const token = getAuthToken();

    if (!token) throw new Error('No token available for refresh');

    const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'Accept-Language': getCurrentLocale(),
    };

    // Admin context needs tenant header
    if (!superadmin) {
        const tenantId = getTenantId();
        if (tenantId) {
            headers['X-Tenant-ID'] = tenantId;
        }
    }

    const response = await axios.post<RefreshTokenResponse>(
        `${baseURL}${refreshUrl}`,
        {},
        { headers, withCredentials: true }
    );

    if (!response.data.success || !response.data.data.token) {
        throw new Error('Refresh response did not contain a new token');
    }

    const newToken = response.data.data.token;

    // Persist new token + timestamp
    const tokenKey = superadmin ? SUPERADMIN_TOKEN_KEY : TOKEN_KEY;
    localStorage.setItem(tokenKey, newToken);
    storeTokenTimestamp(superadmin);

    console.log('[api-client] Token refreshed successfully');
    return newToken;
};

/**
 * Exported helper so useAuth hooks can trigger a proactive refresh.
 * Returns the new token on success, null on failure.
 */
export const refreshTokenSilently = async (superadmin?: boolean): Promise<string | null> => {
    if (typeof window === 'undefined') return null;

    // Determine context from argument (overrides URL-based detection)
    const contextIsSuperadmin = superadmin ?? isSuperadminContext();
    const tokenKey = contextIsSuperadmin ? SUPERADMIN_TOKEN_KEY : TOKEN_KEY;
    const currentToken = localStorage.getItem(tokenKey);

    if (!currentToken) return null;

    if (isRefreshing) {
        // Another refresh is in-flight — wait for it
        return new Promise<string>((resolve, reject) => {
            failedQueue.push({ resolve, reject });
        }).catch(() => null);
    }

    isRefreshing = true;

    try {
        const newToken = await callRefreshEndpoint();
        processQueue(null, newToken);
        return newToken;
    } catch (err) {
        processQueue(err, null);
        console.warn('[api-client] Silent token refresh failed', err);
        return null;
    } finally {
        isRefreshing = false;
    }
};

// ---------------------------------------------------------------------------
// Axios instance factory
// ---------------------------------------------------------------------------

export const createApiClient = (): AxiosInstance => {
    const client = axios.create({
        baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        withCredentials: true,
    });

    // ── Request interceptor ─────────────────────────────────────────────
    client.interceptors.request.use(
        (config: InternalAxiosRequestConfig) => {
            if (config.headers) {
                const token = getAuthToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }

                if (!isSuperadminContext()) {
                    const tenantId = getTenantId();
                    if (tenantId) {
                        config.headers['X-Tenant-ID'] = tenantId;
                    }
                }

                config.headers['Accept-Language'] = getCurrentLocale();
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    // ── Response interceptor — 401 → refresh → retry ───────────────────
    client.interceptors.response.use(
        (response) => response,
        async (error: AxiosError<ApiError>) => {
            const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

            // Only attempt refresh on 401, and only once per request
            if (error.response?.status !== 401 || originalRequest._retry) {
                return Promise.reject(error);
            }

            originalRequest._retry = true;

            // If another refresh is already in-flight, queue this request
            if (isRefreshing) {
                return new Promise<string>((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((newToken) => {
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return client(originalRequest);
                }).catch(() => {
                    // Refresh failed — logout
                    clearAuthData();
                    if (typeof window !== 'undefined') {
                        window.location.href = getLoginUrl();
                    }
                    return Promise.reject(error);
                });
            }

            // This is the first 401 — attempt to refresh
            isRefreshing = true;

            try {
                const newToken = await callRefreshEndpoint();
                processQueue(null, newToken);

                // Retry the original request with the fresh token
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return client(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);

                // Refresh truly failed — clear auth and redirect to login
                clearAuthData();
                if (typeof window !== 'undefined') {
                    window.location.href = getLoginUrl();
                }
                return Promise.reject(error);
            } finally {
                isRefreshing = false;
            }
        }
    );

    return client;
};

// ---------------------------------------------------------------------------
// Default singleton
// ---------------------------------------------------------------------------

export const apiClient = createApiClient();
