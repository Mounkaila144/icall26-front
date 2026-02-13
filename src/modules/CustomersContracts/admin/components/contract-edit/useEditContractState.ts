'use client'

import { useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'

import { contractDetailsSchema, teamFinanceSchema } from './editFormSchema'
import type { ContractDetailsFormData, TeamFinanceFormData } from './editFormSchema'
import { formatDateForInput } from '../contract-modal/contractFormDefaults'
import type { CustomerContract, UpdateContractData } from '../../../types'

export function useEditContractState() {
  const [activeTab, setActiveTab] = useState(0)
  const [contract, setContract] = useState<CustomerContract | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const detailsForm = useForm<ContractDetailsFormData>({
    resolver: valibotResolver(contractDetailsSchema),
    defaultValues: {},
  })

  const teamFinanceForm = useForm<TeamFinanceFormData>({
    resolver: valibotResolver(teamFinanceSchema),
    defaultValues: {},
  })

  const loadContract = useCallback(
    async (id: number, fetchFn: (id: number) => Promise<CustomerContract | null>) => {
      setLoading(true)
      setError(null)
      setActiveTab(0)

      try {
        const data = await fetchFn(id)

        if (!data) {
          setError('Contract not found')
          return
        }

        setContract(data)

        detailsForm.reset({
          quoted_at: formatDateForInput(data.quoted_at),
          billing_at: formatDateForInput(data.billing_at),
          opened_at: formatDateForInput(data.opened_at),
          opc_at: formatDateForInput(data.opc_at),
          sent_at: formatDateForInput(data.sent_at),
          payment_at: formatDateForInput(data.payment_at),
          apf_at: formatDateForInput(data.apf_at),
          sav_at: formatDateForInput(data.sav_at),
          pre_meeting_at: formatDateForInput(data.pre_meeting_at),
          doc_at: formatDateForInput(data.doc_at ?? undefined),
          closed_at: formatDateForInput(data.closed_at),
          has_tva: data.variables?.has_tva ?? '',
          reference: data.reference || '',
          remarks: data.remarks || '',
        })

        teamFinanceForm.reset({
          telepro_id: data.telepro_id ?? undefined,
          sale_1_id: data.sale_1_id ?? undefined,
          sale_2_id: data.sale_2_id ?? undefined,
          manager_id: data.manager_id ?? undefined,
          assistant_id: data.assistant_id ?? undefined,
          installer_user_id: data.installer_user_id ?? undefined,
          team_id: data.team_id ?? undefined,
          company_id: data.company_id ?? undefined,
          financial_partner_id: data.financial_partner_id ?? undefined,
          tax_id: data.tax_id ?? undefined,
          total_price_without_taxe: data.total_price_without_taxe ?? undefined,
          total_price_with_taxe: data.total_price_with_taxe ?? undefined,
          mensuality: data.mensuality ?? undefined,
          advance_payment: data.advance_payment ?? undefined,
          polluter_id: data.polluter_id ?? undefined,
          partner_layer_id: data.partner_layer_id ?? undefined,
          campaign_id: data.campaign_id ?? undefined,
          opc_range_id: data.opc_range_id ?? undefined,
          sav_at_range_id: data.sav_at_range_id ?? undefined,
          state_id: data.state_id ?? undefined,
          install_state_id: data.install_state_id ?? undefined,
          admin_status_id: data.admin_status_id ?? undefined,
          opc_status_id: data.opc_status_id ?? undefined,
          time_state_id: data.time_state_id ?? undefined,
          is_signed: data.is_signed ?? 'NO',
          is_billable: data.is_billable ?? 'NO',
          status: data.status_flag ?? 'ACTIVE',
        })
      } catch {
        setError('Error loading contract')
      } finally {
        setLoading(false)
      }
    },
    [detailsForm, teamFinanceForm]
  )

  const getFormData = useCallback((): UpdateContractData => {
    const details = detailsForm.getValues()
    const teamFinance = teamFinanceForm.getValues()

    const merged: UpdateContractData = { ...details, ...teamFinance }

    // Wrap has_tva in variables object for backend
    if (details.has_tva !== undefined && details.has_tva !== '') {
      merged.variables = { has_tva: details.has_tva }
    }

    // Clean empty strings and undefined
    const cleaned = Object.fromEntries(
      Object.entries(merged).filter(([, v]) => v !== undefined && v !== '')
    ) as UpdateContractData

    // Keep variables even if other fields are empty
    if (merged.variables) {
      cleaned.variables = merged.variables
    }

    return cleaned
  }, [detailsForm, teamFinanceForm])

  const resetAll = useCallback(() => {
    setContract(null)
    setActiveTab(0)
    setError(null)
    setLoading(false)
    setSubmitting(false)
    detailsForm.reset({})
    teamFinanceForm.reset({})
  }, [detailsForm, teamFinanceForm])

  return {
    activeTab,
    setActiveTab,
    contract,
    loading,
    submitting,
    setSubmitting,
    error,
    setError,
    detailsForm,
    teamFinanceForm,
    loadContract,
    getFormData,
    resetAll,
  }
}
