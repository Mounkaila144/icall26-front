import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiError } from '../types/api.types';

/**
 * Détecter si on est dans un contexte superadmin
 */
const isSuperadminContext = (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.location.pathname.startsWith('/superadmin');
};

/**
 * Récupérer le token d'authentification selon le contexte
 */
const getAuthToken = (): string | null => {
    if (typeof window === 'undefined') return null;

    // Si on est dans le contexte superadmin, chercher le token superadmin
    if (isSuperadminContext()) {
        return localStorage.getItem('superadmin_auth_token');
    }

    // Sinon, chercher le token admin
    return localStorage.getItem('auth_token');
};

/**
 * Récupérer la locale actuelle pour le header Accept-Language
 * Retourne un format simple: fr, en, ar (pas fr_FR ou fr-FR)
 */
const getCurrentLocale = (): string => {
    if (typeof window === 'undefined') return 'fr';

    const locale = localStorage.getItem('app_language') || 'fr';

    // S'assurer que la locale est au format simple (fr, en, ar)
    // Convertir fr_FR -> fr, en_US -> en, etc.
    return locale.split('_')[0].split('-')[0].toLowerCase();
};

/**
 * Nettoyer les tokens selon le contexte
 */
const clearAuthData = (): void => {
    if (typeof window === 'undefined') return;

    if (isSuperadminContext()) {
        localStorage.removeItem('superadmin_auth_token');
        localStorage.removeItem('superadmin_user');
    } else {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        localStorage.removeItem('tenant');
    }
};

/**
 * Obtenir l'URL de login selon le contexte
 */
const getLoginUrl = (): string => {
    return isSuperadminContext() ? '/superadmin/login' : '/admin/login';
};

/**
 * Create an API client instance
 * L'API est sur le même domaine, pas besoin de X-Tenant-ID !
 * Le domaine est automatiquement détecté par Laravel
 * @param tenantId - Optional tenant ID (kept for compatibility, not used)
 */
export const createApiClient = (tenantId?: string): AxiosInstance => {
    const client = axios.create({
        baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        withCredentials: true, // Important pour les cookies
    });

    // Request interceptor to add auth token and locale
    client.interceptors.request.use(
        (config: InternalAxiosRequestConfig) => {
            if (config.headers) {
                // Add auth token
                const token = getAuthToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }

                // Add Accept-Language header with current locale
                const locale = getCurrentLocale();
                config.headers['Accept-Language'] = locale;
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    // Response interceptor for error handling
    client.interceptors.response.use(
        (response) => response,
        (error: AxiosError<ApiError>) => {
            if (error.response?.status === 401) {
                clearAuthData();
                if (typeof window !== 'undefined') {
                    window.location.href = getLoginUrl();
                }
            }
            return Promise.reject(error);
        }
    );

    return client;
};

/**
 * Default API client
 */
export const apiClient = createApiClient();
