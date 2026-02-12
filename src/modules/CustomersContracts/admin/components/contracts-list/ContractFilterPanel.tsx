import { useState, useMemo, useCallback } from 'react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Autocomplete from '@mui/material/Autocomplete'
import Typography from '@mui/material/Typography'
import InputAdornment from '@mui/material/InputAdornment'
import type { SxProps, Theme } from '@mui/material/styles'

import type { ContractFilterOptions, FilterOption } from '../../../types'
import type { ContractTranslations } from '../../hooks/useContractTranslations'
import { SIDEBAR_KEYS, useSidebarFilterParams } from '../../hooks/useSidebarFilterParams'

// ── Sidebar container ──
const SIDEBAR_SX: SxProps<Theme> = {
  width: 250,
  minWidth: 250,
  flexShrink: 0,
  alignSelf: 'flex-start',
  borderRadius: '14px',
  background: 'linear-gradient(180deg, rgba(59,130,246,0.05) 0%, rgba(99,102,241,0.03) 100%)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(59,130,246,0.12)',
  boxShadow: '0 8px 32px rgba(59,130,246,0.08), 0 2px 8px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.5)',
  overflow: 'hidden',
  overflowY: 'auto',
  maxHeight: 'calc(100vh - 120px)',
  position: 'sticky',
  top: 80,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: '3px',
    background: 'linear-gradient(180deg, rgba(59,130,246,0.6), rgba(99,102,241,0.4), rgba(59,130,246,0.2))',
  },
  '&::-webkit-scrollbar': { width: 4 },
  '&::-webkit-scrollbar-thumb': { background: 'rgba(59,130,246,0.2)', borderRadius: 2 },
  '[data-mui-color-scheme="dark"] &': {
    background: 'linear-gradient(180deg, rgba(30,41,59,0.7) 0%, rgba(15,23,42,0.5) 100%)',
    border: '1px solid rgba(99,102,241,0.15)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.04)',
  },
}

// ── Row ──
const ROW_SX: SxProps<Theme> = {
  px: 1.5,
  py: 0.75,
  borderBottom: '1px solid rgba(59,130,246,0.06)',
  transition: 'background 0.15s ease',
  '&:hover': { background: 'rgba(59,130,246,0.03)' },
  '&:last-child': { borderBottom: 'none' },
  '[data-mui-color-scheme="dark"] &': {
    borderBottom: '1px solid rgba(99,102,241,0.08)',
    '&:hover': { background: 'rgba(99,102,241,0.05)' },
  },
}

// ── Label ──
const LABEL_SX = {
  fontSize: '0.65rem',
  fontWeight: 700,
  color: 'rgba(59,130,246,0.7)',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.06em',
  mb: 0.3,
  display: 'flex',
  alignItems: 'center',
  gap: 0.5,
}

// ── Section header ──
const SECTION_SX = {
  px: 1.5,
  py: 0.6,
  fontSize: '0.65rem',
  fontWeight: 800,
  color: 'rgba(59,130,246,0.85)',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.1em',
  background: 'rgba(59,130,246,0.04)',
  borderBottom: '1px solid rgba(59,130,246,0.08)',
  display: 'flex',
  alignItems: 'center',
  gap: 0.75,
  '[data-mui-color-scheme="dark"] &': {
    background: 'rgba(99,102,241,0.06)',
    borderBottom: '1px solid rgba(99,102,241,0.10)',
  },
}

// ── Input 3D inset ──
const FIELD_SX: SxProps<Theme> = {
  '& .MuiOutlinedInput-root': {
    fontSize: '0.78rem',
    borderRadius: '8px',
    backgroundColor: 'rgba(255,255,255,0.7)',
    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)',
    transition: 'all 0.2s ease',
    '& fieldset': { borderColor: 'rgba(59,130,246,0.10)' },
    '&:hover fieldset': { borderColor: 'rgba(59,130,246,0.25)' },
    '&.Mui-focused': {
      boxShadow: 'inset 0 1px 3px rgba(59,130,246,0.08), 0 0 0 2px rgba(59,130,246,0.10)',
      '& fieldset': { borderWidth: '1.5px', borderColor: 'rgba(59,130,246,0.45)' },
    },
  },
  '& .MuiOutlinedInput-input': { padding: '4px 8px', height: '1.4em' },
  '[data-mui-color-scheme="dark"] & .MuiOutlinedInput-root': {
    backgroundColor: 'rgba(15,23,42,0.5)',
    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.15)',
  },
}

