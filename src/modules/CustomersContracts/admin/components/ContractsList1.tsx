'use client'

import { useState, useMemo, useCallback } from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'

// MUI Imports
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Chip from '@mui/material/Chip'
import TextField from '@mui/material/TextField'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'

// Hooks
import { useContracts } from '../hooks/useContracts'
import { useTranslation } from '@/shared/i18n'

// Components
import CreateContractModal from './CreateContractModal'
import EditContractModal from './EditContractModal'
import { DataTable, StandardMobileCard } from '@/components/shared/DataTable'
import type { DataTableConfig, ColumnConfig } from '@/components/shared/DataTable'

// Types
import type { CustomerContract } from '../../types'

// Column helper
const columnHelper = createColumnHelper<CustomerContract>()

/**
 * Available columns configuration
 */
const AVAILABLE_COLUMNS: ColumnConfig[] = [
  // Client Info
  { id: 'customer_name', label: 'Nom Prénom', defaultVisible: true },
  { id: 'customer_phone', label: 'Téléphone', defaultVisible: true },
  { id: 'customer_city', label: 'Ville', defaultVisible: false },
  { id: 'customer_postcode', label: 'Code Postal', defaultVisible: false },

  // Financier
  { id: 'date_ouverture', label: 'Date Ouverture', defaultVisible: true },
  { id: 'montant_ttc', label: 'Montant TTC', defaultVisible: true },

  // Projet
  { id: 'regie_callcenter', label: 'Régie/Callcenter', defaultVisible: false },
  { id: 'acces_1', label: 'Accès 1', defaultVisible: false },
  { id: 'acces_2', label: 'Accès 2', defaultVisible: false },
  { id: 'source', label: 'Source', defaultVisible: false },
  { id: 'periode_cee', label: 'Periode CEE', defaultVisible: false },
  { id: 'surface_parcelle', label: 'Surface Parcelle', defaultVisible: false },
  { id: 'societe_porteuse', label: 'Société Porteuse', defaultVisible: false },

  // Équipe
  { id: 'createur_id', label: 'Créateur', defaultVisible: false },
  { id: 'confirmateur_id', label: 'Confirmateur', defaultVisible: false },
  { id: 'installateur_id', label: 'Installateur', defaultVisible: false },
  { id: 'equipe_installation', label: 'Équipe Installation', defaultVisible: false },
  { id: 'sous_traitant_id', label: 'Sous Traitant', defaultVisible: false },

  // Statuts
  { id: 'confirme', label: 'Confirmé', defaultVisible: true },
  { id: 'facturable', label: 'Facturable', defaultVisible: true },
  { id: 'bloque', label: 'Bloqué', defaultVisible: false },

  // Validations
  { id: 'has_photos', label: 'V Photo', defaultVisible: false },
  { id: 'has_documents', label: 'V Document', defaultVisible: false },
  { id: 'controle_qualite_valide', label: 'V Qualité', defaultVisible: false },

  // Rapports
  { id: 'rapport_temps', label: 'Rapport Temps', defaultVisible: false },
  { id: 'rapport_admin', label: 'Rapport Admin', defaultVisible: false },
  { id: 'rapport_attribution', label: 'Rapport Attribution', defaultVisible: false },
  { id: 'rapport_installation', label: 'Rapport Installation', defaultVisible: false },

  // Autres
  { id: 'campaign_id', label: 'Campaign', defaultVisible: false },
  { id: 'esclave', label: 'Esclave', defaultVisible: false },
  { id: 'actif', label: 'Actif', defaultVisible: true }
]

const STORAGE_KEY = 'contractsListTableColumns'

