'use client'

import { useMemo } from 'react'
import { useSearchParams } from 'next/navigation'

import Box from '@mui/material/Box'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'

import { useContracts } from '../hooks/useContracts'
import { useFilterOptions } from '../hooks/useFilterOptions'
import { readSidebarFiltersFromParams } from '../hooks/useSidebarFilterParams'
import { DataTable } from '@/components/shared/DataTable'
import type { DataTableConfig } from '@/components/shared/DataTable'
import type { CustomerContract } from '../../types'

import CreateContractWizard from './contract-wizard/CreateContractWizard'
import EditContractDialog from './contract-edit/EditContractDialog'
import ContractMobileCard from './contracts-list/ContractMobileCard'
import ContractFilterPanel from './contracts-list/ContractFilterPanel'
import SendSmsDialog from './dialogs/SendSmsDialog'
import SendEmailDialog from './dialogs/SendEmailDialog'
import ContractCommentDialog from './dialogs/ContractCommentDialog'
import { useContractListState, COLUMN_TO_BACKEND_FILTER } from './contracts-list/useContractListState'

export default function ContractsList1() {
  const searchParams = useSearchParams()

  // Read sidebar filters from URL once (for persistence across navigation)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const initialSidebarFilters = useMemo(() => readSidebarFiltersFromParams(searchParams), [])

  // Convert sidebar filter keys to backend param names so the FIRST API call
  // already includes persisted filters (avoids race condition with hydration effect)
  const initialBackendFilters = useMemo(() => {
    const mapped: Record<string, any> = {}
    for (const [key, value] of Object.entries(initialSidebarFilters)) {
      const backendKey = COLUMN_TO_BACKEND_FILTER[key]
      if (backendKey && value) mapped[backendKey] = value
    }
    return mapped
  }, [initialSidebarFilters])

  const {
    contracts, loading, error, currentPage, totalPages, total, perPage,
    permittedFields,
    setCurrentPage, setPerPage, updateFilter, clearFilters,
    deleteContract, createContract, updateContract, getContract, refreshContracts
  } = useContracts(initialBackendFilters)

  const { filterOptions } = useFilterOptions()

  const {
    columns, permittedColumns, columnVisibility, columnFilters, showFilters,
    isCreateModalOpen, isEditModalOpen, selectedContractId, hasCredential, t,
    smsDialogContractId, emailDialogContractId, commentDialogContractId,
    notification, showNotification, handleCloseNotification,
    handleColumnVisibilityChange, handleClearAllFilters, handleToggleFilters,
    handleSearch, handleEdit, handleDelete, handleColumnFilterChange,
    handleCloseCreateModal, handleCloseEditModal, setIsCreateModalOpen, createColumnFilter,
    handleCloseSmsDialog, handleCloseEmailDialog, handleCloseCommentDialog,
  } = useContractListState({ loading, deleteContract, updateContract, refreshContracts, updateFilter, clearFilters, permittedFields, filterOptions, initialSidebarFilters })

  const tableConfig: DataTableConfig<CustomerContract> = {
    columns,
    data: Array.isArray(contracts) ? contracts : [],
    loading,
    pagination: { current_page: currentPage, last_page: totalPages, per_page: perPage, total },
    availableColumns: permittedColumns,
    columnVisibility,
    onColumnVisibilityChange: handleColumnVisibilityChange,
    onPageChange: setCurrentPage,
    onPageSizeChange: setPerPage,
    onSearch: handleSearch,
    onRefresh: () => window.location.reload(),
    onRowDoubleClick: (contract) => handleEdit(contract.id),
    searchPlaceholder: t.searchPlaceholder,
    emptyMessage: t.emptyMessage,
    rowsPerPageOptions: [10, 15, 25, 50],
    showColumnFilters: showFilters,
    onToggleColumnFilters: handleToggleFilters,
    columnFilters,
    onClearAllFilters: handleClearAllFilters,
    createColumnFilter,
    stickyLeft: ['id'],
    stickyRight: ['actions'],
    actions: hasCredential([['superadmin', 'admin', 'api2_user_customer_contract_new']]) ? [
      { label: t.newContract, icon: 'ri-add-line', color: 'primary', onClick: () => setIsCreateModalOpen(true) }
    ] : [],
    mobileCard: {
      renderCard: contract => (
        <ContractMobileCard
          contract={contract}
          hasCredential={hasCredential}
          permittedFields={permittedFields}
          onEdit={handleEdit}
          onDelete={handleDelete}
          t={t}
        />
      )
    }
  }

  return (
    <>
      {error ? (
        <Box sx={{ background: '#fee', color: '#c33', padding: 2, borderRadius: 2, marginBottom: 2, border: '1px solid #fcc' }}>
          {error}
        </Box>
      ) : null}

      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
        {showFilters && (
          <ContractFilterPanel
            columnFilters={columnFilters}
            onFilterChange={handleColumnFilterChange}
            loading={loading}
            filterOptions={filterOptions}
            t={t}
          />
        )}

        <Box sx={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
          <DataTable {...tableConfig} />
        </Box>
      </Box>

      <CreateContractWizard
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onCreate={createContract}
      />

      <EditContractDialog
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onUpdate={updateContract}
        contractId={selectedContractId}
        onFetchContract={getContract}
      />

      <SendSmsDialog
        open={smsDialogContractId !== null}
        contractId={smsDialogContractId}
        onClose={handleCloseSmsDialog}
        onSuccess={refreshContracts}
        showNotification={showNotification}
        t={t}
      />

      <SendEmailDialog
        open={emailDialogContractId !== null}
        contractId={emailDialogContractId}
        onClose={handleCloseEmailDialog}
        onSuccess={refreshContracts}
        showNotification={showNotification}
        t={t}
      />

      <ContractCommentDialog
        open={commentDialogContractId !== null}
        contractId={commentDialogContractId}
        onClose={handleCloseCommentDialog}
        onSuccess={refreshContracts}
        showNotification={showNotification}
        t={t}
      />

      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          variant='filled'
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  )
}