const SELECT_SX: SxProps<Theme> = {
  '& .MuiOutlinedInput-root': {
    fontSize: '0.78rem',
    borderRadius: '8px',
    backgroundColor: 'rgba(255,255,255,0.7)',
    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)',
    transition: 'all 0.2s ease',
    '& fieldset': { borderColor: 'rgba(59,130,246,0.10)' },
    '&:hover fieldset': { borderColor: 'rgba(59,130,246,0.25)' },
    '&.Mui-focused': {
      boxShadow: 'inset 0 1px 3px rgba(59,130,246,0.08), 0 0 0 2px rgba(59,130,246,0.10)',
      '& fieldset': { borderWidth: '1.5px', borderColor: 'rgba(59,130,246,0.45)' },
    },
  },
  '& .MuiSelect-select': {
    padding: '4px 28px 4px 8px !important',
    height: '1.4em',
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.78rem',
  },
  '[data-mui-color-scheme="dark"] & .MuiOutlinedInput-root': {
    backgroundColor: 'rgba(15,23,42,0.5)',
    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.15)',
  },
}

const AUTOCOMPLETE_SX: SxProps<Theme> = {
  '& .MuiOutlinedInput-root': {
    fontSize: '0.78rem',
    borderRadius: '8px',
    padding: '1px 6px !important',
    backgroundColor: 'rgba(255,255,255,0.7)',
    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)',
    transition: 'all 0.2s ease',
    '& fieldset': { borderColor: 'rgba(59,130,246,0.10)' },
    '&:hover fieldset': { borderColor: 'rgba(59,130,246,0.25)' },
    '&.Mui-focused': {
      boxShadow: 'inset 0 1px 3px rgba(59,130,246,0.08), 0 0 0 2px rgba(59,130,246,0.10)',
      '& fieldset': { borderWidth: '1.5px', borderColor: 'rgba(59,130,246,0.45)' },
    },
    '& .MuiOutlinedInput-input': { padding: '2px 4px !important', height: '1.4em' },
  },
  '[data-mui-color-scheme="dark"] & .MuiOutlinedInput-root': {
    backgroundColor: 'rgba(15,23,42,0.5)',
    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.15)',
  },
}

// ── Date type chip ──
const chipBase = {
  px: 1,
  py: 0.25,
  borderRadius: '14px',
  fontSize: '0.62rem',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
  userSelect: 'none' as const,
  border: '1px solid',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 0.4,
}

const CHIP_ACTIVE_SX: SxProps<Theme> = {
  ...chipBase,
  background: 'linear-gradient(135deg, rgba(59,130,246,0.9), rgba(99,102,241,0.85))',
  color: '#fff',
  borderColor: 'transparent',
  boxShadow: '0 2px 6px rgba(59,130,246,0.30), inset 0 1px 0 rgba(255,255,255,0.2)',
}

const CHIP_INACTIVE_SX: SxProps<Theme> = {
  ...chipBase,
  background: 'rgba(255,255,255,0.5)',
  color: 'text.secondary',
  borderColor: 'rgba(59,130,246,0.12)',
  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
  '&:hover': { background: 'rgba(59,130,246,0.06)', borderColor: 'rgba(59,130,246,0.25)' },
  '[data-mui-color-scheme="dark"] &': {
    background: 'rgba(30,41,59,0.5)',
    borderColor: 'rgba(99,102,241,0.12)',
    '&:hover': { background: 'rgba(99,102,241,0.10)' },
  },
}

const CHIP_NULL_ACTIVE_SX: SxProps<Theme> = {
  ...chipBase,
  background: 'linear-gradient(135deg, rgba(239,68,68,0.85), rgba(220,38,38,0.80))',
  color: '#fff',
  borderColor: 'transparent',
  boxShadow: '0 2px 6px rgba(239,68,68,0.25), inset 0 1px 0 rgba(255,255,255,0.2)',
}

