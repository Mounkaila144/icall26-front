import { useMemo } from 'react'
import type { ReactNode } from 'react'

import TextField from '@mui/material/TextField'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Autocomplete from '@mui/material/Autocomplete'
import InputAdornment from '@mui/material/InputAdornment'
import type { SxProps, Theme } from '@mui/material/styles'

import type { ContractFilterOptions, FilterOption } from '../../../types'

// ── Text search columns (free-text input) ──
export const TEXT_SEARCH_COLUMNS = new Set([
  'customer_name', 'customer_phone', 'customer_city', 'customer_postcode'
])

// ── Boolean filter columns (YES/NO or Y/N selects) ──
export const BOOLEAN_FILTER_COLUMNS: Record<string, { yes: string; no: string }> = {
  is_confirmed:  { yes: 'YES', no: 'NO' },
  is_billable:   { yes: 'YES', no: 'NO' },
  is_hold:       { yes: 'YES', no: 'NO' },
  is_hold_quote: { yes: 'YES', no: 'NO' },
  is_document:   { yes: 'Y',   no: 'N' },
  is_photo:      { yes: 'Y',   no: 'N' },
  is_quality:    { yes: 'Y',   no: 'N' },
}

// ── Status filter columns → key in ContractFilterOptions ──
const STATUS_FILTER_MAP: Record<string, keyof ContractFilterOptions> = {
  contract_status: 'contract_statuses',
  install_status:  'install_statuses',
  admin_status:    'admin_statuses',
  opc_status:      'opc_statuses',
  time_status:     'time_statuses',
}

// ── Entity filter columns → key in ContractFilterOptions ──
const ENTITY_FILTER_MAP: Record<string, keyof ContractFilterOptions> = {
  sale1:              'users',
  sale2:              'users',
  telepro:            'users',
  assistant:          'users',
  creator:            'users',
  team:               'teams',
  company:            'companies',
  financial_partner:  'financial_partners',
  partner_layer:      'partner_layers',
  polluter:           'polluters',
  campaign:           'campaigns',
}

// ── ACTIVE/DELETE status filter ──
const STATUS_ACTIVE_DELETE = new Set(['status'])

// ── Shared compact styling ──
const COMPACT_INPUT_SX: SxProps<Theme> = {
  '& .MuiOutlinedInput-root': {
    fontSize: '0.8125rem',
    borderRadius: '6px',
    backgroundColor: 'var(--mui-palette-background-paper)',
    transition: 'all 0.2s ease',
    '& fieldset': {
      borderColor: 'var(--mui-palette-divider)',
      transition: 'border-color 0.2s ease',
    },
    '&:hover fieldset': {
      borderColor: 'var(--mui-palette-primary-light)',
    },
    '&.Mui-focused fieldset': {
      borderWidth: '1.5px',
    },
  },
  '& .MuiOutlinedInput-input': {
    padding: '4px 10px',
    height: '1.5em',
  },
}

const COMPACT_SELECT_SX: SxProps<Theme> = {
  '& .MuiOutlinedInput-root': {
    fontSize: '0.8125rem',
    borderRadius: '6px',
    backgroundColor: 'var(--mui-palette-background-paper)',
    transition: 'all 0.2s ease',
    '& fieldset': {
      borderColor: 'var(--mui-palette-divider)',
      transition: 'border-color 0.2s ease',
    },
    '&:hover fieldset': {
      borderColor: 'var(--mui-palette-primary-light)',
    },
    '&.Mui-focused fieldset': {
      borderWidth: '1.5px',
    },
  },
  '& .MuiSelect-select': {
    padding: '4px 32px 4px 10px !important',
    height: '1.5em',
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.8125rem',
  },
}

const COMPACT_AUTOCOMPLETE_SX: SxProps<Theme> = {
  '& .MuiOutlinedInput-root': {
    fontSize: '0.8125rem',
    borderRadius: '6px',
    padding: '2px 6px !important',
    backgroundColor: 'var(--mui-palette-background-paper)',
    transition: 'all 0.2s ease',
    '& fieldset': {
      borderColor: 'var(--mui-palette-divider)',
      transition: 'border-color 0.2s ease',
    },
    '&:hover fieldset': {
      borderColor: 'var(--mui-palette-primary-light)',
    },
    '&.Mui-focused fieldset': {
      borderWidth: '1.5px',
    },
    '& .MuiOutlinedInput-input': {
      padding: '2px 4px !important',
      height: '1.5em',
    },
  },
}

