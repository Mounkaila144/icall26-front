'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Controller } from 'react-hook-form'
import type { UseFormReturn } from 'react-hook-form'

import Grid from '@mui/material/Grid2'
import TextField from '@mui/material/TextField'
import Autocomplete from '@mui/material/Autocomplete'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'

import { customersService } from '@/modules/Customers/admin/services/customersService'
import type { Customer } from '@/modules/Customers/types'
import { useWizardPermissions } from '../useWizardPermissions'
import type { CustomerFormData } from '../contractFormSchema'
import type { ContractTranslations } from '../../../hooks/useContractTranslations'

interface StepCustomerProps {
  form: UseFormReturn<CustomerFormData>
  t: ContractTranslations
  onCustomerSelected?: (name: string) => void
}

const DEBOUNCE_MS = 350

export default function StepCustomer({ form, t, onCustomerSelected }: StepCustomerProps) {
  const { control, watch, setValue } = form
  const customerMode = watch('customerMode')
  const { canShow } = useWizardPermissions()

  // Permission-gated customer fields
  const showCompany = canShow('contract_new_company')

  // --- Async customer search state ---
  const [customerOptions, setCustomerOptions] = useState<Customer[]>([])
  const [customerLoading, setCustomerLoading] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const searchCustomers = useCallback(async (query: string) => {
    if (query.length < 2) {
      setCustomerOptions([])

      return
    }

    setCustomerLoading(true)

    try {
      const res = await customersService.getCustomers({ search: query, per_page: 20 })

      setCustomerOptions(res.data ?? [])
    } catch {
      setCustomerOptions([])
    } finally {
      setCustomerLoading(false)
    }
  }, [])

  // Debounced search on input change
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(() => {
      searchCustomers(inputValue)
    }, DEBOUNCE_MS)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [inputValue, searchCustomers])

  const handleModeChange = (_: React.MouseEvent<HTMLElement>, value: string | null) => {
    if (value === 'existing' || value === 'new') {
      setValue('customerMode', value, { shouldValidate: false })
    }
  }

  const getCustomerLabel = (customer: Customer) => {
    const parts = [customer.full_name || `${customer.lastname ?? ''} ${customer.firstname ?? ''}`.trim()]

    if (customer.phone) parts.push(customer.phone)
    if (customer.primary_address?.city) parts.push(customer.primary_address.city)

    return parts.join(' — ')
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
        <ToggleButtonGroup
          value={customerMode}
          exclusive
          onChange={handleModeChange}
          color='primary'
        >
          <ToggleButton value='new'>
            <i className='ri-user-add-line' style={{ marginInlineEnd: 8 }} />
            {t.wizardCustomerModeNew}
          </ToggleButton>
          <ToggleButton value='existing'>
            <i className='ri-user-search-line' style={{ marginInlineEnd: 8 }} />
            {t.wizardCustomerModeExisting}
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {customerMode === 'existing' ? (
        <Controller
          name='customer_id'
          control={control}
          render={({ field, fieldState }) => (
            <Autocomplete
              options={customerOptions}
              getOptionLabel={getCustomerLabel}
              filterOptions={x => x}
              value={selectedCustomer}
              inputValue={inputValue}
              onInputChange={(_, value, reason) => {
                if (reason !== 'reset') setInputValue(value)
              }}
              onChange={(_, customer) => {
                setSelectedCustomer(customer)
                field.onChange(customer ? customer.id : undefined)
                onCustomerSelected?.(customer ? getCustomerLabel(customer) : '')
              }}
              loading={customerLoading}
              loadingText={t.wizardCustomerLoading}
              noOptionsText={inputValue.length < 2 ? t.wizardCustomerSearchPlaceholder : t.wizardCustomerNoOptions}
              isOptionEqualToValue={(opt, val) => opt.id === val.id}
              renderOption={(props, option) => (
                <li {...props} key={option.id}>
                  <Box>
                    <Typography variant='body2' fontWeight={500}>
                      {option.full_name || `${option.lastname ?? ''} ${option.firstname ?? ''}`.trim()}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      {[option.phone, option.email, option.primary_address?.city].filter(Boolean).join(' · ')}
                    </Typography>
                  </Box>
                </li>
              )}
              renderInput={params => (
                <TextField
                  {...params}
                  label={t.wizardCustomerSearchLabel}
                  placeholder={t.wizardCustomerSearchPlaceholder}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  slotProps={{
                    input: {
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {customerLoading ? <CircularProgress color='inherit' size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    },
                  }}
                />
              )}
              fullWidth
            />
          )}
        />
      ) : (
        <Grid container spacing={3}>
          {/* Gender */}
          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name='customer.gender'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  value={field.value ?? ''}
                  select
                  label={t.wizardGender}
                  fullWidth
                >
                  <MenuItem value=''>&nbsp;</MenuItem>
                  <MenuItem value='Mr'>{t.wizardGenderMr}</MenuItem>
                  <MenuItem value='Ms'>{t.wizardGenderMs}</MenuItem>
                  <MenuItem value='Mrs'>{t.wizardGenderMrs}</MenuItem>
                </TextField>
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name='customer.lastname'
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label={t.lastName}
                  fullWidth
                  required
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name='customer.firstname'
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label={t.firstName}
                  fullWidth
                  required
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name='customer.phone'
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label={t.phone}
                  fullWidth
                  required
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name='customer.email'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t.wizardEmail}
                  type='email'
                  fullWidth
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name='customer.mobile'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t.wizardMobile}
                  fullWidth
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name='customer.mobile2'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t.wizardMobile2}
                  fullWidth
                />
              )}
            />
          </Grid>

          {/* Company - permission gated */}
          {showCompany ? (
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name='customer.company'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t.wizardCustomerCompany}
                    fullWidth
                  />
                )}
              />
            </Grid>
          ) : null}

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name='customer.union_id'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  value={field.value ?? ''}
                  onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  label={t.unionId}
                  type='number'
                  fullWidth
                />
              )}
            />
          </Grid>

          {/* Address section */}
          <Grid size={12}>
            <Typography variant='subtitle1' sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              <i className='ri-home-line' />
              {t.addressSection}
            </Typography>
          </Grid>
          <Grid size={12}>
            <Controller
              name='customer.address.address1'
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label={t.address}
                  fullWidth
                  required
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>
          <Grid size={12}>
            <Controller
              name='customer.address.address2'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t.wizardAddress2}
                  fullWidth
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name='customer.address.postcode'
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label={t.postcode}
                  fullWidth
                  required
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name='customer.address.city'
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label={t.city}
                  fullWidth
                  required
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>
        </Grid>
      )}
    </Box>
  )
}
