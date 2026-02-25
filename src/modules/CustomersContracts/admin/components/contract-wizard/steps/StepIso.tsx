'use client'

import { Controller } from 'react-hook-form'
import type { UseFormReturn } from 'react-hook-form'

import Grid from '@mui/material/Grid2'
import TextField from '@mui/material/TextField'
import Autocomplete from '@mui/material/Autocomplete'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Box from '@mui/material/Box'
import MenuItem from '@mui/material/MenuItem'
import InputAdornment from '@mui/material/InputAdornment'
import CircularProgress from '@mui/material/CircularProgress'

import type { IsoFormData } from '../contractFormSchema'
import type { DomoprimeFilterOptions, FilterOption } from '@/modules/AppDomoprime/types'
import type { ContractFilterOptions } from '../../../../types'
import type { ContractTranslations } from '../../../hooks/useContractTranslations'

interface StepIsoProps {
  form: UseFormReturn<IsoFormData>
  domoprimeOptions: DomoprimeFilterOptions
  domoprimeOptionsLoading: boolean
  filterOptions: ContractFilterOptions
  t: ContractTranslations
}

function IsoAutocompleteField({
  name,
  control,
  label,
  options,
}: {
  name: keyof IsoFormData
  control: UseFormReturn<IsoFormData>['control']
  label: string
  options: FilterOption[]
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Autocomplete
          options={options}
          getOptionLabel={opt => opt.name}
          value={options.find(o => o.id === field.value) ?? null}
          onChange={(_, opt) => field.onChange(opt ? Number(opt.id) : undefined)}
          renderInput={params => <TextField {...params} label={label} />}
          isOptionEqualToValue={(opt, val) => opt.id === val.id}
        />
      )}
    />
  )
}

function NumberField({
  name,
  control,
  label,
  unit,
}: {
  name: keyof IsoFormData
  control: UseFormReturn<IsoFormData>['control']
  label: string
  unit?: string
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <TextField
          {...field}
          value={field.value ?? ''}
          onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
          label={label}
          type='number'
          fullWidth
          slotProps={
            unit
              ? { input: { endAdornment: <InputAdornment position='end'>{unit}</InputAdornment> } }
              : undefined
          }
        />
      )}
    />
  )
}

export default function StepIso({ form, domoprimeOptions, domoprimeOptionsLoading, filterOptions, t }: StepIsoProps) {
  const { control } = form

  // Use contract filter options energies as fallback when domoprime energies are empty
  const energies = domoprimeOptions.energies.length > 0
    ? domoprimeOptions.energies
    : (filterOptions.energies as FilterOption[])

  if (domoprimeOptionsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      {/* Informations fiscales section */}
      <Typography variant='subtitle1' sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <i className='ri-file-text-line' />
        {t.isoFiscalInfoSection}
      </Typography>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name='fiscal_reference_1'
            control={control}
            render={({ field }) => (
              <TextField {...field} label={`${t.isoFiscalReference} 1`} fullWidth />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name='fiscal_number_1'
            control={control}
            render={({ field }) => (
              <TextField {...field} label={`${t.isoFiscalNumber} 1`} fullWidth />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name='fiscal_reference_2'
            control={control}
            render={({ field }) => (
              <TextField {...field} label={`${t.isoFiscalReference} 2`} fullWidth />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name='fiscal_number_2'
            control={control}
            render={({ field }) => (
              <TextField {...field} label={`${t.isoFiscalNumber} 2`} fullWidth />
            )}
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      {/* Fiscal section */}
      <Typography variant='subtitle1' sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <i className='ri-money-euro-box-line' />
        {t.isoFiscalSection}
      </Typography>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name='calcul_maprimerenov_manuel'
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                value={field.value ?? ''}
                select
                label={t.isoCalcMaprimerenov}
                fullWidth
              >
                <MenuItem value=''>-</MenuItem>
                <MenuItem value='YES'>{t.yes}</MenuItem>
                <MenuItem value='NO'>{t.no}</MenuItem>
              </TextField>
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <NumberField name='number_of_people' control={control} label={t.isoNumberOfPeople} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <NumberField name='revenue' control={control} label={t.isoRevenue} unit='EUR' />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <NumberField name='number_of_fiscal' control={control} label={t.isoNumberOfFiscal} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name='declarants'
            control={control}
            render={({ field }) => (
              <TextField {...field} label={t.isoDeclarants} fullWidth />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <NumberField name='number_of_parts' control={control} label={t.isoNumberOfParts} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <NumberField name='number_of_children' control={control} label={t.isoNumberOfChildren} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <NumberField name='tax_credit_used' control={control} label={t.isoTaxCreditUsed} unit='EUR' />
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      {/* Habitat section */}
      <Typography variant='subtitle1' sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <i className='ri-home-4-line' />
        {t.isoHabitatSection}
      </Typography>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <IsoAutocompleteField
            name='previous_energy_id'
            control={control}
            label={t.isoPreviousEnergy}
            options={energies}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <IsoAutocompleteField
            name='energy_id'
            control={control}
            label={t.isoEnergy}
            options={energies}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <IsoAutocompleteField
            name='occupation_id'
            control={control}
            label={t.isoOccupationType}
            options={domoprimeOptions.occupations}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name='more_2_years'
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                value={field.value ?? ''}
                select
                label={t.isoMore2Years}
                fullWidth
              >
                <MenuItem value=''>-</MenuItem>
                <MenuItem value='YES'>{t.yes}</MenuItem>
                <MenuItem value='NO'>{t.no}</MenuItem>
              </TextField>
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name='parcel_reference'
            control={control}
            render={({ field }) => (
              <TextField {...field} label={t.isoParcelReference} fullWidth />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <NumberField name='parcel_surface' control={control} label={t.isoParcelSurface} unit='m²' />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <IsoAutocompleteField
            name='layer_type_id'
            control={control}
            label={t.isoLayerType}
            options={domoprimeOptions.layer_types}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <NumberField name='surface_home' control={control} label={t.isoSurfaceHabitat} unit='m²' />
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      {/* Surfaces section */}
      <Typography variant='subtitle1' sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <i className='ri-ruler-line' />
        {t.isoSurfacesSection}
      </Typography>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <NumberField name='surface_top' control={control} label={t.isoSurfaceTop} unit='m²' />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <NumberField name='surface_wall' control={control} label={t.isoSurfaceWall} unit='m²' />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <NumberField name='surface_floor' control={control} label={t.isoSurfaceFloor} unit='m²' />
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      {/* Surfaces Installateur section */}
      <Typography variant='subtitle1' sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <i className='ri-tools-line' />
        {t.isoSurfacesInstallerSection}
      </Typography>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <NumberField name='install_surface_top' control={control} label={t.isoInstallSurfaceTop} unit='m²' />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <NumberField name='install_surface_wall' control={control} label={t.isoInstallSurfaceWall} unit='m²' />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <NumberField name='install_surface_floor' control={control} label={t.isoInstallSurfaceFloor} unit='m²' />
        </Grid>
      </Grid>
    </Box>
  )
}
