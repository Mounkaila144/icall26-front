
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { adminAuthService } from '../services/authService';
import type { AuthState, LoginCredentials } from '../../types/auth.types';
import type { AxiosError } from 'axios';
import { usePermissionsOptional } from '@/shared/contexts/PermissionsContext';
import { extractPermissionsFromLogin } from '@/shared/lib/permissions/extractPermissions';
import { isTokenExpired, isTokenExpiringSoon } from '@/shared/lib/api-client';

/** Check token freshness every 5 minutes */
const REFRESH_CHECK_INTERVAL_MS = 5 * 60 * 1000;

interface UseAuthReturn extends AuthState {
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    error: string | null;
}

export const useAuth = (): UseAuthReturn => {
    const router = useRouter();
    const permissionsContext = usePermissionsOptional();

    const [state, setState] = useState<AuthState>({
        user: null,
        token: null,
        tenant: null,
        isAuthenticated: false,
        isLoading: true,
    });

    const [error, setError] = useState<string | null>(null);

    // Ref to track if proactive refresh is already running
    const refreshingRef = useRef(false);

    // ── Restore auth state from localStorage on mount ────────────────────
    useEffect(() => {
        const token = adminAuthService.getStoredToken();

        // Token exists but has expired → clear auth data, treat as unauthenticated
        if (token && isTokenExpired(false)) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_token_issued_at');
            localStorage.removeItem('user');
            localStorage.removeItem('tenant');

            setState({
                user: null,
                token: null,
                tenant: null,
                isAuthenticated: false,
                isLoading: false,
            });

            return;
        }

        const user = adminAuthService.getStoredUser();
        const tenantStr = localStorage.getItem('tenant');
        let tenant = null;
        if (tenantStr) {
            try {
                tenant = JSON.parse(tenantStr);
            } catch {
                // ignore
            }
        }

        setState({
            user,
            token,
            tenant,
            isAuthenticated: !!token,
            isLoading: false,
        });
    }, []);

    // ── Proactive token refresh ──────────────────────────────────────────
    const proactiveRefresh = useCallback(async () => {
        if (refreshingRef.current) return;
        if (!adminAuthService.getStoredToken()) return;
        if (!isTokenExpiringSoon(false)) return;

        refreshingRef.current = true;
        try {
            const newToken = await adminAuthService.refreshToken();
            if (newToken) {
                setState(prev => ({ ...prev, token: newToken }));
            }
        } finally {
            refreshingRef.current = false;
        }
    }, []);

    useEffect(() => {
        if (!state.isAuthenticated) return;

        // Periodic check
        const intervalId = setInterval(proactiveRefresh, REFRESH_CHECK_INTERVAL_MS);

        // Also refresh when the user returns to the tab
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                proactiveRefresh();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearInterval(intervalId);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [state.isAuthenticated, proactiveRefresh]);

    // ── Login ────────────────────────────────────────────────────────────
    const login = useCallback(async (credentials: LoginCredentials) => {
        setError(null);
        setState(prev => ({ ...prev, isLoading: true }));

        try {
            const response = await adminAuthService.login(credentials);

            if (response.success) {
                setState({
                    user: response.data.user,
                    token: response.data.token,
                    tenant: response.data.tenant,
                    isAuthenticated: true,
                    isLoading: false,
                });

                // Extract and store permissions (NO additional API request!)
                if (permissionsContext) {
                    const permissions = extractPermissionsFromLogin(response);
                    permissionsContext.setPermissions(permissions);

                    console.log('[useAuth] Permissions extracted:', {
                        total_permissions: permissions.permissions.length,
                        groups: permissions.groups,
                        is_admin: permissions.is_admin,
                        is_superadmin: permissions.is_superadmin,
                    });
                } else {
                    console.warn('[useAuth] PermissionsContext not available, skipping permissions extraction');
                }

                router.push('/admin/users');
            } else {
                throw new Error(response.message || 'Login failed');
            }
        } catch (err) {
            const axiosError = err as AxiosError<{ message: string }>;
            let errorMessage = 'An error occurred during login';

            if (axiosError.response?.data?.message) {
                errorMessage = axiosError.response.data.message;
            } else if (axiosError.message) {
                errorMessage = axiosError.message;
            }

            setError(errorMessage);
            setState(prev => ({ ...prev, isLoading: false }));
            throw err;
        }
    }, [router, permissionsContext]);

    // ── Logout ───────────────────────────────────────────────────────────
    const logout = useCallback(async () => {
        setError(null);

        try {
            await adminAuthService.logout();
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            // Clear permissions
            if (permissionsContext) {
                permissionsContext.clearPermissions();
            }

            setState({
                user: null,
                token: null,
                tenant: null,
                isAuthenticated: false,
                isLoading: false,
            });

            // Get current locale from URL
            const currentPath = window.location.pathname;
            const locale = currentPath.split('/')[1] || 'en';
            router.push(`/${locale}/login`);
        }
    }, [router, permissionsContext]);

    // ── Refresh user data ────────────────────────────────────────────────
    const refreshUser = useCallback(async () => {
        if (!state.isAuthenticated) return;

        try {
            const user = await adminAuthService.getCurrentUser();
            setState(prev => ({ ...prev, user }));
        } catch (err) {
            console.error('Failed to refresh user:', err);
            if ((err as AxiosError).response?.status === 401) {
                await logout();
            }
        }
    }, [state.isAuthenticated, logout]);

    return {
        ...state,
        login,
        logout,
        refreshUser,
        error,
    };
};
