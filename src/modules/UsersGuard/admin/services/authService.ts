import { createApiClient, storeTokenTimestamp, refreshTokenSilently } from '@/shared/lib/api-client';
import type { LoginCredentials, LoginResponse, User } from '../../types/auth.types';
import type { ApiResponse } from '@/shared/types/api.types';

class AdminAuthService {
    async login(credentials: LoginCredentials): Promise<LoginResponse> {
        const client = createApiClient();

        const response = await client.post<LoginResponse>(
            '/admin/auth/login',
            {
                username: credentials.username,
                password: credentials.password,
                application: credentials.application,
            }
        );

        if (response.data.success && response.data.data.token) {
            localStorage.setItem('auth_token', response.data.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.data.user));
            localStorage.setItem('tenant', JSON.stringify(response.data.data.tenant));
            storeTokenTimestamp(false);
        }

        return response.data;
    }

    async logout(): Promise<void> {
        const client = createApiClient();

        try {
            await client.post('/admin/auth/logout');
        } finally {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_token_issued_at');
            localStorage.removeItem('user');
            localStorage.removeItem('tenant');
        }
    }

    async getCurrentUser(): Promise<User> {
        const client = createApiClient();
        const response = await client.get<ApiResponse<{ user: User }>>('/admin/auth/me');

        if (response.data.data?.user) {
            localStorage.setItem('user', JSON.stringify(response.data.data.user));
        }

        return response.data.data.user;
    }

    /**
     * Proactively refresh the Sanctum token before it expires.
     * Returns the new token on success, null on failure.
     */
    async refreshToken(): Promise<string | null> {
        return refreshTokenSilently(false);
    }

    getStoredUser(): User | null {
        if (typeof window === 'undefined') return null;
        const userStr = localStorage.getItem('user');
        if (!userStr) return null;
        try {
            return JSON.parse(userStr);
        } catch {
            return null;
        }
    }

    getStoredToken(): string | null {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem('auth_token');
    }

    isAuthenticated(): boolean {
        return !!this.getStoredToken();
    }
}

export const adminAuthService = new AdminAuthService();
