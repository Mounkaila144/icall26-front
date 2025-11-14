// ============================================================================
// CustomersContracts Module - Main Contracts List Component
// ============================================================================

'use client';

import React, { useState } from 'react';
import { useContracts } from '../hooks/useContracts';
import { useSidebar } from '@/src/shared/lib/sidebar-context';
import { useTranslation } from '@/src/shared/i18n';
import CreateContractModal from './CreateContractModal';
import EditContractModal from './EditContractModal';
import type { CustomerContract } from '../../types';
import {Can} from "@/shared/components/permissions";

/**
 * StatusBadge Component - Display status with color and icon
 */
interface StatusBadgeProps {
  name: string;
  color: string;
  icon?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ name, color, icon }) => {
  const style: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 12px',
    borderRadius: '20px',
    backgroundColor: `${color}20`,
    color: color,
    fontSize: '13px',
    fontWeight: '500',
    border: `1px solid ${color}40`,
  };

  return (
    <span style={style}>
      {icon && <span>{icon}</span>}
      {name}
    </span>
  );
};

/**
 * ActionsDropdown Component - Dropdown menu for contract actions
 */
interface ActionsDropdownProps {
  contract: CustomerContract;
  onEdit: () => void;
  onDelete: () => void;
}

const ActionsDropdown: React.FC<ActionsDropdownProps> = ({ contract, onEdit, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);

  const buttonStyle: React.CSSProperties = {
    padding: '6px 12px',
    background: 'rgb(30, 58, 138)',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s',
  };

  const dropdownContainerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-block',
  };

  const dropdownMenuStyle: React.CSSProperties = {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '4px',
    background: 'white',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    minWidth: '180px',
    zIndex: 9999,
    overflow: 'hidden',
  };

  const menuItemStyle: React.CSSProperties = {
    padding: '10px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
    transition: 'background 0.2s',
    fontSize: '14px',
    border: 'none',
    width: '100%',
    textAlign: 'left',
    background: 'transparent',
  };

  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
    setIsOpen(false);
  };

  return (
    <div style={dropdownContainerStyle}>
      <button
        style={buttonStyle}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.background = 'rgb(23, 45, 107)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.background = 'rgb(30, 58, 138)';
        }}
      >
        <span>⚙️</span>
        <span>Actions</span>
        <span style={{
          transition: 'transform 0.3s',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          fontSize: '10px',
        }}>▼</span>
      </button>

      {isOpen && (
        <>
          {/* Overlay to close dropdown when clicking outside */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 9998,
            }}
            onClick={() => setIsOpen(false)}
          />

          <div style={dropdownMenuStyle}>
            <button
              style={menuItemStyle}
              onClick={(e) => handleAction(e, onEdit)}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f5f5ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <span style={{ fontSize: '16px' }}>✏️</span>
              <span style={{ color: '#667eea', fontWeight: '500' }}>Modifier</span>
            </button>

            <button
              style={menuItemStyle}
              onClick={(e) => handleAction(e, () => {
                navigator.clipboard.writeText(contract.reference);
              })}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f5f5ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <span style={{ fontSize: '16px' }}>📋</span>
              <span style={{ color: '#28a745', fontWeight: '500' }}>Copier Réf</span>
            </button>

            <button
              style={menuItemStyle}
              onClick={(e) => handleAction(e, () => {
                window.open(`/admin/contracts/${contract.id}`, '_blank');
              })}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f5f5ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <span style={{ fontSize: '16px' }}>👁️</span>
              <span style={{ color: '#17a2b8', fontWeight: '500' }}>Voir Détails</span>
            </button>

            <div style={{ height: '1px', background: '#e0e0e0', margin: '4px 0' }} />

            <button
              style={menuItemStyle}
              onClick={(e) => handleAction(e, onDelete)}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#fee';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <span style={{ fontSize: '16px' }}>🗑️</span>
              <span style={{ color: '#dc3545', fontWeight: '500' }}>Supprimer</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

/**
 * Main Contracts List Component
 */
export default function ContractsList1() {
  const {
    contracts,
    loading,
    error,
    currentPage,
    totalPages,
    total,
    perPage,
    filters,
    setCurrentPage,
    setPerPage,
    updateFilter,
    clearFilters,
    deleteContract,
    createContract,
    updateContract,
    getContract,
  } = useContracts();

  const { isCollapsed } = useSidebar();
  const { t } = useTranslation('CustomersContracts');
  const [searchTerm, setSearchTerm] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState<number | null>(null);

  // Styles
  const containerStyle: React.CSSProperties = {
    padding: '24px',
    width: '100%',
    maxWidth: isCollapsed ? 'calc(100vw - 120px)' : 'calc(100vw - 280px)', // Ajustement dynamique selon l'état du sidebar
    margin: '0 auto',
    overflow: 'hidden',
    boxSizing: 'border-box',
    transition: 'max-width 0.3s ease', // Transition fluide lors du toggle
  };

  const headerStyle: React.CSSProperties = {
    marginBottom: '32px',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '32px',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '8px',
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '16px',
    color: '#666',
  };

  const cardStyle: React.CSSProperties = {
    background: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginBottom: '24px',
    width: '100%',
    boxSizing: 'border-box',
    overflow: 'hidden',
  };

  const filtersSectionStyle: React.CSSProperties = {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    padding: '16px',
    background: '#f8f9fa',
    borderRadius: '8px',
    marginTop: '12px',
  };

  const inputStyle: React.CSSProperties = {
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '13px',
    flex: '1',
    minWidth: '180px',
    maxWidth: '250px',
  };

  const selectStyle: React.CSSProperties = {
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '13px',
    minWidth: '140px',
    maxWidth: '180px',
    cursor: 'pointer',
  };

  const buttonStyle: React.CSSProperties = {
    padding: '8px 16px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'transform 0.2s',
    whiteSpace: 'nowrap',
  };

  const secondaryButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    background: '#6c757d',
  };

  const filterToggleButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
    color: '#667eea',
    border: '1px solid #667eea40',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    width: '100%',
    justifyContent: 'space-between',
  };

  const tableContainerStyle: React.CSSProperties = {
    overflowX: 'auto',
    overflowY: 'auto',
    maxHeight: '70vh',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    position: 'relative',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    width: '100%',
  };

  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: '0',
    minWidth: 'max-content', // Allow table to be as wide as needed
  };

  const thStyle: React.CSSProperties = {
    textAlign: 'left',
    padding: '12px 10px',
    background: '#1e40af',
    color: 'white',
    fontWeight: '600',
    fontSize: '12px',
    position: 'sticky',
    top: 0,
    zIndex: 10,
    borderRight: '1px solid rgba(255,255,255,0.2)',
    whiteSpace: 'nowrap',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  };

  const thStickyStyle: React.CSSProperties = {
    ...thStyle,
    left: 0,
    zIndex: 20,
    boxShadow: '2px 0 6px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)',
    background: '#1e3a8a',
  };

  const tdStyle: React.CSSProperties = {
    padding: '10px',
    borderBottom: '1px solid #f0f0f0',
    borderRight: '1px solid #f5f5f5',
    fontSize: '13px',
    backgroundColor: 'white',
    whiteSpace: 'nowrap',
  };

  const tdStickyStyle: React.CSSProperties = {
    ...tdStyle,
    position: 'sticky',
    left: 0,
    backgroundColor: '#fafafa',
    fontWeight: '600',
    zIndex: 9,
    boxShadow: '2px 0 5px rgba(0,0,0,0.05)',
  };

  const groupHeaderStyle: React.CSSProperties = {
    ...thStyle,
    background: '#2563eb',
    textAlign: 'center',
    fontSize: '12px',
    fontWeight: '700',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    boxShadow: '0 3px 6px rgba(0, 0, 0, 0.15)',
    borderBottom: '2px solid rgba(255, 255, 255, 0.3)',
  };

  const thSecondRowStyle: React.CSSProperties = {
    ...thStyle,
    top: '44px', // Position sous la première ligne (hauteur approximative de la première ligne)
  };

  const paginationStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '24px',
    flexWrap: 'wrap',
    gap: '16px',
  };

  const loadingStyle: React.CSSProperties = {
    textAlign: 'center',
    padding: '40px',
    fontSize: '16px',
    color: '#666',
  };

  const errorStyle: React.CSSProperties = {
    background: '#fee',
    color: '#c33',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '16px',
    border: '1px solid #fcc',
  };

  const emptyStyle: React.CSSProperties = {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#999',
    fontSize: '16px',
  };

  const deleteButtonStyle: React.CSSProperties = {
    padding: '6px 12px',
    background: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'background 0.2s',
  };

  const badgeStyle: React.CSSProperties = {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '500',
  };

  // Handlers
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilter('reference', searchTerm);
  };

  const handleDelete = async (id: number) => {
    await deleteContract(id);
  };

  const handleEdit = (contractId: number) => {
    setSelectedContractId(contractId);
    setIsEditModalOpen(true);
  };

  const handleRowDoubleClick = (contractId: number) => {
    handleEdit(contractId);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    clearFilters();
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  return (
    <div style={containerStyle}>
      {/* Header with New Contract Button */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
      }}>
        <div style={headerStyle}>
          <h1 style={titleStyle}>Contracts Management</h1>
          <p style={subtitleStyle}>Manage and track all customer contracts</p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          style={{
            ...buttonStyle,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            padding: '12px 24px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <span style={{ fontSize: '18px' }}>+</span>
          <span>Nouveau Contrat</span>
        </button>
      </div>

      {/* Results */}
      <div style={cardStyle}>
        {error && <div style={errorStyle}>❌ {error}</div>}

        {loading ? (
          <div style={loadingStyle}>
            <div
              style={{
                display: 'inline-block',
                width: '40px',
                height: '40px',
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #667eea',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            />
            <p style={{ marginTop: '16px' }}>Loading contracts...</p>
          </div>
        ) : !Array.isArray(contracts) || contracts.length === 0 ? (
          <div style={emptyStyle}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
            <p>No contracts found</p>
          </div>
        ) : (
          <>
            {/* Filters Toggle Button */}
            <button
              type="button"
              onClick={() => setFiltersOpen(!filtersOpen)}
              style={filterToggleButtonStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #667eea25 0%, #764ba225 100%)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)';
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🔍</span>
                <span>Filtres et options</span>
              </span>
              <span style={{
                transition: 'transform 0.3s ease',
                transform: filtersOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                display: 'inline-block'
              }}>
                ▼
              </span>
            </button>

            {/* Filters - Collapsible */}
            {filtersOpen && (
              <form onSubmit={handleSearch}>
                <div style={filtersSectionStyle}>
                  <input
                    type="text"
                    placeholder="Search by reference..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={inputStyle}
                  />

                  <select
                    value={filters.actif !== undefined ? (filters.actif ? 'true' : 'false') : 'all'}
                    onChange={(e) => {
                      if (e.target.value === 'all') {
                        updateFilter('actif', undefined);
                      } else {
                        updateFilter('actif', e.target.value === 'true');
                      }
                    }}
                    style={selectStyle}
                  >
                    <option value="all">All Status</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>

                  <select
                    value={filters.confirme !== undefined ? (filters.confirme ? 'true' : 'false') : 'all'}
                    onChange={(e) => {
                      if (e.target.value === 'all') {
                        updateFilter('confirme', undefined);
                      } else {
                        updateFilter('confirme', e.target.value === 'true');
                      }
                    }}
                    style={selectStyle}
                  >
                    <option value="all">All Confirmed</option>
                    <option value="true">Confirmed</option>
                    <option value="false">Not Confirmed</option>
                  </select>

                  <select
                    value={filters.sort_by || 'created_at'}
                    onChange={(e) => updateFilter('sort_by', e.target.value)}
                    style={selectStyle}
                  >
                    <option value="created_at">Created Date</option>
                    <option value="reference">Reference</option>
                    <option value="date_ouverture">Opened Date</option>
                    <option value="date_paiement">Payment Date</option>
                    <option value="montant_ttc">Price TTC</option>
                  </select>

                  <select
                    value={filters.sort_order || 'desc'}
                    onChange={(e) => updateFilter('sort_order', e.target.value as 'asc' | 'desc')}
                    style={selectStyle}
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>

                  <select
                    value={perPage}
                    onChange={(e) => setPerPage(Number(e.target.value))}
                    style={selectStyle}
                  >
                    <option value={10}>10 per page</option>
                    <option value={15}>15 per page</option>
                    <option value={25}>25 per page</option>
                    <option value={50}>50 per page</option>
                  </select>

                  <button type="submit" style={buttonStyle}>
                    Search
                  </button>

                  <button type="button" onClick={handleClearFilters} style={secondaryButtonStyle}>
                    Clear
                  </button>
                </div>
              </form>
            )}

              <Can credential={[['admin', 'superadmin', 'settings_user_listz']]}>
                  <h1>{t('Edit User')}</h1>
              </Can>
            <div style={tableContainerStyle} className="custom-scroll">
              <table style={tableStyle}>
                <thead>
                  {/* Group Headers Row */}
                  <tr>
                    <th style={thStickyStyle} rowSpan={2}>ID</th>
                    <th style={{...thStyle, background: 'rgb(30, 58, 138)', color: 'white'}} rowSpan={2}>Actions</th>
                    <th style={groupHeaderStyle} colSpan={4}>📋 INFORMATIONS CLIENT</th>
                    <th style={groupHeaderStyle} colSpan={2}>💰 FINANCIER</th>
                    <th style={groupHeaderStyle} colSpan={7}>🏢 PROJET</th>
                    <th style={groupHeaderStyle} colSpan={5}>👥 ÉQUIPE</th>
                    <th style={groupHeaderStyle} colSpan={3}>✅ STATUTS</th>
                    <th style={groupHeaderStyle} colSpan={3}>📸 VALIDATIONS</th>
                    <th style={groupHeaderStyle} colSpan={4}>📊 RAPPORTS</th>
                    <th style={groupHeaderStyle} colSpan={3}>🔧 AUTRES</th>
                  </tr>
                  {/* Column Headers Row */}
                  <tr>
                    {/* Client Info */}
                    <th style={thSecondRowStyle}>Nom Prénom</th>
                    <th style={thSecondRowStyle}>Téléphone</th>
                    <th style={thSecondRowStyle}>Ville</th>
                    <th style={thSecondRowStyle}>Code Postal</th>
                    {/* Financier */}
                    <th style={thSecondRowStyle}>Date</th>
                    <th style={thSecondRowStyle}>Montant</th>
                    {/* Projet */}
                    <th style={thSecondRowStyle}>Régie/callcenter</th>
                    <th style={thSecondRowStyle}>Accès 1</th>
                    <th style={thSecondRowStyle}>Accès 2</th>
                    <th style={thSecondRowStyle}>Source</th>
                    <th style={thSecondRowStyle}>Periode CEE</th>
                    <th style={thSecondRowStyle}>Surface parcelle</th>
                    <th style={thSecondRowStyle}>Société porteuse</th>
                    {/* Équipe */}
                    <th style={thSecondRowStyle}>Créateur</th>
                    <th style={thSecondRowStyle}>Confirmateur</th>
                    <th style={thSecondRowStyle}>Installateur</th>
                    <th style={thSecondRowStyle}>Equipe d'installation</th>
                    <th style={thSecondRowStyle}>Sous Traitant</th>
                    {/* Statuts */}
                    <th style={thSecondRowStyle}>Confirmé</th>
                    <th style={thSecondRowStyle}>Facturable</th>
                    <th style={thSecondRowStyle}>Bloqué</th>
                    {/* Validations */}
                    <th style={thSecondRowStyle}>V Photo</th>
                    <th style={thSecondRowStyle}>V Document</th>
                    <th style={thSecondRowStyle}>V Qualité</th>
                    {/* Rapports */}
                    <th style={thSecondRowStyle}>Temps</th>
                    <th style={thSecondRowStyle}>Admin</th>
                    <th style={thSecondRowStyle}>Attribution</th>
                    <th style={thSecondRowStyle}>Installation</th>
                    {/* Autres */}
                    <th style={thSecondRowStyle}>Campaign</th>
                    <th style={thSecondRowStyle}>Esclave</th>
                    <th style={thSecondRowStyle}>Actif</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(contracts) && contracts.map((contract, index) => {
                    const rowBg = index % 2 === 0 ? 'white' : '#fafafa';
                    return (
                    <tr
                      key={contract.id}
                      onDoubleClick={() => handleRowDoubleClick(contract.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      {/* ID - Sticky */}
                      <td style={{
                        ...tdStickyStyle,
                        backgroundColor: rowBg,
                      }}>
                        <strong style={{ color: '#667eea' }}>{contract.id}</strong>
                      </td>

                      {/* Actions */}
                      <td style={{
                        ...tdStyle,
                        backgroundColor: 'rgba(30, 58, 138, 0.08)',
                      }}>
                        <ActionsDropdown
                          contract={contract}
                          onEdit={() => handleEdit(contract.id)}
                          onDelete={() => handleDelete(contract.id)}
                        />
                      </td>

                      {/* Nom Prénom */}
                      <td style={tdStyle}>
                        {contract.customer ? (
                          <div style={{ fontWeight: '500' }}>
                            {contract.customer.company || contract.customer.nom_prenom}
                          </div>
                        ) : (
                          <span style={{ color: '#999' }}>-</span>
                        )}
                      </td>

                      {/* Téléphone */}
                      <td style={tdStyle}>
                        {contract.customer?.telephone || contract.customer?.phone || '-'}
                      </td>

                      {/* Ville */}
                      <td style={tdStyle}>
                        {contract.customer?.address?.city || '-'}
                      </td>

                      {/* Code Postal */}
                      <td style={tdStyle}>
                        {contract.customer?.address?.postcode || '-'}
                      </td>

                      {/* Date */}
                      <td style={tdStyle}>{formatDate(contract.date_ouverture)}</td>

                      {/* Montant */}
                      <td style={tdStyle}>
                        <strong>{formatPrice(contract.montant_ttc)}</strong>
                      </td>

                      {/* Régie/callcenter */}
                      <td style={tdStyle}>{contract.regie_callcenter || '-'}</td>

                      {/* Accès 1 */}
                      <td style={tdStyle}>{contract.acces_1 || '-'}</td>

                      {/* Accès 2 */}
                      <td style={tdStyle}>{contract.acces_2 || '-'}</td>

                      {/* Source */}
                      <td style={tdStyle}>{contract.source || '-'}</td>

                      {/* Periode CEE */}
                      <td style={tdStyle}>{contract.periode_cee || '-'}</td>

                      {/* Surface parcelle */}
                      <td style={tdStyle}>{contract.surface_parcelle || '-'}</td>

                      {/* Société porteuse */}
                      <td style={tdStyle}>{contract.societe_porteuse || '-'}</td>

                      {/* Créateur */}
                      <td style={tdStyle}>{contract.createur_id || '-'}</td>

                      {/* Confirmateur */}
                      <td style={tdStyle}>{contract.confirmateur_id || '-'}</td>

                      {/* Installateur */}
                      <td style={tdStyle}>{contract.installateur_id || '-'}</td>

                      {/* Equipe d'installation */}
                      <td style={tdStyle}>{contract.equipe_installation || '-'}</td>

                      {/* Sous Traitant */}
                      <td style={tdStyle}>{contract.sous_traitant_id || '-'}</td>

                      {/* Confirmé */}
                      <td style={tdStyle}>
                        {contract.confirme ? (
                          <span style={{ color: '#28a745' }}>✅</span>
                        ) : (
                          <span style={{ color: '#ffc107' }}>⏳</span>
                        )}
                      </td>

                      {/* Facturable */}
                      <td style={tdStyle}>
                        {contract.facturable ? (
                          <span style={{ color: '#28a745' }}>✅</span>
                        ) : (
                          <span style={{ color: '#dc3545' }}>❌</span>
                        )}
                      </td>

                      {/* Bloqué */}
                      <td style={tdStyle}>
                        {contract.bloque ? (
                          <span style={{ color: '#dc3545' }}>🔒</span>
                        ) : (
                          <span style={{ color: '#28a745' }}>🔓</span>
                        )}
                      </td>

                      {/* Devis bloq */}
                      <td style={tdStyle}>
                        {contract.devis_bloque ? (
                          <span style={{ color: '#dc3545' }}>🔒</span>
                        ) : (
                          <span style={{ color: '#28a745' }}>🔓</span>
                        )}
                      </td>

                      {/* V Photo */}
                      <td style={tdStyle}>
                        {contract.has_photos ? (
                          <span style={{ color: '#28a745' }}>📷</span>
                        ) : (
                          <span style={{ color: '#999' }}>-</span>
                        )}
                      </td>

                      {/* V Document */}
                      <td style={tdStyle}>
                        {contract.has_documents ? (
                          <span style={{ color: '#28a745' }}>📄</span>
                        ) : (
                          <span style={{ color: '#999' }}>-</span>
                        )}
                      </td>

                      {/* V controle qualité */}
                      <td style={tdStyle}>
                        {contract.controle_qualite_valide ? (
                          <span style={{ color: '#28a745' }}>✅</span>
                        ) : (
                          <span style={{ color: '#999' }}>-</span>
                        )}
                      </td>

                      {/* Rapport temps */}
                      <td style={tdStyle}>
                        {contract.rapport_temps ? (
                          <span title={contract.rapport_temps}>📊</span>
                        ) : (
                          '-'
                        )}
                      </td>

                      {/* Rapport Admin. */}
                      <td style={tdStyle}>
                        {contract.rapport_admin ? (
                          <span title={contract.rapport_admin}>📊</span>
                        ) : (
                          '-'
                        )}
                      </td>

                      {/* Rapport Attribution */}
                      <td style={tdStyle}>
                        {contract.rapport_attribution ? (
                          <span title={contract.rapport_attribution}>📊</span>
                        ) : (
                          '-'
                        )}
                      </td>

                      {/* Rapport d'installation */}
                      <td style={tdStyle}>
                        {contract.rapport_installation ? (
                          <span title={contract.rapport_installation}>📊</span>
                        ) : (
                          '-'
                        )}
                      </td>

                      {/* Campaign ID */}
                      <td style={tdStyle}>{contract.campaign_id || '-'}</td>

                      {/* Esclave */}
                      <td style={tdStyle}>{contract.esclave || '-'}</td>

                      {/* Actif/Supprimé */}
                      <td style={tdStyle}>
                        <span
                          style={{
                            ...badgeStyle,
                            backgroundColor: contract.actif ? '#28a74520' : '#dc354520',
                            color: contract.actif ? '#28a745' : '#dc3545',
                          }}
                        >
                          {contract.actif ? 'Actif' : 'Supprimé'}
                        </span>
                      </td>
                    </tr>
                  );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div style={paginationStyle}>
              <div style={{ color: '#666', fontSize: '14px' }}>
                Showing {(currentPage - 1) * perPage + 1} to{' '}
                {Math.min(currentPage * perPage, total)} of {total} contracts
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  style={{
                    ...buttonStyle,
                    opacity: currentPage === 1 ? 0.5 : 1,
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  }}
                >
                  Previous
                </button>

                <span style={{ padding: '0 16px', color: '#666', fontSize: '14px' }}>
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  style={{
                    ...buttonStyle,
                    opacity: currentPage === totalPages ? 0.5 : 1,
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* CSS Styles */}
      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        /* Custom Scrollbar */
        :global(.custom-scroll) {
          scrollbar-width: thin;
          scrollbar-color: #667eea #f0f0f0;
        }

        :global(.custom-scroll::-webkit-scrollbar) {
          height: 12px;
          width: 12px;
        }

        :global(.custom-scroll::-webkit-scrollbar-track) {
          background: #f0f0f0;
          border-radius: 10px;
        }

        :global(.custom-scroll::-webkit-scrollbar-thumb) {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 10px;
          border: 2px solid #f0f0f0;
        }

        :global(.custom-scroll::-webkit-scrollbar-thumb:hover) {
          background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
        }

        /* Hover effect on table rows */
        :global(tbody tr:hover) {
          background-color: #f5f5ff !important;
          transition: background-color 0.2s ease;
        }
      `}</style>

      {/* Create Contract Modal */}
      <CreateContractModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={createContract}
      />

      {/* Edit Contract Modal */}
      <EditContractModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedContractId(null);
        }}
        onUpdate={updateContract}
        contractId={selectedContractId}
        onFetchContract={getContract}
      />
    </div>
  );
}
