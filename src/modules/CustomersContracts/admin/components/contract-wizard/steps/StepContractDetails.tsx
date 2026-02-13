'use client'

import { Controller } from 'react-hook-form'
import type { UseFormReturn } from 'react-hook-form'

import Grid from '@mui/material/Grid2'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Box from '@mui/material/Box'

import { useWizardPermissions } from '../useWizardPermissions'
import type { ContractDetailsFormData } from '../contractFormSchema'
import type { ContractTranslations } from '../../../hooks/useContractTranslations'

interface StepContractDetailsProps {
  form: UseFormReturn<ContractDetailsFormData>
  t: ContractTranslations
}

export default function StepContractDetails({ form, t }: StepContractDetailsProps) {
  const { control } = form
  const { canShow, shouldRemove } = useWizardPermissions()

  // "Show" credentials: field visible only if user has the credential
  const showQuotedAt = canShow('contract_new_quoted_at_date')
  const showBillingAt = canShow('contract_new_billing_at_date')
  const showSavAt = canShow('contract_new_sav_at_date')
  const showPreMeetingAt = canShow('contract_new_pre_meeting_at_date')
  const showDocAt = canShow('contract_new_doc_at_date')
  const showClosedAt = canShow('contract_new_closed_at')
  const showHasTva = canShow('contract_new_hastva')
  const showRemarks = canShow('contract_new_remarks')

  // "Remove" credentials: field hidden if user has the credential
  const hideOpenedAt = shouldRemove('contract_new_remove_opened_at')
  const hideOpcAt = shouldRemove('contract_new_opc_at_remove')
  const hidePaymentAt = shouldRemove('contract_new_payment_at_remove')
  const hideApfAt = shouldRemove('contract_new_apf_at_remove')
  const hideReference = shouldRemove('contract_new_reference_remove')

  // Build the list of visible "default" dates
  const defaultDates: { name: keyof ContractDetailsFormData; label: string; required: boolean; visible: boolean }[] = [
    { name: 'quoted_at', label: t.dateQuote, required: true, visible: showQuotedAt },
    { name: 'billing_at', label: t.dateBilling, required: true, visible: showBillingAt },
    { name: 'opened_at', label: t.dateEngagement, required: true, visible: !hideOpenedAt },
    { name: 'opc_at', label: t.dateOpc, required: true, visible: !hideOpcAt },
  ]

  const optionalDates: { name: keyof ContractDetailsFormData; label: string; visible: boolean }[] = [
    { name: 'sent_at', label: t.dateSent, visible: true },
    { name: 'payment_at', label: t.datePayment, visible: !hidePaymentAt },
    { name: 'apf_at', label: t.dateApf, visible: !hideApfAt },
  ]

  // Permission-gated additional dates
  const additionalDates: { name: keyof ContractDetailsFormData; label: string; visible: boolean }[] = [
    { name: 'sav_at', label: t.dateSav, visible: showSavAt },
    { name: 'pre_meeting_at', label: t.datePreMeeting, visible: showPreMeetingAt },
    { name: 'doc_at', label: t.dateDoc, visible: showDocAt },
    { name: 'closed_at', label: t.dateClosed, visible: showClosedAt },
  ]

  const visibleDefaultDates = defaultDates.filter(d => d.visible)
  const visibleOptionalDates = optionalDates.filter(d => d.visible)
  const visibleAdditionalDates = additionalDates.filter(d => d.visible)

  return (
    <Box>
      {/* Required dates */}
      {visibleDefaultDates.length > 0 ? (
        <>
          <Typography variant='subtitle1' sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <i className='ri-calendar-check-line' />
            {t.wizardRequiredDatesTitle}
          </Typography>
          <Grid container spacing={3}>
            {visibleDefaultDates.map(({ name, label, required }) => (
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
                      required={required}
                      slotProps={{ inputLabel: { shrink: true } }}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
            ))}
          </Grid>
          <Divider sx={{ my: 4 }} />
        </>
      ) : null}

      {/* Optional dates */}
      {visibleOptionalDates.length > 0 ? (
        <>
          <Typography variant='subtitle1' sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <i className='ri-calendar-line' />
            {t.wizardOptionalDatesTitle}
          </Typography>
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
          <Divider sx={{ my: 4 }} />
        </>
      ) : null}

      {/* Permission-gated additional dates */}
      {visibleAdditionalDates.length > 0 ? (
        <>
          <Typography variant='subtitle1' sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <i className='ri-calendar-event-line' />
            {t.wizardPermissionDatesTitle}
          </Typography>
          <Grid container spacing={3}>
            {visibleAdditionalDates.map(({ name, label }) => (
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
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                  )}
                />
              </Grid>
            ))}
          </Grid>
          <Divider sx={{ my: 4 }} />
        </>
      ) : null}

      {/* TVA - permission gated */}
      {showHasTva ? (
        <>
          <Grid container spacing={3} sx={{ mb: 3 }}>
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
          </Grid>
        </>
      ) : null}

      {/* Reference & Remarks */}
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
        {showRemarks ? (
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
