'use client'

import { Controller } from 'react-hook-form'
import type { UseFormReturn } from 'react-hook-form'

import Grid from '@mui/material/Grid2'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'

import { useEditPermissions } from '../useEditPermissions'
import type { ContractDetailsFormData } from '../editFormSchema'
import type { CustomerContract } from '../../../../types'
import type { ContractTranslations } from '../../../hooks/useContractTranslations'

interface TabContractDetailsProps {
  form: UseFormReturn<ContractDetailsFormData>
  contract: CustomerContract | null
  t: ContractTranslations
}

export default function TabContractDetails({ form, contract, t }: TabContractDetailsProps) {
  const { control } = form
  const { canEdit, shouldHide } = useEditPermissions()

  // Edit credentials for date fields
  const editSavAt = canEdit('contract_modify_sav_at_date')
  const editOpcAt = canEdit('contract_modify_opc_at')
  const editClosedAt = canEdit('contract_modify_closed_at')
  const editHasTva = canEdit('contract_modify_hastva')
  const editRemarks = canEdit('contract_modify_remarks')

  // Hide credentials
  const hideReference = shouldHide('contract_modify_no_reference')
  const hidePaymentAt = shouldHide('contract_modify_no_payment_at')
  const hideApfAt = shouldHide('contract_modify_no_apf_at')

  const customer = contract?.customer

  // Default dates — always shown, always editable (no specific edit credential for these)
  const defaultDates: { name: keyof ContractDetailsFormData; label: string }[] = [
    { name: 'quoted_at', label: t.dateQuote },
    { name: 'billing_at', label: t.dateBilling },
    { name: 'opened_at', label: t.dateEngagement },
    { name: 'opc_at', label: t.dateOpc },
  ]

  // Optional dates — permission-gated visibility
  const optionalDates: { name: keyof ContractDetailsFormData; label: string; visible: boolean }[] = [
    { name: 'sent_at', label: t.dateSent, visible: true },
    { name: 'payment_at', label: t.datePayment, visible: !hidePaymentAt },
    { name: 'apf_at', label: t.dateApf, visible: !hideApfAt },
  ]

  // Additional dates — permission-gated visibility + editability
  const additionalDates: { name: keyof ContractDetailsFormData; label: string; visible: boolean; editable: boolean }[] = [
    { name: 'sav_at', label: t.dateSav, visible: editSavAt, editable: editSavAt },
    { name: 'pre_meeting_at', label: t.datePreMeeting, visible: true, editable: true },
    { name: 'doc_at', label: t.dateDoc, visible: true, editable: true },
    { name: 'closed_at', label: t.dateClosed, visible: editClosedAt, editable: editClosedAt },
  ]

  const visibleOptionalDates = optionalDates.filter(d => d.visible)
  const visibleAdditionalDates = additionalDates.filter(d => d.visible)

  return (
    <Box>
      {/* Customer info card (read-only) */}
      {customer ? (
        <>
          <Card variant='outlined' sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <i className='ri-user-line' />
                <Typography variant='subtitle1' fontWeight={600}>
                  {t.editCustomerInfo}
                </Typography>
                <Chip label={t.editReadOnly} size='small' variant='outlined' color='default' />
              </Box>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant='body2' color='text.secondary'>{t.editCustomerName}</Typography>
                  <Typography variant='body1'>
                    {customer.firstname} {customer.lastname}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant='body2' color='text.secondary'>{t.editCustomerPhone}</Typography>
                  <Typography variant='body1'>{customer.phone || '-'}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant='body2' color='text.secondary'>{t.editCustomerEmail}</Typography>
                  <Typography variant='body1'>{customer.email || '-'}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant='body2' color='text.secondary'>{t.editCustomerAddress}</Typography>
                  <Typography variant='body1'>
                    {customer.address
                      ? `${customer.address.address1 || ''}, ${customer.address.postcode || ''} ${customer.address.city || ''}`
                      : '-'}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </>
      ) : null}

      {/* Main dates */}
      <Typography variant='subtitle1' sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <i className='ri-calendar-check-line' />
        {t.editDatesSection}
      </Typography>
      <Grid container spacing={3}>
        {defaultDates.map(({ name, label }) => (
          <Grid key={name} size={{ xs: 12, sm: 6 }}>
            <Controller
              name={name}
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label={label}
                  type='date'
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>
        ))}
      </Grid>

      {/* Optional dates */}
      {visibleOptionalDates.length > 0 ? (
        <>
          <Divider sx={{ my: 3 }} />
          <Grid container spacing={3}>
            {visibleOptionalDates.map(({ name, label }) => (
              <Grid key={name} size={{ xs: 12, sm: 4 }}>
                <Controller
                  name={name}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={label}
                      type='date'
                      fullWidth
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                  )}
                />
              </Grid>
            ))}
          </Grid>
        </>
      ) : null}

      {/* Additional dates (permission-gated) */}
      {visibleAdditionalDates.length > 0 ? (
        <>
          <Divider sx={{ my: 3 }} />
          <Typography variant='subtitle1' sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <i className='ri-calendar-event-line' />
            {t.wizardPermissionDatesTitle}
          </Typography>
          <Grid container spacing={3}>
            {visibleAdditionalDates.map(({ name, label, editable }) => (
              <Grid key={name} size={{ xs: 12, sm: 6 }}>
                <Controller
                  name={name}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={label}
                      type='date'
                      fullWidth
                      disabled={!editable}
                      slotProps={{ inputLabel: { shrink: true } }}
                      helperText={!editable ? t.editFieldDisabled : undefined}
                    />
                  )}
                />
              </Grid>
            ))}
          </Grid>
        </>
      ) : null}

      {/* Reference & Remarks */}
      <Divider sx={{ my: 3 }} />
      <Typography variant='subtitle1' sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <i className='ri-file-text-line' />
        {t.editReferenceSection}
      </Typography>
      <Grid container spacing={3}>
        {!hideReference ? (
          <Grid size={12}>
            <Controller
              name='reference'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t.reference}
                  fullWidth
                  helperText={t.referencePlaceholder}
                />
              )}
            />
          </Grid>
        ) : null}
        {editHasTva ? (
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name='has_tva'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  value={field.value ?? ''}
                  select
                  label={t.wizardHasTva}
                  fullWidth
                >
                  <MenuItem value=''>&nbsp;</MenuItem>
                  <MenuItem value='1'>{t.wizardHasTvaYes}</MenuItem>
                  <MenuItem value='0'>{t.wizardHasTvaNo}</MenuItem>
                </TextField>
              )}
            />
          </Grid>
        ) : null}
        {editRemarks ? (
          <Grid size={12}>
            <Controller
              name='remarks'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t.remarks}
                  fullWidth
                  multiline
                  rows={3}
                  placeholder={t.remarksPlaceholder}
                />
              )}
            />
          </Grid>
        ) : null}
      </Grid>
    </Box>
  )
}
