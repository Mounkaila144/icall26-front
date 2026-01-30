'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/modules/UsersGuard/superadmin/hooks/useAuth';
import {
  StatisticsCards,
  SitesTable,
  SiteFormModal,
  useSite,
  SiteListItem,
  CreateSiteData,
  UpdateSiteData,
  SiteFilters,
  SitePaginationMeta,
  SiteStatistics,
} from '@/modules/Site';
import { TenantModulesModal } from '@/modules/SuperAdmin';
import { siteService } from '@/modules/Site/superadmin/services/siteService';
import { AxiosError } from 'axios';

export default function SitesManagementPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const {
    site,
    createSite,
    updateSite,
    deleteSite,
    testConnection,
    loadSite,
    isLoading: siteLoading,
  } = useSite();

  // States
  const [sites, setSites] = useState<SiteListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [pagination, setPagination] = useState<SitePaginationMeta>({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
    from: null,
    to: null
  });

  // Statistics
  const [statistics, setStatistics] = useState<SiteStatistics | null>(null);

  // Filters
  const [globalSearch, setGlobalSearch] = useState('');
  const [filters, setFilters] = useState<SiteFilters>({
    sort_by: 'site_id',
    sort_order: 'desc',
    per_page: 15
  });

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isModulesModalOpen, setIsModulesModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedSiteId, setSelectedSiteId] = useState<number | null>(null);
  const [selectedSiteName, setSelectedSiteName] = useState<string>('');
  const [showConnectionResult, setShowConnectionResult] = useState<{
    show: boolean;
    success: boolean;
    message: string;
  }>({ show: false, success: false, message: '' });

  // Auth check
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/superadmin/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Load sites
  const loadSites = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await siteService.getSites({
        ...filters,
        page: pagination.current_page,
        search: globalSearch || undefined
      });

      if (response.success) {
        setSites(response.data);
        setPagination(response.meta);
      }
    } catch (err: any) {
      const axiosError = err as AxiosError<{ message: string }>;
      const errorMessage = axiosError.response?.data?.message || 'Erreur lors du chargement des sites';
      setError(errorMessage);
      console.error('Error loading sites:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.current_page, filters, globalSearch]);

  // Load statistics
  const loadStatistics = useCallback(async () => {
    try {
      const stats = await siteService.getStatistics();
      setStatistics(stats);
    } catch (err) {
      console.error('Failed to load statistics:', err);
    }
  }, []);

  // Load on mount and when dependencies change
  useEffect(() => {
    if (isAuthenticated) {
      loadSites();
      loadStatistics();
    }
  }, [isAuthenticated, loadSites, loadStatistics]);

  // Refresh function
  const refresh = useCallback(async () => {
    await loadSites();
    await loadStatistics();
  }, [loadSites, loadStatistics]);

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

  // Handlers
  const handleCreateClick = () => {
    setSelectedSiteId(null);
    setFormMode('create');
    setIsFormModalOpen(true);
  };

  const handleEditClick = async (siteItem: SiteListItem) => {
    setSelectedSiteId(siteItem.id);
    setFormMode('edit');
    await loadSite(siteItem.id);
    setIsFormModalOpen(true);
  };

  const handleManageModules = (siteItem: SiteListItem) => {
    setSelectedSiteId(siteItem.id);
    setSelectedSiteName(siteItem.host || siteItem.company || `Site #${siteItem.id}`);
    setIsModulesModalOpen(true);
  };

  const handleDeleteClick = async (siteItem: SiteListItem) => {
    const deleteDb = window.confirm('Voulez-vous également supprimer la base de données ?');
    try {
      await deleteSite(siteItem.id, deleteDb);
      await refresh();
    } catch (err) {
      console.error('Error deleting site:', err);
    }
  };

  const handleTestConnection = async (siteItem: SiteListItem) => {
    try {
      const success = await testConnection(siteItem.id);
      setShowConnectionResult({
        show: true,
        success,
        message: success
          ? 'Connexion réussie à la base de données'
          : 'Échec de la connexion à la base de données',
      });

      setTimeout(() => {
        setShowConnectionResult({ show: false, success: false, message: '' });
      }, 3000);
    } catch (err) {
      setShowConnectionResult({
        show: true,
        success: false,
        message: 'Erreur lors du test de connexion',
      });
    }
  };

  const handleFormSubmit = async (data: CreateSiteData | UpdateSiteData) => {
    try {
      if (formMode === 'create') {
        await createSite(data as CreateSiteData);
      } else if (selectedSiteId) {
        await updateSite(selectedSiteId, data as UpdateSiteData);
      }
      await refresh();
      setIsFormModalOpen(false);
      setSelectedSiteId(null);
    } catch (err) {
      console.error('Form submission error:', err);
      throw err;
    }
  };

  return (
    <div className="container mx-auto py-6">
      {/* Connection Result Alert */}
      {showConnectionResult.show && (
        <div className="mb-4">
          <div
            className={`rounded-lg p-4 ${
              showConnectionResult.success
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}
          >
            <div className="flex">
              <div className="flex-shrink-0">
                {showConnectionResult.success ? (
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p
                  className={`text-sm font-medium ${
                    showConnectionResult.success ? 'text-green-800' : 'text-red-800'
                  }`}
                >
                  {showConnectionResult.message}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="mb-6">
        <StatisticsCards statistics={statistics} isLoading={loading} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Sites Table */}
      <SitesTable
        sites={sites}
        isLoading={loading}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
        onManageModules={handleManageModules}
        onTestConnection={handleTestConnection}
        onAdd={handleCreateClick}
        pagination={pagination}
        onPageChange={(page) => {
          setPagination(prev => ({ ...prev, current_page: page }));
        }}
        onPageSizeChange={(size) => {
          setFilters(prev => ({ ...prev, per_page: size }));
          setPagination(prev => ({ ...prev, per_page: size, current_page: 1 }));
        }}
        onRefresh={refresh}
        onSearch={setGlobalSearch}
      />

      {/* Form Modal */}
      <SiteFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedSiteId(null);
        }}
        onSubmit={handleFormSubmit}
        site={formMode === 'edit' ? site : null}
        mode={formMode}
      />

      {/* Modules Management Modal */}
      {selectedSiteId && (
        <TenantModulesModal
          isOpen={isModulesModalOpen}
          onClose={() => {
            setIsModulesModalOpen(false);
            setSelectedSiteId(null);
            setSelectedSiteName('');
          }}
          tenantId={selectedSiteId}
          tenantName={selectedSiteName}
        />
      )}
    </div>
  );
}
