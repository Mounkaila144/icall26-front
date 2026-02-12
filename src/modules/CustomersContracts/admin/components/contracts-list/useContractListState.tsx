import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'

import Typography from '@mui/material/Typography'

import { usePermissions } from '@/shared/contexts/PermissionsContext'
import type { CustomerContract, ContractFilterOptions } from '../../../types'
import { useContractTranslations } from '../../hooks/useContractTranslations'

import { getColumnDefs, COLUMN_DEF_IDS, STORAGE_KEY } from './columns'
import type { ContractColumnDef } from './columns'
import { createColumnFilterFactory } from './column-filters'
import ContractActionsCell from './ContractActions'

const columnHelper = createColumnHelper<CustomerContract>()

/**
 * Maps frontend column IDs to backend filter parameter names.
 * Matches Symfony's CustomerContractsFormFilter field names.
 */
export const COLUMN_TO_BACKEND_FILTER: Record<string, string> = {
  // Text search columns
  customer_name:     'search_lastname',
  customer_phone:    'search_phone',
  customer_city:     'search_city',
  customer_postcode: 'postcode',
  // Status columns (select dropdowns)
  contract_status:   'state_id',
  install_status:    'install_state_id',
  admin_status:      'admin_status_id',
  opc_status:        'opc_status_id',
  time_status:       'time_state_id',
  // User columns (select dropdowns)
  sale1:             'sale_1_id',
  sale2:             'sale_2_id',
  telepro:           'telepro_id',
  assistant:         'assistant_id',
  creator:           'created_by_id',
  // Entity columns (select dropdowns)
  team:              'team_id',
  company:           'company_id',
  financial_partner: 'financial_partner_id',
  partner_layer:     'partner_layer_id',
  polluter:          'polluter_id',
  campaign:          'campaign_id',
  // Boolean columns (direct match)
  is_confirmed:      'is_confirmed',
  is_billable:       'is_billable',
  is_hold:           'is_hold',
  is_hold_quote:     'is_hold_quote',
  is_document:       'is_document',
  is_photo:          'is_photo',
  is_quality:        'is_quality',
  status:            'status',
  // Date column sub-filters (Symfony lines 374-395)
  opc_range_id:      'opc_range_id',
  sav_at_range_id:   'sav_at_range_id',
  // Date range filter (Symfony sidebar lines 3-77)
  date_from:         'date_from',
  date_to:           'date_to',
  date_type:         'date_type',
  date_null:         'date_null',
  // Customer column sub-filter (Symfony domoprime_status)
  domoprime_status:  'domoprime_status',
  // Domoprime sidebar filters (Symfony lines 78-116)
  energy_id:         'energy_id',
  sector_id:         'sector_id',
  class_id:          'class_id',
  product_id:        'product_id',
  zone_id:           'zone_id',
  quotation_is_signed:  'quotation_is_signed',
  document_is_signed:   'document_is_signed',
  surface_parcel_check: 'surface_parcel_check',
  // Sidebar text search filters
  sidebar_search:        'search_lastname',
  sidebar_phone:         'search_phone',
  sidebar_postcode:      'postcode',
  sidebar_city:          'search_city',
  // Sidebar text fields
  acces_1:               'acces_1',
  acces_2:               'acces_2',
  source:                'source',
  rapport_installation:  'rapport_installation',
  rapport_attribution:   'rapport_attribution',
  rapport_temps:         'rapport_temps',
  rapport_admin:         'rapport_admin',
  // Sidebar entity selects
  confirmateur_id:       'confirmateur_id',
  regie_callcenter:      'regie_callcenter',
  sidebar_financial_partner: 'financial_partner_id',
  installer_user_id:     'installer_user_id',
  sidebar_partner_layer: 'partner_layer_id',
  sidebar_creator:       'created_by_id',
  sidebar_company:       'company_id',
}

interface UseContractListStateParams {
  loading: boolean
  deleteContract: (id: number) => Promise<any>
  updateFilter: (key: string, value: any) => void
  clearFilters: () => void
  /** API-driven permitted field keys from backend meta.permitted_fields */
  permittedFields: Set<string>
  /** Server-populated filter dropdown options */
  filterOptions: ContractFilterOptions
  /** Sidebar filters read from URL search params (for persistence) */
  initialSidebarFilters?: Record<string, string>
}