const DROPDOWN_PAPER_SX = {
  borderRadius: '8px',
  boxShadow: '0 8px 24px rgba(59,130,246,0.10), 0 2px 8px rgba(0,0,0,0.06)',
  border: '1px solid rgba(59,130,246,0.08)',
}

// ── Date type checkboxes (match Symfony sidebar) ──
const DATE_TYPES = [
  { value: 'created_at', labelKey: 'filterDateCreated' as const, icon: 'ri-add-circle-line' },
  { value: 'opened_at', labelKey: 'filterDateInstall' as const, icon: 'ri-tools-line' },
  { value: 'opc_at', labelKey: 'filterDateAcceptation' as const, icon: 'ri-checkbox-circle-line' },
  { value: 'quoted_at', labelKey: 'filterDateSignDevis' as const, icon: 'ri-draft-line' },
]

// ── Searchable Autocomplete ──
function PanelAutocomplete({
  value, items, onChange, loading, placeholder,
}: {
  value: string
  items: FilterOption[]
  onChange: (value: string) => void
  loading: boolean
  placeholder: string
}) {
  const selected = useMemo(
    () => (value ? items.find(o => String(o.id) === value) ?? null : null),
    [value, items]
  )

  return (
    <Autocomplete<FilterOption, false, false, false>
      size='small'
      fullWidth
      value={selected}
      onChange={(_, v) => onChange(v ? String(v.id) : '')}
      options={items}
      getOptionLabel={o => o.name}
      isOptionEqualToValue={(a, b) => a.id === b.id}
      disabled={loading}
      sx={AUTOCOMPLETE_SX}
      slotProps={{
        paper: {
          sx: {
            ...DROPDOWN_PAPER_SX,
            '& .MuiAutocomplete-listbox': {
              maxHeight: 220,
              '& .MuiAutocomplete-option': { fontSize: '0.78rem', padding: '4px 10px', minHeight: 'unset' },
            },
          },
        },
        popper: { placement: 'bottom-start' },
      }}
      renderInput={params => <TextField {...params} placeholder={placeholder} variant='outlined' />}
    />
  )
}

