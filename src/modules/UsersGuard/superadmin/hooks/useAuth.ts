
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { superadminAuthService } from '../services/authService';
import { AuthState, LoginCredentials } from '../../types/auth.types';
import { AxiosError } from 'axios';

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
