'use client'

import { useState, useCallback } from 'react'

// MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import CircularProgress from '@mui/material/CircularProgress'
import CardHeader from '@mui/material/CardHeader'
import Divider from '@mui/material/Divider'

// Components
import ColumnVisibilityMenu from './ColumnVisibilityMenu'

// Types
import type { DataTableAction, ColumnConfig, FilterConfig } from './types'

interface TableToolbarProps {
  searchPlaceholder?: string
  onSearch?: (value: string) => void
  onRefresh?: () => void
  loading?: boolean
  actions?: DataTableAction[]
  availableColumns?: ColumnConfig[]
  columnVisibility?: Record<string, boolean>
  onColumnVisibilityChange?: (visibility: Record<string, boolean>) => void
  filters?: FilterConfig[]
  columnFilters?: Record<string, any>
  onColumnFilterChange?: (columnId: string, value: any) => void
  title?: string
}

export function TableToolbar({
  searchPlaceholder = 'Search...',
  onSearch,
  onRefresh,
  loading = false,
  actions = [],
  availableColumns,
  columnVisibility,
  onColumnVisibilityChange,
  filters = [],
  columnFilters,
  onColumnFilterChange,
  title
}: TableToolbarProps) {
  const [searchValue, setSearchValue] = useState('')
  const [columnMenuAnchor, setColumnMenuAnchor] = useState<null | HTMLElement>(null)

  // Handle search with debounce
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchValue(value)
      if (onSearch) {
        // Debounce is handled in the parent component
        onSearch(value)
      }
    },
    [onSearch]
  )

  const handleOpenColumnMenu = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setColumnMenuAnchor(event.currentTarget)
  }, [])

  const handleCloseColumnMenu = useCallback(() => {
    setColumnMenuAnchor(null)
  }, [])

  return (
    <>
      {title && (
        <>
          <CardHeader title={title} className='pbe-4' />
          <Divider />
        </>
      )}

      <div className='flex justify-between gap-4 p-5 flex-col items-stretch sm:flex-row sm:items-center'>
        {/* Left side - Action buttons */}
        <div className='flex flex-col sm:flex-row gap-2 w-full sm:w-auto'>
          {actions
            .filter(action => !action.hidden)
            .map((action, index) => (
              <Button
                key={index}
                color={action.color || 'primary'}
                variant={action.variant || 'contained'}
                startIcon={<i className={action.icon} />}
                onClick={action.onClick}
                disabled={action.disabled || loading}
                className='w-full sm:w-auto'
              >
                {action.label}
              </Button>
            ))}

          {/* Column visibility button - hide on mobile */}
          {availableColumns && (
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
              <Button
                color='secondary'
                variant='outlined'
                startIcon={<i className='ri-settings-3-line' />}
                onClick={handleOpenColumnMenu}
                className='w-full sm:w-auto'
              >
                Columns
              </Button>
            </Box>
          )}
        </div>

        {/* Right side - Search and Refresh */}
        <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full sm:w-auto'>
          {onSearch && (
            <TextField
              value={searchValue}
              onChange={e => handleSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              size='small'
              className='w-full sm:w-auto'
              disabled={loading}
            />
          )}
          {onRefresh && (
            <Button
              variant='contained'
              startIcon={loading ? <CircularProgress size={20} color='inherit' /> : <i className='ri-refresh-line' />}
              onClick={onRefresh}
              disabled={loading}
              className='w-full sm:w-auto'
            >
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
          )}
        </div>
      </div>

      {/* Column Visibility Menu */}
      {availableColumns && columnVisibility && onColumnVisibilityChange && (
        <ColumnVisibilityMenu
          anchor={columnMenuAnchor}
          onClose={handleCloseColumnMenu}
          columns={availableColumns}
          visibility={columnVisibility}
          onVisibilityChange={onColumnVisibilityChange}
        />
      )}
    </>
  )
}

export default TableToolbar
