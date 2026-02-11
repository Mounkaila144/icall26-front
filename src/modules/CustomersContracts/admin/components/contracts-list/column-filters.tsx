import type { ReactNode } from 'react'

import TextField from '@mui/material/TextField'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'

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
          sx={{ minWidth: 120 }}
        />
      )
    }

    // 2. Boolean filters (YES/NO, Y/N)
    if (columnId in BOOLEAN_FILTER_COLUMNS) {
      const { yes, no } = BOOLEAN_FILTER_COLUMNS[columnId]

      return (
        <FormControl size='small' fullWidth sx={{ minWidth: 100 }}>
          <Select value={value} onChange={e => onFilterChange(columnId, e.target.value)} displayEmpty disabled={loading}>
            <MenuItem value=''>Tous</MenuItem>
            <MenuItem value={yes}>Oui</MenuItem>
            <MenuItem value={no}>Non</MenuItem>
          </Select>
        </FormControl>
      )
    }

    // 3. ACTIVE/DELETE status
    if (STATUS_ACTIVE_DELETE.has(columnId)) {
      return (
        <FormControl size='small' fullWidth sx={{ minWidth: 100 }}>
          <Select value={value} onChange={e => onFilterChange(columnId, e.target.value)} displayEmpty disabled={loading}>
            <MenuItem value=''>Tous</MenuItem>
            <MenuItem value='ACTIVE'>Actif</MenuItem>
            <MenuItem value='DELETE'>Supprimé</MenuItem>
          </Select>
        </FormControl>
      )
    }

    // 4. Status dropdown (server-populated)
    if (columnId in STATUS_FILTER_MAP) {
      const optionsKey = STATUS_FILTER_MAP[columnId]
      const items: FilterOption[] = filterOptions[optionsKey] as FilterOption[] || []

      return (
        <FormControl size='small' fullWidth sx={{ minWidth: 120 }}>
          <Select value={value} onChange={e => onFilterChange(columnId, e.target.value)} displayEmpty disabled={loading}>
            <MenuItem value=''>Tous</MenuItem>
            {items.map(item => (
              <MenuItem key={item.id} value={String(item.id)}>{item.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      )
    }

    // 5. Entity dropdown (users, teams, partners, etc. — server-populated)
    if (columnId in ENTITY_FILTER_MAP) {
      const optionsKey = ENTITY_FILTER_MAP[columnId]
      const items: FilterOption[] = filterOptions[optionsKey] as FilterOption[] || []

      return (
        <FormControl size='small' fullWidth sx={{ minWidth: 120 }}>
          <Select value={value} onChange={e => onFilterChange(columnId, e.target.value)} displayEmpty disabled={loading}>
            <MenuItem value=''>Tous</MenuItem>
            {items.map(item => (
              <MenuItem key={item.id} value={String(item.id)}>{item.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      )
    }

    return null
  }
}