// ── Simple Select ──
function PanelSelect({
  value, items, onChange, loading, placeholder, withNull,
}: {
  value: string
  items: FilterOption[]
  onChange: (value: string) => void
  loading: boolean
  placeholder: string
  withNull?: boolean
}) {
  return (
    <FormControl size='small' fullWidth sx={SELECT_SX}>
      <Select
        value={value}
        onChange={e => onChange(e.target.value)}
        displayEmpty
        disabled={loading}
        variant='outlined'
        MenuProps={{ slotProps: { paper: { sx: DROPDOWN_PAPER_SX } } }}
      >
        <MenuItem value='' sx={{ fontSize: '0.78rem' }}>{placeholder}</MenuItem>
        {withNull && <MenuItem value='IS_NULL' sx={{ fontSize: '0.78rem' }}>----</MenuItem>}
        {items.map(item => (
          <MenuItem key={item.id} value={String(item.id)} sx={{ fontSize: '0.78rem' }}>{item.name}</MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

// ── Text input ──
function PanelTextInput({
  value, onChange, loading, placeholder, icon,
}: {
  value: string
  onChange: (value: string) => void
  loading: boolean
  placeholder: string
  icon?: string
}) {
  return (
    <TextField
      size='small'
      fullWidth
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={loading}
      variant='outlined'
      sx={FIELD_SX}
      slotProps={icon ? {
        input: {
          startAdornment: (
            <InputAdornment position='start' sx={{ mr: 0.3 }}>
              <i className={icon} style={{ fontSize: '0.75rem', opacity: 0.5 }} />
            </InputAdornment>
          ),
        },
      } : undefined}
    />
  )
}

// ── Section header component ──
function Section({ icon, label }: { icon: string; label: string }) {
  return (
    <Typography sx={SECTION_SX}>
      <i className={icon} style={{ fontSize: '0.8rem' }} />
      {label}
    </Typography>
  )
}

// ── Filter row component ──
function FilterRow({ icon, label, children }: { icon: string; label: string; children: React.ReactNode }) {
  return (
    <Box sx={ROW_SX}>
      <Typography sx={LABEL_SX}>
        <i className={icon} style={{ fontSize: '0.6rem' }} />
        {label}
      </Typography>
      {children}
    </Box>
  )
}

interface ContractFilterPanelProps {
  columnFilters: Record<string, string>
  onFilterChange: (columnId: string, value: string) => void
  loading: boolean
  filterOptions: ContractFilterOptions
  t: ContractTranslations
}

export default function ContractFilterPanel({
  columnFilters, onFilterChange, loading, filterOptions, t,
}: ContractFilterPanelProps) {
  const { writeToUrl, clearUrl } = useSidebarFilterParams()

  // ── Local buffered state: inputs write here, API is only called on "Apply" ──
  const [localFilters, setLocalFilters] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    for (const key of SIDEBAR_KEYS) {
      if (columnFilters[key]) init[key] = columnFilters[key]
    }
    return init
  })

  const f = (key: string) => localFilters[key] || ''

  const setLocal = useCallback((key: string, value: string) => {
    setLocalFilters(prev => {
      if (!value) {
        const { [key]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [key]: value }
    })
  }, [])

  // Date type multi-select toggle (writes to local state only)
  const dateTypeRaw = localFilters['date_type'] || ''
  const activeDateTypes = new Set(dateTypeRaw ? dateTypeRaw.split(',') : [])

  const toggleDateType = (value: string) => {
    const next = new Set(activeDateTypes)
    if (next.has(value)) { next.delete(value) } else { next.add(value) }
    setLocal('date_type', Array.from(next).join(','))
  }

  // Check if any local filter has a value (to show active count)
  const activeCount = useMemo(
    () => SIDEBAR_KEYS.filter(k => !!localFilters[k]).length,
    [localFilters]
  )

  // ── Apply: persist to URL + push to parent (triggers API) ──
  const handleApply = useCallback(() => {
    writeToUrl(localFilters)
    for (const key of SIDEBAR_KEYS) {
      const localVal = localFilters[key] || ''
      const parentVal = columnFilters[key] || ''
      if (localVal !== parentVal) {
        onFilterChange(key, localVal)
      }
    }
  }, [localFilters, columnFilters, onFilterChange, writeToUrl])

  // ── Clear: reset local state + URL + parent sidebar filters ──
  const handleClear = useCallback(() => {
    setLocalFilters({})
    clearUrl()
    for (const key of SIDEBAR_KEYS) {
      if (columnFilters[key]) {
        onFilterChange(key, '')
      }
    }
  }, [columnFilters, onFilterChange, clearUrl])

  return (
    <Box sx={SIDEBAR_SX}>

      {/* ══════════ DATE ══════════ */}
      <Section icon='ri-calendar-2-line' label={t.sectionDate} />

      <FilterRow icon='ri-calendar-check-line' label={t.filterFrom}>
        <TextField
          type='date'
          size='small'
          fullWidth
          value={f('date_from')}
          onChange={e => setLocal('date_from', e.target.value)}
          disabled={loading}
          variant='outlined'
          sx={FIELD_SX}
          slotProps={{ inputLabel: { shrink: true } }}
        />
      </FilterRow>

      <FilterRow icon='ri-calendar-close-line' label={t.filterTo}>
        <TextField
          type='date'
          size='small'
          fullWidth
          value={f('date_to')}
          onChange={e => setLocal('date_to', e.target.value)}
          disabled={loading}
          variant='outlined'
          sx={FIELD_SX}
          slotProps={{ inputLabel: { shrink: true } }}
        />
      </FilterRow>

      <Box sx={{ ...ROW_SX, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {DATE_TYPES.map(dt => (
          <Box
            key={dt.value}
            onClick={() => toggleDateType(dt.value)}
            sx={activeDateTypes.has(dt.value) ? CHIP_ACTIVE_SX : CHIP_INACTIVE_SX}
          >
            <i className={dt.icon} style={{ fontSize: '0.55rem' }} />
            {t[dt.labelKey]}
          </Box>
        ))}
        <Box
          onClick={() => setLocal('date_null', f('date_null') === 'YES' ? '' : 'YES')}
          sx={f('date_null') === 'YES' ? CHIP_NULL_ACTIVE_SX : CHIP_INACTIVE_SX}
        >
          <i className='ri-close-circle-line' style={{ fontSize: '0.55rem' }} />
          {t.filterDateNull}
        </Box>
      </Box>

      <FilterRow icon='ri-checkbox-circle-line' label={t.filterSurfaceParcelCheck}>
        <Box
          onClick={() => setLocal('surface_parcel_check', f('surface_parcel_check') === 'YES' ? '' : 'YES')}
          sx={f('surface_parcel_check') === 'YES' ? CHIP_ACTIVE_SX : CHIP_INACTIVE_SX}
        >
          {f('surface_parcel_check') === 'YES' ? t.chipYes : t.chipNo}
        </Box>
      </FilterRow>

      {/* ══════════ RECHERCHE ══════════ */}
      <Section icon='ri-search-line' label={t.sectionSearch} />

      <FilterRow icon='ri-user-search-line' label={t.filterClientRef}>
        <PanelTextInput
          value={f('sidebar_search')}
          onChange={v => setLocal('sidebar_search', v)}
          loading={loading}
          placeholder={t.filterSearch}
          icon='ri-search-line'
        />
      </FilterRow>

      <FilterRow icon='ri-phone-line' label={t.filterPhone}>
        <PanelTextInput
          value={f('sidebar_phone')}
          onChange={v => setLocal('sidebar_phone', v)}
          loading={loading}
          placeholder={t.filterSearch}
        />
      </FilterRow>

      <FilterRow icon='ri-map-pin-2-line' label={t.filterPostcode}>
        <PanelTextInput
          value={f('sidebar_postcode')}
          onChange={v => setLocal('sidebar_postcode', v)}
          loading={loading}
          placeholder={t.filterSearch}
        />
      </FilterRow>

      <FilterRow icon='ri-building-2-line' label={t.filterCity}>
        <PanelTextInput
          value={f('sidebar_city')}
          onChange={v => setLocal('sidebar_city', v)}
          loading={loading}
          placeholder={t.filterSearch}
        />
      </FilterRow>

      {/* ══════════ PLAGES ══════════ */}
      <Section icon='ri-time-line' label={t.sectionRanges} />

      <FilterRow icon='ri-calendar-event-line' label={t.filterOpcRange}>
        <PanelSelect
          value={f('opc_range_id')}
          items={filterOptions.date_ranges}
          onChange={v => setLocal('opc_range_id', v)}
          loading={loading}
          placeholder={t.filterAll}
          withNull
        />
      </FilterRow>

      <FilterRow icon='ri-calendar-event-line' label={t.filterSavRange}>
        <PanelSelect
          value={f('sav_at_range_id')}
          items={filterOptions.date_ranges}
          onChange={v => setLocal('sav_at_range_id', v)}
          loading={loading}
          placeholder={t.filterAll}
          withNull
        />
      </FilterRow>

      {/* ══════════ DÉTAILS ══════════ */}
      <Section icon='ri-file-info-line' label={t.sectionDetails} />

      <FilterRow icon='ri-key-line' label={t.filterAcces1}>
        <PanelTextInput
          value={f('acces_1')}
          onChange={v => setLocal('acces_1', v)}
          loading={loading}
          placeholder={t.filterSearch}
        />
      </FilterRow>

      <FilterRow icon='ri-key-line' label={t.filterAcces2}>
        <PanelTextInput
          value={f('acces_2')}
          onChange={v => setLocal('acces_2', v)}
          loading={loading}
          placeholder={t.filterSearch}
        />
      </FilterRow>

      <FilterRow icon='ri-link' label={t.filterSource}>
        <PanelTextInput
          value={f('source')}
          onChange={v => setLocal('source', v)}
          loading={loading}
          placeholder={t.filterSearch}
        />
      </FilterRow>

      {/* ══════════ ÉQUIPE ══════════ */}
      <Section icon='ri-team-line' label={t.sectionTeamFilter} />

      <FilterRow icon='ri-user-check-line' label={t.filterConfirmateur}>
        <PanelAutocomplete
          value={f('confirmateur_id')}
          items={filterOptions.users}
          onChange={v => setLocal('confirmateur_id', v)}
          loading={loading}
          placeholder={t.filterAll}
        />
      </FilterRow>

      <FilterRow icon='ri-phone-fill' label={t.filterRegie}>
        <PanelAutocomplete
          value={f('regie_callcenter')}
          items={filterOptions.teams}
          onChange={v => setLocal('regie_callcenter', v)}
          loading={loading}
          placeholder={t.filterAll}
        />
      </FilterRow>

      {/* ══════════ RAPPORTS ══════════ */}
      <Section icon='ri-file-chart-line' label={t.sectionReports} />

      <FilterRow icon='ri-file-list-line' label={t.filterRapport}>
        <PanelTextInput
          value={f('rapport_installation')}
          onChange={v => setLocal('rapport_installation', v)}
          loading={loading}
          placeholder={t.filterSearch}
        />
      </FilterRow>

      <FilterRow icon='ri-git-branch-line' label={t.filterRapportAttribution}>
        <PanelTextInput
          value={f('rapport_attribution')}
          onChange={v => setLocal('rapport_attribution', v)}
          loading={loading}
          placeholder={t.filterSearch}
        />
      </FilterRow>

      <FilterRow icon='ri-timer-line' label={t.filterRapportTemps}>
        <PanelTextInput
          value={f('rapport_temps')}
          onChange={v => setLocal('rapport_temps', v)}
          loading={loading}
          placeholder={t.filterSearch}
        />
      </FilterRow>

      <FilterRow icon='ri-admin-line' label={t.filterRapportAdmin}>
        <PanelTextInput
          value={f('rapport_admin')}
          onChange={v => setLocal('rapport_admin', v)}
          loading={loading}
          placeholder={t.filterSearch}
        />
      </FilterRow>

      {/* ══════════ SÉLECTIONS ══════════ */}
      <Section icon='ri-list-check-2' label={t.sectionSelections} />

      {filterOptions.products.length > 0 && (
        <FilterRow icon='ri-shopping-bag-line' label={t.filterProduct}>
          <PanelAutocomplete
            value={f('product_id')}
            items={filterOptions.products}
            onChange={v => setLocal('product_id', v)}
            loading={loading}
            placeholder={t.filterAll}
          />
        </FilterRow>
      )}

      <FilterRow icon='ri-tools-line' label={t.filterEquipeInstall}>
        <PanelAutocomplete
          value={f('sidebar_financial_partner')}
          items={filterOptions.financial_partners}
          onChange={v => setLocal('sidebar_financial_partner', v)}
          loading={loading}
          placeholder={t.filterAll}
        />
      </FilterRow>

      <FilterRow icon='ri-user-settings-line' label={t.filterInstallateur}>
        <PanelAutocomplete
          value={f('installer_user_id')}
          items={filterOptions.users}
          onChange={v => setLocal('installer_user_id', v)}
          loading={loading}
          placeholder={t.filterAll}
        />
      </FilterRow>

      <FilterRow icon='ri-building-line' label={t.filterSousTraitant}>
        <PanelAutocomplete
          value={f('sidebar_partner_layer')}
          items={filterOptions.partner_layers}
          onChange={v => setLocal('sidebar_partner_layer', v)}
          loading={loading}
          placeholder={t.filterAll}
        />
      </FilterRow>

      <FilterRow icon='ri-user-add-line' label={t.filterCreateur}>
        <PanelAutocomplete
          value={f('sidebar_creator')}
          items={filterOptions.users}
          onChange={v => setLocal('sidebar_creator', v)}
          loading={loading}
          placeholder={t.filterAll}
        />
      </FilterRow>

      <FilterRow icon='ri-building-4-line' label={t.filterSociete}>
        <PanelAutocomplete
          value={f('sidebar_company')}
          items={filterOptions.companies}
          onChange={v => setLocal('sidebar_company', v)}
          loading={loading}
          placeholder={t.filterAll}
        />
      </FilterRow>

      {/* ══════════ DOMOPRIME ══════════ */}
      <Section icon='ri-leaf-line' label={t.sectionDomoprime} />

      {filterOptions.energies.length > 0 && (
        <FilterRow icon='ri-flashlight-line' label={t.filterEnergy}>
          <PanelAutocomplete
            value={f('energy_id')}
            items={filterOptions.energies}
            onChange={v => setLocal('energy_id', v)}
            loading={loading}
            placeholder={t.filterAll}
          />
        </FilterRow>
      )}

      {filterOptions.sectors.length > 0 && (
        <FilterRow icon='ri-pie-chart-line' label={t.filterSector}>
          <PanelAutocomplete
            value={f('sector_id')}
            items={filterOptions.sectors}
            onChange={v => setLocal('sector_id', v)}
            loading={loading}
            placeholder={t.filterAll}
          />
        </FilterRow>
      )}

      {filterOptions.zones.length > 0 && (
        <FilterRow icon='ri-map-pin-line' label={t.filterZone}>
          <PanelAutocomplete
            value={f('zone_id')}
            items={filterOptions.zones}
            onChange={v => setLocal('zone_id', v)}
            loading={loading}
            placeholder={t.filterAll}
          />
        </FilterRow>
      )}

      {filterOptions.quotation_signed.length > 0 && (
        <FilterRow icon='ri-file-text-line' label={t.filterQuotationSigned}>
          <PanelSelect
            value={f('quotation_is_signed')}
            items={filterOptions.quotation_signed}
            onChange={v => setLocal('quotation_is_signed', v)}
            loading={loading}
            placeholder={t.filterAll}
          />
        </FilterRow>
      )}

      {filterOptions.document_signed.length > 0 && (
        <FilterRow icon='ri-file-check-line' label={t.filterDocumentSigned}>
          <PanelSelect
            value={f('document_is_signed')}
            items={filterOptions.document_signed}
            onChange={v => setLocal('document_is_signed', v)}
            loading={loading}
            placeholder={t.filterAll}
          />
        </FilterRow>
      )}

      {/* ══════════ ACTION BUTTONS ══════════ */}
      <Box sx={{
        position: 'sticky',
        bottom: 0,
        px: 1.5,
        py: 1.2,
        display: 'flex',
        flexDirection: 'column',
        gap: 0.8,
        background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.95) 20%)',
        borderTop: '1px solid rgba(59,130,246,0.10)',
        '[data-mui-color-scheme="dark"] &': {
          background: 'linear-gradient(180deg, rgba(15,23,42,0) 0%, rgba(15,23,42,0.95) 20%)',
          borderTop: '1px solid rgba(99,102,241,0.12)',
        },
      }}>
        <Button
          variant='contained'
          size='small'
          fullWidth
          disabled={loading || activeCount === 0}
          onClick={handleApply}
          startIcon={<i className='ri-filter-3-line' style={{ fontSize: '0.85rem' }} />}
          sx={{
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.75rem',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, rgba(59,130,246,0.9), rgba(99,102,241,0.85))',
            boxShadow: '0 3px 10px rgba(59,130,246,0.25)',
            '&:hover': {
              background: 'linear-gradient(135deg, rgba(59,130,246,1), rgba(99,102,241,0.95))',
              boxShadow: '0 4px 14px rgba(59,130,246,0.35)',
            },
            '&.Mui-disabled': {
              background: 'rgba(59,130,246,0.15)',
              color: 'rgba(59,130,246,0.4)',
            },
          }}
        >
          {t.filterApply}{activeCount > 0 ? ` (${activeCount})` : ''}
        </Button>

        <Button
          variant='outlined'
          size='small'
          fullWidth
          disabled={loading || activeCount === 0}
          onClick={handleClear}
          startIcon={<i className='ri-delete-bin-line' style={{ fontSize: '0.85rem' }} />}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.72rem',
            borderRadius: '8px',
            borderColor: 'rgba(239,68,68,0.3)',
            color: 'rgba(239,68,68,0.8)',
            '&:hover': {
              borderColor: 'rgba(239,68,68,0.5)',
              background: 'rgba(239,68,68,0.04)',
            },
            '&.Mui-disabled': {
              borderColor: 'rgba(0,0,0,0.08)',
              color: 'rgba(0,0,0,0.2)',
            },
          }}
        >
          {t.filterClear}
        </Button>
      </Box>
    </Box>
  )
}
