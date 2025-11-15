'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/modules/UsersGuard/superadmin/hooks/useAuth';
import {
  StatisticsCards,
  SitesTable,
  SiteFormModal,
  SiteDetailModal,
  useSites,
  useSite,
  SiteListItem,
  CreateSiteData,
  UpdateSiteData,
  Site,
} from '@/modules/Site';

export default function SitesManagementPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { sites, meta, statistics, isLoading, error, refresh } = useSites();
  const {
    site,
    createSite,
    updateSite,
    deleteSite,
    testConnection,
    loadSite,
    isLoading: siteLoading,
  } = useSite();

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedSiteId, setSelectedSiteId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showConnectionResult, setShowConnectionResult] = useState<{
    show: boolean;
    success: boolean;
    message: string;
  }>({ show: false, success: false, message: '' });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/superadmin/login');
    }
  }, [isAuthenticated, authLoading, router]);

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

  const handleCreateClick = () => {
    setSelectedSiteId(null);
    setFormMode('create');
    setIsFormModalOpen(true);
  };

  const handleEditClick = async (siteItem: SiteListItem) => {
    setSelectedSiteId(siteItem.id);
    setFormMode('edit');

    // Charger les détails complets du site
    await loadSite(siteItem.id);
    setIsFormModalOpen(true);
  };

  const handleViewClick = async (siteItem: SiteListItem) => {
    setSelectedSiteId(siteItem.id);

    // Charger les détails complets du site
    await loadSite(siteItem.id);
    setIsDetailModalOpen(true);
  };

  const handleDeleteClick = async (site: SiteListItem) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le site "${site.host}" ?`)) {
      const deleteDb = window.confirm('Voulez-vous également supprimer la base de données ?');
      try {
        await deleteSite(site.id, deleteDb);
        await refresh();
        alert('Site supprimé avec succès');
      } catch (err) {
        alert('Erreur lors de la suppression du site');
      }
    }
  };

  const handleTestConnection = async (site: SiteListItem) => {
    try {
      const success = await testConnection(site.id);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-lg border-b-4 border-indigo-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestion des Sites</h1>
              <p className="mt-1 text-sm text-gray-500">
                Gérez tous les sites et leurs configurations
              </p>
            </div>
            <button
              onClick={handleCreateClick}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-105"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nouveau Site
            </button>
          </div>
        </div>
      </div>

      {/* Connection Result Alert */}
      {showConnectionResult.show && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics */}
        <div className="mb-8">
          <StatisticsCards statistics={statistics} isLoading={isLoading} />
        </div>

        {/* Search and Filters */}
        <div className="mb-6 bg-white rounded-lg shadow-lg p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Rechercher un site..."
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={refresh}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Actualiser
              </button>
            </div>
          </div>
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
          isLoading={isLoading}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          onView={handleViewClick}
          onTestConnection={handleTestConnection}
        />

        {/* Pagination */}
        {meta && meta.total > meta.per_page && (
          <div className="mt-6 bg-white rounded-lg shadow-lg p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Affichage de <span className="font-medium">{meta.from}</span> à{' '}
                <span className="font-medium">{meta.to}</span> sur{' '}
                <span className="font-medium">{meta.total}</span> résultats
              </div>
              <div className="flex space-x-2">
                <button
                  disabled={meta.current_page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Précédent
                </button>
                <button
                  disabled={meta.current_page === meta.last_page}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Suivant
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

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

      {/* Detail Modal */}
      <SiteDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedSiteId(null);
        }}
        site={site}
      />
    </div>
  );
}
