'use client'

import Box from '@mui/material/Box'

import { useContracts } from '../hooks/useContracts'
import { useFilterOptions } from '../hooks/useFilterOptions'
import { DataTable } from '@/components/shared/DataTable'
import type { DataTableConfig } from '@/components/shared/DataTable'
import type { CustomerContract } from '../../types'

import CreateContractModal from './CreateContractModal'
import EditContractModal from './EditContractModal'
import ContractMobileCard from './contracts-list/ContractMobileCard'
import { useContractListState } from './contracts-list/useContractListState'

export default function ContractsList1() {
  const {
    contracts, loading, error, currentPage, totalPages, total, perPage,
    permittedFields,
    setCurrentPage, setPerPage, updateFilter, clearFilters,
    deleteContract, createContract, updateContract, getContract
  } = useContracts()

  const { filterOptions } = useFilterOptions()

  const {
    columns, permittedColumns, columnVisibility, columnFilters, showFilters,
    isCreateModalOpen, isEditModalOpen, selectedContractId, hasCredential, t,
    handleColumnVisibilityChange, handleClearAllFilters, handleToggleFilters,
    handleSearch, handleEdit, handleDelete, handleCloseCreateModal,
    handleCloseEditModal, setIsCreateModalOpen, createColumnFilter
  } = useContractListState({ loading, deleteContract, updateFilter, clearFilters, permittedFields, filterOptions })

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
    searchPlaceholder: t.searchPlaceholder,
    emptyMessage: t.emptyMessage,
    rowsPerPageOptions: [10, 15, 25, 50],
    showColumnFilters: showFilters,
    onToggleColumnFilters: handleToggleFilters,
    columnFilters,
    onClearAllFilters: handleClearAllFilters,
    createColumnFilter,
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

      <DataTable {...tableConfig} />

      <CreateContractModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onCreate={createContract}
      />

      <EditContractModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onUpdate={updateContract}
        contractId={selectedContractId}
        onFetchContract={getContract}
      />
    </>
  )
}