// ── Searchable Autocomplete filter (with built-in search bar) ──
function SearchableSelectFilter({
  value,
  items,
  onFilterChange,
  columnId,
  loading,
}: {
  value: string
  items: FilterOption[]
  onFilterChange: (columnId: string, value: string) => void
  columnId: string
  loading: boolean
}) {
  const selectedOption = useMemo(
    () => (value ? items.find(o => String(o.id) === value) ?? null : null),
    [value, items]
  )

  return (
    <Autocomplete<FilterOption, false, false, false>
      size='small'
      fullWidth
      value={selectedOption}
      onChange={(_, newValue) => onFilterChange(columnId, newValue ? String(newValue.id) : '')}
      options={items}
      getOptionLabel={option => option.name}
      isOptionEqualToValue={(option, val) => option.id === val.id}
      disabled={loading}
      sx={{ ...COMPACT_AUTOCOMPLETE_SX, minWidth: 130 }}
      slotProps={{
        paper: {
          sx: {
            '& .MuiAutocomplete-listbox': {
              maxHeight: 220,
              '& .MuiAutocomplete-option': {
                fontSize: '0.8125rem',
                padding: '4px 12px',
                minHeight: 'unset',
              },
            },
          },
        },
        popper: { placement: 'bottom-start' },
      }}
      renderInput={params => (
        <TextField
          {...params}
          placeholder='Tous'
          variant='outlined'
        />
      )}
    />
  )
}

export function createColumnFilterFactory(
  columnFilters: Record<string, string>,
  onFilterChange: (columnId: string, value: string) => void,
  loading: boolean,
  filterOptions: ContractFilterOptions
): (columnId: string) => ReactNode {
  return (columnId: string) => {
    const value = columnFilters[columnId] || ''

    // 1. Text search
    if (TEXT_SEARCH_COLUMNS.has(columnId)) {
      return (
        <TextField
          size='small'
          value={value}
          onChange={e => onFilterChange(columnId, e.target.value)}
          placeholder='Rechercher...'
          fullWidth
          variant='outlined'
          disabled={loading}
          sx={{ ...COMPACT_INPUT_SX, minWidth: 120 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position='start' sx={{ mr: 0.5 }}>
                  <i className='ri-search-line' style={{ fontSize: '0.875rem', opacity: 0.5 }} />
                </InputAdornment>
              ),
            },
          }}
        />
      )
    }

    // 2. Boolean filters (YES/NO, Y/N) — few options, no search needed
    if (columnId in BOOLEAN_FILTER_COLUMNS) {
      const { yes, no } = BOOLEAN_FILTER_COLUMNS[columnId]

      return (
        <FormControl size='small' fullWidth sx={{ ...COMPACT_SELECT_SX, minWidth: 90 }}>
          <Select
            value={value}
            onChange={e => onFilterChange(columnId, e.target.value)}
            displayEmpty
            disabled={loading}
            variant='outlined'
          >
            <MenuItem value='' sx={{ fontSize: '0.8125rem' }}>Tous</MenuItem>
            <MenuItem value={yes} sx={{ fontSize: '0.8125rem' }}>Oui</MenuItem>
            <MenuItem value={no} sx={{ fontSize: '0.8125rem' }}>Non</MenuItem>
          </Select>
        </FormControl>
      )
    }

    // 3. ACTIVE/DELETE status — few options, no search needed
    if (STATUS_ACTIVE_DELETE.has(columnId)) {
      return (
        <FormControl size='small' fullWidth sx={{ ...COMPACT_SELECT_SX, minWidth: 90 }}>
          <Select
            value={value}
            onChange={e => onFilterChange(columnId, e.target.value)}
            displayEmpty
            disabled={loading}
            variant='outlined'
          >
            <MenuItem value='' sx={{ fontSize: '0.8125rem' }}>Tous</MenuItem>
            <MenuItem value='ACTIVE' sx={{ fontSize: '0.8125rem' }}>Actif</MenuItem>
            <MenuItem value='DELETE' sx={{ fontSize: '0.8125rem' }}>Supprimé</MenuItem>
          </Select>
        </FormControl>
      )
    }

    // 4. Status dropdown (server-populated) — searchable
    if (columnId in STATUS_FILTER_MAP) {
      const optionsKey = STATUS_FILTER_MAP[columnId]
      const items: FilterOption[] = filterOptions[optionsKey] as FilterOption[] || []

      return (
        <SearchableSelectFilter
          value={value}
          items={items}
          onFilterChange={onFilterChange}
          columnId={columnId}
          loading={loading}
        />
      )
    }

    // 5. Entity dropdown (users, teams, partners, etc.) — searchable
    if (columnId in ENTITY_FILTER_MAP) {
      const optionsKey = ENTITY_FILTER_MAP[columnId]
      const items: FilterOption[] = filterOptions[optionsKey] as FilterOption[] || []

      return (
        <SearchableSelectFilter
          value={value}
          items={items}
          onFilterChange={onFilterChange}
          columnId={columnId}
          loading={loading}
        />
      )
    }

    return null
  }
}
