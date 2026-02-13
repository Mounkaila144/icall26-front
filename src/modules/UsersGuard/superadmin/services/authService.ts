import { createApiClient, storeTokenTimestamp, refreshTokenSilently } from '@/shared/lib/api-client';
import type { LoginCredentials, LoginResponse, User } from '../../types/auth.types';
import type { ApiResponse } from '@/shared/types/api.types';

class SuperadminAuthService {
    async login(credentials: LoginCredentials): Promise<LoginResponse> {
        const client = createApiClient();

        const response = await client.post<LoginResponse>(
            '/superadmin/auth/login',
            {
                username: credentials.username,
                password: credentials.password,
                application: credentials.application,
            }
        );

        if (response.data.success && response.data.data.token) {
            localStorage.setItem('superadmin_auth_token', response.data.data.token);
            localStorage.setItem('superadmin_user', JSON.stringify(response.data.data.user));
            storeTokenTimestamp(true);
        }

        return response.data;
    }

    async logout(): Promise<void> {
        const client = createApiClient();

        try {
            await client.post('/superadmin/auth/logout');
        } finally {
            localStorage.removeItem('superadmin_auth_token');
            localStorage.removeItem('superadmin_auth_token_issued_at');
            localStorage.removeItem('superadmin_user');
        }
    }

    async getCurrentUser(): Promise<User> {
        const client = createApiClient();
        const response = await client.get<ApiResponse<{ user: User }>>('/superadmin/auth/me');

        if (response.data.data?.user) {
            localStorage.setItem('superadmin_user', JSON.stringify(response.data.data.user));
        }

        return response.data.data.user;
    }

    /**
     * Proactively refresh the Sanctum token before it expires.
     * Returns the new token on success, null on failure.
     */
    async refreshToken(): Promise<string | null> {
        return refreshTokenSilently(true);
    }

    getStoredUser(): User | null {
        if (typeof window === 'undefined') return null;
        const userStr = localStorage.getItem('superadmin_user');
        if (!userStr) return null;
        try {
            return JSON.parse(userStr);
        } catch {
            return null;
        }
    }

    getStoredToken(): string | null {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem('superadmin_auth_token');
    }

    isAuthenticated(): boolean {
        return !!this.getStoredToken();
    }
}

export const superadminAuthService = new SuperadminAuthService();
