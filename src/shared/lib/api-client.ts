import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiError } from '../types/api.types';

/**
 * Détecter si on est dans un contexte superadmin
 */
const isSuperadminContext = (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.location.pathname.includes('/superadmin');
};

/**
 * Récupérer le token d'authentification selon le contexte
 * Utilise localStorage pour l'authentification personnalisée
 */
const getAuthToken = (): string | null => {
    if (typeof window === 'undefined') return null;

    // Récupérer le token depuis localStorage selon le contexte
    if (isSuperadminContext()) {
        return localStorage.getItem('superadmin_auth_token');
    }

    return localStorage.getItem('auth_token');
};

/**
 * Récupérer le tenant ID depuis localStorage
 */
const getTenantId = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('tenant_id');
};

/**
 * Récupérer la locale actuelle pour le header Accept-Language
 * Utilise le système [lang] du template Next.js
 * Retourne un format simple: fr, en, ar (pas fr_FR ou fr-FR)
 */
const getCurrentLocale = (): string => {
    if (typeof window === 'undefined') return 'en';

    // Extraire la langue depuis l'URL du template: /en/admin, /fr/superadmin, etc.
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    const langFromUrl = pathParts[0];

    if (['en', 'fr', 'ar'].includes(langFromUrl)) {
        return langFromUrl;
    }

    // Fallback sur localStorage si nécessaire
    const locale = localStorage.getItem('app_language') || 'en';
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
 * Intègre le système [lang] du template
 */
const getLoginUrl = (): string => {
    const locale = getCurrentLocale();
    // Tous les contextes utilisent la même page de login
    return `/${locale}/login`;
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

    // Request interceptor to add auth token, tenant ID, and locale
    client.interceptors.request.use(
        (config: InternalAxiosRequestConfig) => {
            if (config.headers) {
                // Add auth token
                const token = getAuthToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }

                // Add X-Tenant-ID header for multi-tenancy (if not superadmin context)
                if (!isSuperadminContext()) {
                    const tenantId = getTenantId();
                    if (tenantId) {
                        config.headers['X-Tenant-ID'] = tenantId;
                    }
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
