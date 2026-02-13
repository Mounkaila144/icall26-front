'use client'

import { useMemo } from 'react'
import type { UseFormReturn } from 'react-hook-form'

import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'

import type { CustomerFormData, ContractDetailsFormData, TeamFinanceFormData } from '../contractFormSchema'
import type { ContractFilterOptions } from '../../../../types'
import type { ContractTranslations } from '../../../hooks/useContractTranslations'

interface StepSummaryProps {
  customerForm: UseFormReturn<CustomerFormData>
  detailsForm: UseFormReturn<ContractDetailsFormData>
  teamFinanceForm: UseFormReturn<TeamFinanceFormData>
  filterOptions: ContractFilterOptions
  selectedCustomerName?: string
  t: ContractTranslations
}

function SummaryRow({ label, value }: { label: string; value: string | undefined }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
      <Typography variant='body2' color='text.secondary'>{label}</Typography>
      <Typography variant='body2' fontWeight={500}>{value || '-'}</Typography>
    </Box>
  )
}

function resolveName(id: number | undefined, options: { id: number | string; name: string }[]): string {
  if (!id) return '-'

  const opt = options.find(o => Number(o.id) === id)

  return opt?.name ?? String(id)
}

export default function StepSummary({ customerForm, detailsForm, teamFinanceForm, filterOptions, selectedCustomerName, t }: StepSummaryProps) {
  const customer = customerForm.getValues()
  const details = detailsForm.getValues()
  const tf = teamFinanceForm.getValues()

  const dateRows = useMemo(() => {
    const all: [string, string | undefined][] = [
      [t.dateQuote, details.quoted_at],
      [t.dateBilling, details.billing_at],
      [t.dateEngagement, details.opened_at],
      [t.dateOpc, details.opc_at],
      [t.dateSent, details.sent_at],
      [t.datePayment, details.payment_at],
      [t.dateApf, details.apf_at],
      [t.dateSav, details.sav_at],
      [t.datePreMeeting, details.pre_meeting_at],
      [t.dateDoc, details.doc_at],
      [t.dateClosed, details.closed_at],
    ]

    return all.filter(([, v]) => !!v)
  }, [details, t])

  return (
    <Grid container spacing={3}>
      {/* Customer card */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card variant='outlined'>
          <CardContent>
            <Typography variant='subtitle1' gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <i className='ri-user-line' />
              {t.wizardSummaryClient}
            </Typography>
            {customer.customerMode === 'existing' ? (
              <Typography variant='body2'>
                {selectedCustomerName || `${t.wizardSummaryExistingCustomer}${customer.customer_id}`}
              </Typography>
            ) : (
              <>
                {customer.customer?.gender ? <SummaryRow label={t.wizardGender} value={customer.customer.gender} /> : null}
                <SummaryRow label={t.lastName} value={customer.customer?.lastname} />
                <SummaryRow label={t.firstName} value={customer.customer?.firstname} />
                <SummaryRow label={t.phone} value={customer.customer?.phone} />
                {customer.customer?.email ? <SummaryRow label={t.wizardEmail} value={customer.customer.email} /> : null}
                {customer.customer?.mobile ? <SummaryRow label={t.wizardMobile} value={customer.customer.mobile} /> : null}
                {customer.customer?.mobile2 ? <SummaryRow label={t.wizardMobile2} value={customer.customer.mobile2} /> : null}
                {customer.customer?.company ? <SummaryRow label={t.wizardCustomerCompany} value={customer.customer.company} /> : null}
                <SummaryRow label={t.address} value={customer.customer?.address?.address1} />
                {customer.customer?.address?.address2 ? <SummaryRow label={t.wizardAddress2} value={customer.customer.address.address2} /> : null}
                <SummaryRow label={t.postcode} value={customer.customer?.address?.postcode} />
                <SummaryRow label={t.city} value={customer.customer?.address?.city} />
              </>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Dates card */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card variant='outlined'>
          <CardContent>
            <Typography variant='subtitle1' gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <i className='ri-calendar-line' />
              {t.wizardSummaryDates}
            </Typography>
            {dateRows.map(([label, value]) => (
              <SummaryRow key={label} label={label} value={value} />
            ))}
            {details.has_tva ? <SummaryRow label={t.wizardHasTva} value={details.has_tva === '1' ? t.wizardHasTvaYes : t.wizardHasTvaNo} /> : null}
            {details.reference ? <SummaryRow label={t.reference} value={details.reference} /> : null}
          </CardContent>
        </Card>
      </Grid>

      {/* Team card */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card variant='outlined'>
          <CardContent>
            <Typography variant='subtitle1' gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <i className='ri-team-line' />
              {t.wizardSummaryTeam}
            </Typography>
            <SummaryRow label={t.wizardTelepro} value={resolveName(tf.telepro_id, filterOptions.users)} />
            <SummaryRow label={t.wizardSale1} value={resolveName(tf.sale_1_id, filterOptions.users)} />
            <SummaryRow label={t.wizardSale2} value={resolveName(tf.sale_2_id, filterOptions.users)} />
            <SummaryRow label={t.wizardManager} value={resolveName(tf.manager_id, filterOptions.users)} />
            <SummaryRow label={t.wizardAssistant} value={resolveName(tf.assistant_id, filterOptions.users)} />
            <SummaryRow label={t.wizardInstaller} value={resolveName(tf.installer_user_id, filterOptions.users)} />
            <SummaryRow label={t.wizardTeam} value={resolveName(tf.team_id, filterOptions.teams)} />
            <SummaryRow label={t.wizardCompany} value={resolveName(tf.company_id, filterOptions.companies)} />
            {tf.polluter_id ? <SummaryRow label={t.wizardPolluter} value={resolveName(tf.polluter_id, filterOptions.polluters)} /> : null}
            {tf.partner_layer_id ? <SummaryRow label={t.wizardPartnerLayer} value={resolveName(tf.partner_layer_id, filterOptions.partner_layers)} /> : null}
            {tf.campaign_id ? <SummaryRow label={t.wizardCampaign} value={resolveName(tf.campaign_id, filterOptions.campaigns)} /> : null}
          </CardContent>
        </Card>
      </Grid>

      {/* Finance & status card */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card variant='outlined'>
          <CardContent>
            <Typography variant='subtitle1' gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <i className='ri-money-euro-circle-line' />
              {t.wizardSummaryFinanceStatus}
            </Typography>
            <SummaryRow label={t.wizardFinancialPartner} value={resolveName(tf.financial_partner_id, filterOptions.financial_partners)} />
            <SummaryRow label={t.priceHt} value={tf.total_price_without_taxe != null ? `${tf.total_price_without_taxe} EUR` : '-'} />
            <SummaryRow label={t.priceTtc} value={tf.total_price_with_taxe != null ? `${tf.total_price_with_taxe} EUR` : '-'} />
            {tf.mensuality != null ? <SummaryRow label={t.wizardMensuality} value={`${tf.mensuality} EUR`} /> : null}
            {tf.advance_payment != null ? <SummaryRow label={t.wizardAdvancePayment} value={`${tf.advance_payment} EUR`} /> : null}
            {tf.opc_range_id ? <SummaryRow label={t.wizardOpcRange} value={resolveName(tf.opc_range_id, filterOptions.date_ranges)} /> : null}
            {tf.sav_at_range_id ? <SummaryRow label={t.wizardSavRange} value={resolveName(tf.sav_at_range_id, filterOptions.date_ranges)} /> : null}
            <SummaryRow label={t.wizardContractStatus} value={resolveName(tf.state_id, filterOptions.contract_statuses)} />
            <SummaryRow label={t.wizardInstallStatus} value={resolveName(tf.install_state_id, filterOptions.install_statuses)} />
            <SummaryRow label={t.wizardAdminStatus} value={resolveName(tf.admin_status_id, filterOptions.admin_statuses)} />
            {tf.opc_status_id ? <SummaryRow label={t.wizardOpcStatus} value={resolveName(tf.opc_status_id, filterOptions.opc_statuses)} /> : null}
            {tf.time_state_id ? <SummaryRow label={t.wizardTimeStatus} value={resolveName(tf.time_state_id, filterOptions.time_statuses)} /> : null}
            <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
              <Chip
                label={tf.is_signed === 'YES' ? t.yes : t.no}
                color={tf.is_signed === 'YES' ? 'success' : 'default'}
                size='small'
              />
              {tf.is_billable ? (
                <Chip
                  label={tf.is_billable === 'YES' ? t.wizardIsBillable : t.chipNotBillable}
                  color={tf.is_billable === 'YES' ? 'info' : 'default'}
                  size='small'
                />
              ) : null}
              <Chip
                label={tf.status === 'ACTIVE' ? t.statusActive : t.statusDeleted}
                color={tf.status === 'ACTIVE' ? 'primary' : 'error'}
                size='small'
              />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Remarks card (if present) */}
      {details.remarks ? (
        <Grid size={12}>
          <Card variant='outlined'>
            <CardContent>
              <Typography variant='subtitle1' gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <i className='ri-chat-3-line' />
                {t.wizardSummaryRemarks}
              </Typography>
              <Typography variant='body2'>{details.remarks}</Typography>
            </CardContent>
          </Card>
        </Grid>
      ) : null}
    </Grid>
  )
}
