
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { superadminAuthService } from '../services/authService';
import type { AuthState, LoginCredentials } from '../../types/auth.types';
import type { AxiosError } from 'axios';
import { isTokenExpiringSoon } from '@/shared/lib/api-client';

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
        const token = superadminAuthService.getStoredToken();
        const user = superadminAuthService.getStoredUser();

        setState({
            user,
            token,
            tenant: null, // Superadmin n'a pas de tenant
            isAuthenticated: !!token,
            isLoading: false,
        });
    }, []);

    // ── Proactive token refresh ──────────────────────────────────────────
    const proactiveRefresh = useCallback(async () => {
        if (refreshingRef.current) return;
        if (!superadminAuthService.getStoredToken()) return;
        if (!isTokenExpiringSoon(true)) return;

        refreshingRef.current = true;
        try {
            const newToken = await superadminAuthService.refreshToken();
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
            const response = await superadminAuthService.login(credentials);

            if (response.success) {
                setState({
                    user: response.data.user,
                    token: response.data.token,
                    tenant: null, // Superadmin n'a pas de tenant
                    isAuthenticated: true,
                    isLoading: false,
                });

                router.push('/superadmin/dashboard');
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
    }, [router]);

    // ── Logout ───────────────────────────────────────────────────────────
    const logout = useCallback(async () => {
        setError(null);

        try {
            await superadminAuthService.logout();
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            setState({
                user: null,
                token: null,
                tenant: null,
                isAuthenticated: false,
                isLoading: false,
            });

            router.push('/superadmin/login');
        }
    }, [router]);

    // ── Refresh user data ────────────────────────────────────────────────
    const refreshUser = useCallback(async () => {
        if (!state.isAuthenticated) return;

        try {
            const user = await superadminAuthService.getCurrentUser();
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