export function useContractListState({ loading, deleteContract, updateFilter, clearFilters, permittedFields, filterOptions, initialSidebarFilters }: UseContractListStateParams) {
  const { hasCredential } = usePermissions()
  const t = useContractTranslations()

  // Build column definitions with current translations
  const columnDefs = useMemo(() => getColumnDefs(t), [t])

  // Filter columns by backend-provided permitted fields (single source of truth)
  const permittedColumns = useMemo<ContractColumnDef[]>(
    () => columnDefs.filter(col => {
      // Columns without permissionKey are always visible
      if (!col.permissionKey) return true
      // If permittedFields is empty (first load, before API responds), show all
      if (permittedFields.size === 0) return true
      // Otherwise, check against the backend-provided set
      return permittedFields.has(col.permissionKey)
    }),
    [columnDefs, permittedFields]
  )

  // States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedContractId, setSelectedContractId] = useState<number | null>(null)
  const [showFilters, setShowFilters] = useState(() => {
    // Auto-open sidebar if URL has persisted filters
    return !!initialSidebarFilters && Object.keys(initialSidebarFilters).length > 0
  })
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>(
    () => initialSidebarFilters ?? {}
  )

  // On mount: sync URL-persisted sidebar filters to the backend
  const hasHydratedRef = useRef(false)
  useEffect(() => {
    if (hasHydratedRef.current || !initialSidebarFilters || Object.keys(initialSidebarFilters).length === 0) return
    hasHydratedRef.current = true

    for (const [columnId, value] of Object.entries(initialSidebarFilters)) {
      const backendParam = COLUMN_TO_BACKEND_FILTER[columnId]
      if (backendParam && value) {
        updateFilter(backendParam, value)
      }
    }
  }, [initialSidebarFilters, updateFilter])

  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(() => {
    if (typeof window === 'undefined') return {}

    try {
      const saved = localStorage.getItem(STORAGE_KEY)

      if (saved) return JSON.parse(saved)
    } catch { /* incognito / quota exceeded / disabled */ }

    const defaults: Record<string, boolean> = {}

    COLUMN_DEF_IDS.forEach(id => { defaults[id] = true })

    return defaults
  })

  // Persist column visibility in event handler, not in effect
  const handleColumnVisibilityChange = useCallback((visibility: Record<string, boolean>) => {
    setColumnVisibility(visibility)

    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(visibility)) } catch { /* ignore */ }
  }, [])

  // Handlers
  const handleDelete = useCallback(async (id: number) => {
    if (!confirm(t.confirmDelete)) return

    try {
      await deleteContract(id)
    } catch (err: any) {
      alert(t.deleteError + err.message)
    }
  }, [deleteContract, t.confirmDelete, t.deleteError])

  const handleEdit = useCallback((id: number) => {
    setSelectedContractId(id)
    setIsEditModalOpen(true)
  }, [])

  const handleColumnFilterChange = useCallback((columnId: string, value: string) => {
    setColumnFilters(prev => {
      if (value === '' || value === null || value === undefined) {
        const { [columnId]: _, ...rest } = prev

        return rest
      }

      return { ...prev, [columnId]: value }
    })

    // Send to backend using the mapped parameter name
    const backendParam = COLUMN_TO_BACKEND_FILTER[columnId]

    if (backendParam) {
      updateFilter(backendParam, value || undefined)
    }
  }, [updateFilter])

  const handleClearAllFilters = useCallback(() => {
    // Clear all mapped backend filters
    for (const backendParam of Object.values(COLUMN_TO_BACKEND_FILTER)) {
      updateFilter(backendParam, undefined)
    }

    setColumnFilters({})
    clearFilters()
  }, [clearFilters, updateFilter])

  const handleToggleFilters = useCallback(() => {
    setShowFilters(prev => !prev)
  }, [])

  const handleSearch = useCallback((value: string) => {
    updateFilter('reference', value)
  }, [updateFilter])

  const handleCloseCreateModal = useCallback(() => {
    setIsCreateModalOpen(false)
  }, [])

  const handleCloseEditModal = useCallback(() => {
    setIsEditModalOpen(false)
    setSelectedContractId(null)
  }, [])

  // Column filter factory
  const createColumnFilter = useCallback(
    createColumnFilterFactory(columnFilters, handleColumnFilterChange, loading, filterOptions, t),
    [columnFilters, handleColumnFilterChange, loading, filterOptions, t]
  )

  // TanStack Column Definitions
  const columns = useMemo<ColumnDef<CustomerContract, any>[]>(() => {
    const idCol = columnHelper.accessor('id', {
      id: 'id',
      header: '# ID',
      cell: ({ row }) => <Typography className='font-semibold' color='primary'>{row.original.id}</Typography>
    })

    const dataCols = permittedColumns.map(def =>
      columnHelper.accessor(def.getValue, {
        id: def.id,
        header: def.label,
        cell: ({ row }) => def.renderCell(row.original)
      })
    )

    // Actions column still uses hasCredential (action-level, not field-level)
    const actionsCols = hasCredential([['superadmin', 'admin', 'contract_list_view_actions']]) ? [
      columnHelper.display({
        id: 'actions',
        header: t.colActions,
        cell: ({ row }) => (
          <ContractActionsCell
            contractId={row.original.id}
            reference={row.original.reference}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )
      })
    ] : []

    return [idCol, ...dataCols, ...actionsCols] as ColumnDef<CustomerContract, any>[]
  }, [permittedColumns, handleDelete, handleEdit, hasCredential, t.colActions])

  return {
    // State
    columns,
    permittedColumns,
    columnVisibility,
    columnFilters,
    showFilters,
    isCreateModalOpen,
    isEditModalOpen,
    selectedContractId,
    hasCredential,
    t,

    // Handlers
    handleColumnVisibilityChange,
    handleClearAllFilters,
    handleToggleFilters,
    handleSearch,
    handleEdit,
    handleDelete,
    handleCloseCreateModal,
    handleColumnFilterChange,
    handleCloseEditModal,
    setIsCreateModalOpen,
    createColumnFilter
  }
}
