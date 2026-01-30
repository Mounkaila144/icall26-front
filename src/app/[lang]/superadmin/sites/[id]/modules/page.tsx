'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/modules/UsersGuard/superadmin/hooks/useAuth';
import { TenantModulesView } from '@/modules/SuperAdmin/superadmin/components/modules/TenantModulesView';
import { siteService } from '@/modules/Site/superadmin/services/siteService';
import type { Site } from '@/modules/Site/types/site.types';

/**
 * Props de la page (passés par Next.js App Router)
 */
interface PageProps {
  params: {
    id: string;
    lang: string;
  };
}

/**
 * Page de gestion des modules d'un tenant spécifique
 * Route: /[lang]/superadmin/sites/[id]/modules
 *
 * @param {PageProps} props - Props avec params de la route
 */
export default function TenantModulesPage({ params }: PageProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const tenantId = parseInt(params.id, 10);

  const [site, setSite] = useState<Site | null>(null);
  const [loadingSite, setLoadingSite] = useState(true);

  // Load site info
  useEffect(() => {
    const loadSite = async () => {
      if (isNaN(tenantId) || tenantId <= 0) {
        setLoadingSite(false);
        return;
      }

      try {
        const response = await siteService.getSite(tenantId);
        if (response.success) {
          setSite(response.data);
        }
      } catch (error) {
        console.error('Error loading site:', error);
      } finally {
        setLoadingSite(false);
      }
    };

    if (isAuthenticated) {
      loadSite();
    }
  }, [tenantId, isAuthenticated]);

  // Auth check
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/${params.lang}/superadmin/login`);
    }
  }, [isAuthenticated, authLoading, router, params.lang]);

  // Auth loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Validation de l'ID
  if (isNaN(tenantId) || tenantId <= 0) {
    return (
      <div className="container mx-auto py-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">ID de site invalide</p>
        </div>
      </div>
    );
  }

  // Loading site info
  if (loadingSite) {
    return (
      <div className="container mx-auto py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Utiliser le nom du site ou fallback vers l'ID
  const tenantName = site?.host || site?.company || `Site #${tenantId}`;

  return (
    <div className="container mx-auto py-6">
      <TenantModulesView tenantId={tenantId} tenantName={tenantName} />
    </div>
  );
}