/**
 * Main Contracts List Component - Refactored with DataTable
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
    getContract
  } = useContracts()

  const { t } = useTranslation('CustomersContracts')

  // States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedContractId, setSelectedContractId] = useState<number | null>(null)

  // Column filters state
  const [showFilters, setShowFilters] = useState(false)
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({})

  // Column visibility
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(() => {
    if (typeof window === 'undefined') return {}

    const saved = localStorage.getItem(STORAGE_KEY)

    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        return {}
      }
    }

    const defaultVisibility: Record<string, boolean> = {}

    AVAILABLE_COLUMNS.forEach(col => {
      defaultVisibility[col.id] = col.defaultVisible !== false
    })

    return defaultVisibility
  })

  // Save column visibility
  useState(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(columnVisibility))
    }
  })

  // Handlers
  const handleDelete = useCallback(
    async (id: number) => {
      if (!confirm('Êtes-vous sûr de vouloir supprimer ce contrat ?')) {
        return
      }

      try {
        await deleteContract(id)
      } catch (err: any) {
        alert('Erreur lors de la suppression: ' + err.message)
      }
    },
    [deleteContract]
  )

  const handleEdit = useCallback((contractId: number) => {
    setSelectedContractId(contractId)
    setIsEditModalOpen(true)
  }, [])

  const handleColumnFilterChange = useCallback((columnId: string, value: string) => {
    setColumnFilters(prev => {
      if (value === '' || value === null || value === undefined) {
        const { [columnId]: _, ...rest } = prev
        return rest
      }

      return {
        ...prev,
        [columnId]: value
      }
    })
  }, [])

  const handleClearAllFilters = useCallback(() => {
    setColumnFilters({})
    clearFilters()
  }, [clearFilters])

  const handleToggleFilters = useCallback(() => {
    setShowFilters(prev => !prev)
  }, [])

  // Format helpers
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('fr-FR')
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price)
  }

  // Helper to create column filter component
  const createColumnFilter = useCallback(
    (columnId: string) => {
      const value = columnFilters[columnId] || ''

      // Text search filters
      const textSearchColumns = [
        'customer_name',
        'customer_phone',
        'customer_city',
        'customer_postcode',
        'regie_callcenter',
        'source',
        'periode_cee',
        'societe_porteuse'
      ]

      if (textSearchColumns.includes(columnId)) {
        return (
          <TextField
            size='small'
            value={value}
            onChange={e => handleColumnFilterChange(columnId, e.target.value)}
            placeholder='Rechercher...'
            fullWidth
            variant='outlined'
            disabled={loading}
            sx={{ minWidth: 120 }}
          />
        )
      }

      // Boolean filters (confirme, facturable, bloque, actif)
      const booleanColumns = ['confirme', 'facturable', 'bloque', 'actif', 'has_photos', 'has_documents', 'controle_qualite_valide']

      if (booleanColumns.includes(columnId)) {
        return (
          <FormControl size='small' fullWidth sx={{ minWidth: 100 }}>
            <Select
              value={value}
              onChange={e => handleColumnFilterChange(columnId, e.target.value)}
              displayEmpty
              disabled={loading}
            >
              <MenuItem value=''>Tous</MenuItem>
              <MenuItem value='true'>Oui</MenuItem>
              <MenuItem value='false'>Non</MenuItem>
            </Select>
          </FormControl>
        )
      }

      return null
    },
    [columnFilters, handleColumnFilterChange, loading]
  )

  // Column definitions
  const columns = useMemo<ColumnDef<CustomerContract, any>[]>(
    () => [
      columnHelper.accessor('id', {
        id: 'id',
        header: '#',
        cell: ({ row }) => (
          <Typography className='font-semibold' color='primary'>
            {row.original.id}
          </Typography>
        )
      }),

      // Customer Name
      columnHelper.accessor('customer', {
        id: 'customer_name',
        header: 'Nom Prénom',
        cell: ({ row }) => (
          <Typography className='font-medium'>
            {row.original.customer?.company || row.original.customer?.nom_prenom || '-'}
          </Typography>
        )
      }),

      // Customer Phone
      columnHelper.accessor('customer', {
        id: 'customer_phone',
        header: 'Téléphone',
        cell: ({ row }) => (
          <Typography>{row.original.customer?.telephone || row.original.customer?.phone || '-'}</Typography>
        )
      }),

      // Customer City
      columnHelper.accessor('customer', {
        id: 'customer_city',
        header: 'Ville',
        cell: ({ row }) => <Typography>{row.original.customer?.address?.city || '-'}</Typography>
      }),

      // Customer Postcode
      columnHelper.accessor('customer', {
        id: 'customer_postcode',
        header: 'Code Postal',
        cell: ({ row }) => <Typography>{row.original.customer?.address?.postcode || '-'}</Typography>
      }),

      // Date Ouverture
      columnHelper.accessor('date_ouverture', {
        id: 'date_ouverture',
        header: 'Date',
        cell: ({ row }) => <Typography>{formatDate(row.original.date_ouverture)}</Typography>
      }),

      // Montant TTC
      columnHelper.accessor('montant_ttc', {
        id: 'montant_ttc',
        header: 'Montant TTC',
        cell: ({ row }) => (
          <Typography className='font-semibold' color='success.main'>
            {formatPrice(row.original.montant_ttc)}
          </Typography>
        )
      }),

      // Projet fields
      columnHelper.accessor('regie_callcenter', {
        id: 'regie_callcenter',
        header: 'Régie/Callcenter',
        cell: ({ row }) => <Typography>{row.original.regie_callcenter || '-'}</Typography>
      }),

      columnHelper.accessor('acces_1', {
        id: 'acces_1',
        header: 'Accès 1',
        cell: ({ row }) => <Typography>{row.original.acces_1 || '-'}</Typography>
      }),

      columnHelper.accessor('acces_2', {
        id: 'acces_2',
        header: 'Accès 2',
        cell: ({ row }) => <Typography>{row.original.acces_2 || '-'}</Typography>
      }),

      columnHelper.accessor('source', {
        id: 'source',
        header: 'Source',
        cell: ({ row }) => <Typography>{row.original.source || '-'}</Typography>
      }),

      columnHelper.accessor('periode_cee', {
        id: 'periode_cee',
        header: 'Periode CEE',
        cell: ({ row }) => <Typography>{row.original.periode_cee || '-'}</Typography>
      }),

      columnHelper.accessor('surface_parcelle', {
        id: 'surface_parcelle',
        header: 'Surface Parcelle',
        cell: ({ row }) => <Typography>{row.original.surface_parcelle || '-'}</Typography>
      }),

      columnHelper.accessor('societe_porteuse', {
        id: 'societe_porteuse',
        header: 'Société Porteuse',
        cell: ({ row }) => <Typography>{row.original.societe_porteuse || '-'}</Typography>
      }),

      // Équipe
      columnHelper.accessor('createur_id', {
        id: 'createur_id',
        header: 'Créateur',
        cell: ({ row }) => <Typography>{row.original.createur_id || '-'}</Typography>
      }),

      columnHelper.accessor('confirmateur_id', {
        id: 'confirmateur_id',
        header: 'Confirmateur',
        cell: ({ row }) => <Typography>{row.original.confirmateur_id || '-'}</Typography>
      }),

      columnHelper.accessor('installateur_id', {
        id: 'installateur_id',
        header: 'Installateur',
        cell: ({ row }) => <Typography>{row.original.installateur_id || '-'}</Typography>
      }),

      columnHelper.accessor('equipe_installation', {
        id: 'equipe_installation',
        header: 'Équipe Installation',
        cell: ({ row }) => <Typography>{row.original.equipe_installation || '-'}</Typography>
      }),

      columnHelper.accessor('sous_traitant_id', {
        id: 'sous_traitant_id',
        header: 'Sous Traitant',
        cell: ({ row }) => <Typography>{row.original.sous_traitant_id || '-'}</Typography>
      }),

      // Statuts
      columnHelper.accessor('confirme', {
        id: 'confirme',
        header: 'Confirmé',
        cell: ({ row }) => (
          <Chip
            variant='tonal'
            label={row.original.confirme ? 'Oui' : 'Non'}
            size='small'
            color={row.original.confirme ? 'success' : 'warning'}
          />
        )
      }),

      columnHelper.accessor('facturable', {
        id: 'facturable',
        header: 'Facturable',
        cell: ({ row }) => (
          <Chip
            variant='tonal'
            label={row.original.facturable ? 'Oui' : 'Non'}
            size='small'
            color={row.original.facturable ? 'success' : 'error'}
          />
        )
      }),

      columnHelper.accessor('bloque', {
        id: 'bloque',
        header: 'Bloqué',
        cell: ({ row }) => (
          <Chip
            variant='tonal'
            label={row.original.bloque ? 'Oui' : 'Non'}
            size='small'
            color={row.original.bloque ? 'error' : 'success'}
          />
        )
      }),

      // Validations
      columnHelper.accessor('has_photos', {
        id: 'has_photos',
        header: 'V Photo',
        cell: ({ row }) => (
          <Typography>{row.original.has_photos ? '📷' : '-'}</Typography>
        )
      }),

      columnHelper.accessor('has_documents', {
        id: 'has_documents',
        header: 'V Document',
        cell: ({ row }) => (
          <Typography>{row.original.has_documents ? '📄' : '-'}</Typography>
        )
      }),

      columnHelper.accessor('controle_qualite_valide', {
        id: 'controle_qualite_valide',
        header: 'V Qualité',
        cell: ({ row }) => (
          <Chip
            variant='tonal'
            label={row.original.controle_qualite_valide ? 'Validé' : 'En attente'}
            size='small'
            color={row.original.controle_qualite_valide ? 'success' : 'default'}
          />
        )
      }),

      // Rapports (showing just icons for brevity)
      columnHelper.accessor('rapport_temps', {
        id: 'rapport_temps',
        header: 'R Temps',
        cell: ({ row }) => <Typography>{row.original.rapport_temps ? '📊' : '-'}</Typography>
      }),

      columnHelper.accessor('rapport_admin', {
        id: 'rapport_admin',
        header: 'R Admin',
        cell: ({ row }) => <Typography>{row.original.rapport_admin ? '📊' : '-'}</Typography>
      }),

      columnHelper.accessor('rapport_attribution', {
        id: 'rapport_attribution',
        header: 'R Attribution',
        cell: ({ row }) => <Typography>{row.original.rapport_attribution ? '📊' : '-'}</Typography>
      }),

      columnHelper.accessor('rapport_installation', {
        id: 'rapport_installation',
        header: 'R Installation',
        cell: ({ row }) => <Typography>{row.original.rapport_installation ? '📊' : '-'}</Typography>
      }),

      // Autres
      columnHelper.accessor('campaign_id', {
        id: 'campaign_id',
        header: 'Campaign',
        cell: ({ row }) => <Typography>{row.original.campaign_id || '-'}</Typography>
      }),

      columnHelper.accessor('esclave', {
        id: 'esclave',
        header: 'Esclave',
        cell: ({ row }) => <Typography>{row.original.esclave || '-'}</Typography>
      }),

      columnHelper.accessor('actif', {
        id: 'actif',
        header: 'Actif',
        cell: ({ row }) => (
          <Chip
            variant='tonal'
            label={row.original.actif ? 'Actif' : 'Supprimé'}
            size='small'
            color={row.original.actif ? 'success' : 'error'}
          />
        )
      }),

      // Actions column
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className='flex items-center gap-0.5'>
            <IconButton size='small' onClick={() => handleDelete(row.original.id)} color='error'>
              <i className='ri-delete-bin-7-line' />
            </IconButton>
            <IconButton size='small' onClick={() => window.open(`/admin/contracts/${row.original.id}`, '_blank')}>
              <i className='ri-eye-line' />
            </IconButton>
            <IconButton size='small' onClick={() => handleEdit(row.original.id)} color='primary'>
              <i className='ri-edit-box-line' />
            </IconButton>
            <IconButton
              size='small'
              onClick={() => {
                navigator.clipboard.writeText(row.original.reference)
                alert('Référence copiée !')
              }}
            >
              <i className='ri-file-copy-line' />
            </IconButton>
          </div>
        )
      })
    ],
    [handleDelete, handleEdit]
  )

  // Pagination config
  const pagination = {
    current_page: currentPage,
    last_page: totalPages,
    per_page: perPage,
    total: total
  }

  // DataTable configuration
  const tableConfig: DataTableConfig<CustomerContract> = {
    columns,
    data: Array.isArray(contracts) ? contracts : [],
    loading,
    pagination,
    availableColumns: AVAILABLE_COLUMNS,
    columnVisibility,
    onColumnVisibilityChange: setColumnVisibility,
    onPageChange: setCurrentPage,
    onPageSizeChange: setPerPage,
    onSearch: value => updateFilter('reference', value),
    onRefresh: () => window.location.reload(),
    searchPlaceholder: 'Rechercher par référence...',
    emptyMessage: 'Aucun contrat trouvé',
    rowsPerPageOptions: [10, 15, 25, 50],

    // Column Filters
    showColumnFilters: showFilters,
    onToggleColumnFilters: handleToggleFilters,
    columnFilters,
    onClearAllFilters: handleClearAllFilters,
    createColumnFilter,

    // Actions
    actions: [
      {
        label: 'Nouveau Contrat',
        icon: 'ri-add-line',
        color: 'primary',
        onClick: () => setIsCreateModalOpen(true)
      }
    ],

    // Mobile card configuration
    mobileCard: {
      renderCard: contract => (
        <StandardMobileCard
          title={contract.customer?.company || contract.customer?.nom_prenom || `Contrat #${contract.id}`}
          subtitle={`Réf: ${contract.reference}`}
          status={{
            label: contract.actif ? 'Actif' : 'Inactif',
            color: contract.actif ? 'success' : 'error'
          }}
          fields={[
            {
              icon: 'ri-money-euro-circle-line',
              label: 'Montant',
              value: formatPrice(contract.montant_ttc)
            },
            {
              icon: 'ri-calendar-line',
              label: 'Date',
              value: formatDate(contract.date_ouverture)
            },
            {
              icon: 'ri-phone-line',
              value: contract.customer?.telephone || contract.customer?.phone || '-'
            },
            {
              icon: 'ri-map-pin-line',
              value: contract.customer?.address?.city || '-',
              hidden: !contract.customer?.address?.city
            },
            {
              icon: 'ri-checkbox-circle-line',
              value: (
                <Box className='flex gap-2'>
                  <Chip
                    variant='tonal'
                    label={contract.confirme ? 'Confirmé' : 'Non confirmé'}
                    size='small'
                    color={contract.confirme ? 'success' : 'warning'}
                  />
                  <Chip
                    variant='tonal'
                    label={contract.facturable ? 'Facturable' : 'Non facturable'}
                    size='small'
                    color={contract.facturable ? 'success' : 'error'}
                  />
                </Box>
              )
            }
          ]}
          actions={[
            {
              icon: 'ri-delete-bin-7-line',
              color: 'error',
              onClick: () => handleDelete(contract.id)
            },
            {
              icon: 'ri-eye-line',
              color: 'default',
              onClick: () => window.open(`/admin/contracts/${contract.id}`, '_blank')
            },
            {
              icon: 'ri-edit-box-line',
              color: 'primary',
              onClick: () => handleEdit(contract.id)
            }
          ]}
          item={contract}
        />
      )
    }
  }

  return (
    <>
      {error && (
        <Box
          sx={{
            background: '#fee',
            color: '#c33',
            padding: 2,
            borderRadius: 2,
            marginBottom: 2,
            border: '1px solid #fcc'
          }}
        >
          ❌ {error}
        </Box>
      )}

      <DataTable {...tableConfig} />

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
          setIsEditModalOpen(false)
          setSelectedContractId(null)
        }}
        onUpdate={updateContract}
        contractId={selectedContractId}
        onFetchContract={getContract}
      />
    </>
  )
}
