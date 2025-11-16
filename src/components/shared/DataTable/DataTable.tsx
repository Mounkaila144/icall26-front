'use client'

import { useState, useMemo, useCallback } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  flexRender
} from '@tanstack/react-table'

// MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import TablePagination from '@mui/material/TablePagination'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'

// Components
import TableToolbar from './TableToolbar'
import MobileCardView from './MobileCardView'

// Types
import type { DataTableConfig } from './types'

// Styles
import tableStyles from '@core/styles/table.module.css'

/**
 * Generic DataTable Component
 * Fully reusable across all tables in the application
 */
export function DataTable<TData extends Record<string, any>>(props: DataTableConfig<TData>) {
  const {
    columns,
    data,
    loading = false,
    pagination,
    onPageChange,
    onPageSizeChange,
    onRefresh,
    searchPlaceholder = 'Search...',
    onSearch,
    mobileCard,
    availableColumns,
    columnVisibility: externalColumnVisibility,
    onColumnVisibilityChange,
    actions = [],
    showColumnFilters = false,
    onToggleColumnFilters,
    columnFilters,
    onColumnFilterChange,
    onClearAllFilters,
    createColumnFilter,
    emptyMessage = 'No data available',
    rowsPerPageOptions = [10, 25, 50, 100]
  } = props

  // Local states
  const [rowSelection, setRowSelection] = useState({})
  const [localColumnVisibility, setLocalColumnVisibility] = useState<Record<string, boolean>>(
    externalColumnVisibility || {}
  )

  // Use external or local column visibility
  const columnVisibility = externalColumnVisibility || localColumnVisibility

  const handleColumnVisibilityChange = useCallback(
    (newVisibility: Record<string, boolean>) => {
      if (onColumnVisibilityChange) {
        onColumnVisibilityChange(newVisibility)
      } else {
        setLocalColumnVisibility(newVisibility)
      }
    },
    [onColumnVisibilityChange]
  )

  // Filter visible columns
  const visibleColumns = useMemo(() => {
    return columns.filter(column => {
      const id = column.id as string

      // Always show selection and action columns
      if (id === 'select' || id === 'action' || id === 'actions') return true

      // Check visibility
      return columnVisibility[id] !== false
    })
  }, [columns, columnVisibility])

  // Initialize table
  const table = useReactTable({
    data,
    columns: visibleColumns,
    state: {
      rowSelection
    },
    pageCount: pagination?.last_page || 1,
    manualPagination: true,
    manualSorting: true,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel()
  })

  return (
    <Card>
      {/* Toolbar */}
      <TableToolbar
        searchPlaceholder={searchPlaceholder}
        onSearch={onSearch}
        onRefresh={onRefresh}
        loading={loading}
        actions={actions}
        availableColumns={availableColumns}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={handleColumnVisibilityChange}
        showColumnFilters={showColumnFilters}
        onToggleColumnFilters={onToggleColumnFilters}
        columnFilters={columnFilters}
        onClearAllFilters={onClearAllFilters}
      />

      {/* Mobile Card View */}
      {mobileCard && (
        <Box sx={{ display: { xs: 'block', md: 'none' } }} className='p-4'>
          <MobileCardView
            data={data}
            loading={loading}
            emptyMessage={emptyMessage}
            config={mobileCard}
          />
        </Box>
      )}

      {/* Desktop Table View */}
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <div className='overflow-x-auto'>
          <table className={tableStyles.table}>
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <>
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th key={header.id}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                  {showColumnFilters && createColumnFilter && (
                    <tr key={`${headerGroup.id}-filters`} className='bg-backgroundPaper'>
                      {headerGroup.headers.map(header => (
                        <th key={`${header.id}-filter`} className='p-2'>
                          {header.id === 'select' || header.id === 'action' || header.id === 'actions' || header.id === 'id' ? null : (
                            <Box sx={{ py: 1 }}>{createColumnFilter(header.id)}</Box>
                          )}
                        </th>
                      ))}
                    </tr>
                  )}
                </>
              ))}
            </thead>
            {loading ? (
              <tbody>
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                    <Box className='flex justify-center items-center' sx={{ py: 10 }}>
                      <CircularProgress />
                    </Box>
                  </td>
                </tr>
              </tbody>
            ) : data.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                    <Box sx={{ py: 6 }}>
                      <Typography>{emptyMessage}</Typography>
                    </Box>
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {table.getRowModel().rows.map(row => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>
      </Box>

      {/* Pagination */}
      {pagination && (
        <TablePagination
          rowsPerPageOptions={rowsPerPageOptions}
          component='div'
          className='border-bs'
          count={pagination.total}
          rowsPerPage={pagination.per_page}
          page={pagination.current_page - 1}
          SelectProps={{
            inputProps: { 'aria-label': 'rows per page' },
            disabled: loading
          }}
          slotProps={{
            actions: {
              nextButton: {
                disabled: loading || pagination.current_page >= pagination.last_page
              },
              previousButton: {
                disabled: loading || pagination.current_page <= 1
              }
            }
          }}
          onPageChange={(_, page) => {
            if (!loading && onPageChange) {
              onPageChange(page + 1)
            }
          }}
          onRowsPerPageChange={e => {
            if (!loading && onPageSizeChange) {
              onPageSizeChange(Number(e.target.value))
            }
          }}
        />
      )}
    </Card>
  )
}

export default DataTable
