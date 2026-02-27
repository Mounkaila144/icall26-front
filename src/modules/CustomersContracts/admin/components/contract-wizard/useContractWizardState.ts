'use client'

import { useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'

import {
  customerSchema,
  contractDetailsSchema,
  teamFinanceSchema,
  isoSchema,
} from './contractFormSchema'
import type {
  CustomerFormData,
  ContractDetailsFormData,
  TeamFinanceFormData,
  IsoFormData,
} from './contractFormSchema'
import type { CreateContractData } from '../../../types'

const TOTAL_STEPS = 5

export function useContractWizardState() {
  const [activeStep, setActiveStep] = useState(0)

  // --- Step 1: Customer ---
  const customerForm = useForm<CustomerFormData>({
    resolver: valibotResolver(customerSchema),
    defaultValues: {
      customer: {
        gender: '',
        lastname: '',
        firstname: '',
        phone: '',
        email: '',
        mobile: '',
        mobile2: '',
        company: '',
        union_id: undefined,
        address: { address1: '', address2: '', postcode: '', city: '' },
      },
    },
  })

  // --- Step 2: Contract Details ---
  const detailsForm = useForm<ContractDetailsFormData>({
    resolver: valibotResolver(contractDetailsSchema),
    defaultValues: {
      quoted_at: '',
      billing_at: '',
      opened_at: '',
      opc_at: '',
      sent_at: '',
      payment_at: '',
      apf_at: '',
      sav_at: '',
      pre_meeting_at: '',
      doc_at: '',
      closed_at: '',
      has_tva: '',
      reference: '',
      remarks: '',
    },
  })

  // --- Step 3: Team & Finance ---
  const teamFinanceForm = useForm<TeamFinanceFormData>({
    resolver: valibotResolver(teamFinanceSchema),
    defaultValues: {
      telepro_id: undefined,
      sale_1_id: undefined,
      sale_2_id: undefined,
      manager_id: undefined,
      assistant_id: undefined,
      installer_user_id: undefined,
      team_id: undefined,
      company_id: undefined,
      financial_partner_id: undefined,
      tax_id: undefined,
      total_price_without_taxe: undefined,
      total_price_with_taxe: undefined,
      mensuality: undefined,
      advance_payment: undefined,
      polluter_id: undefined,
      partner_layer_id: undefined,
      campaign_id: undefined,
      opc_range_id: undefined,
      sav_at_range_id: undefined,
      sous_traitant_id: undefined,
      rapport_installation: '',
      rapport_temps: '',
      periode_cee: '',
      surface_parcelle: '',
      state_id: undefined,
      install_state_id: undefined,
      admin_status_id: undefined,
      opc_status_id: undefined,
      time_state_id: undefined,
      is_signed: 'NO',
      is_billable: 'NO',
      status: 'ACTIVE',
    },
  })

  // --- Step 4: ISO / Domoprime ---
  const isoForm = useForm<IsoFormData>({
    resolver: valibotResolver(isoSchema),
    defaultValues: {
      fiscal_reference_1: '',
      fiscal_number_1: '',
      fiscal_reference_2: '',
      fiscal_number_2: '',
      calcul_maprimerenov_manuel: undefined,
      number_of_people: undefined,
      number_of_children: undefined,
      revenue: undefined,
      number_of_fiscal: undefined,
      number_of_parts: undefined,
      tax_credit_used: undefined,
      declarants: '',
      previous_energy_id: undefined,
      energy_id: undefined,
      occupation_id: undefined,
      layer_type_id: undefined,
      more_2_years: undefined,
      parcel_reference: '',
      parcel_surface: undefined,
      surface_home: undefined,
      surface_top: undefined,
      surface_wall: undefined,
      surface_floor: undefined,
      install_surface_top: undefined,
      install_surface_wall: undefined,
      install_surface_floor: undefined,
    },
  })

  const formByStep = [customerForm, detailsForm, teamFinanceForm, isoForm] as const

  // --- Navigation ---
  const handleNext = useCallback(async () => {
    if (activeStep < formByStep.length) {
      const currentForm = formByStep[activeStep]
      const valid = await currentForm.trigger()

      if (!valid) return false
    }

    setActiveStep(prev => Math.min(prev + 1, TOTAL_STEPS - 1))

    return true
  }, [activeStep, formByStep])

  const handleBack = useCallback(() => {
    setActiveStep(prev => Math.max(prev - 1, 0))
  }, [])

  // --- Combined data ---
  const getCombinedFormData = useCallback((): CreateContractData => {
    const customer = customerForm.getValues()
    const details = detailsForm.getValues()
    const teamFinance = teamFinanceForm.getValues()
    const iso = isoForm.getValues()

    const data: CreateContractData = {
      // Dates
      quoted_at: details.quoted_at || undefined,
      billing_at: details.billing_at || undefined,
      opened_at: details.opened_at || undefined,
      opc_at: details.opc_at || undefined,
      sent_at: details.sent_at || undefined,
      payment_at: details.payment_at || undefined,
      apf_at: details.apf_at || undefined,
      sav_at: details.sav_at || undefined,
      pre_meeting_at: details.pre_meeting_at || undefined,
      doc_at: details.doc_at || undefined,
      closed_at: details.closed_at || undefined,

      // Other details
      has_tva: details.has_tva || undefined,
      reference: details.reference || undefined,
      remarks: details.remarks || undefined,

      // Team & finance (spread all fields)
      ...teamFinance,

      // Status
      is_signed: teamFinance.is_signed ?? 'NO',
      is_billable: teamFinance.is_billable ?? 'NO',
      status: teamFinance.status ?? 'ACTIVE',
    }

    data.customer = {
      gender: customer.customer?.gender || undefined,
      lastname: customer.customer?.lastname ?? '',
      firstname: customer.customer?.firstname ?? '',
      phone: customer.customer?.phone ?? '',
      email: customer.customer?.email || undefined,
      mobile: customer.customer?.mobile || undefined,
      mobile2: customer.customer?.mobile2 || undefined,
      company: customer.customer?.company || undefined,
      union_id: customer.customer?.union_id,
      address: {
        address1: customer.customer?.address?.address1 ?? '',
        address2: customer.customer?.address?.address2 || undefined,
        postcode: customer.customer?.address?.postcode ?? '',
        city: customer.customer?.address?.city ?? '',
      },
    }

    // ISO / Domoprime data (separate object like Symfony params.CustomerContract.iso)
    const isoData = Object.fromEntries(
      Object.entries(iso).filter(([, v]) => v !== undefined && v !== '')
    )

    if (Object.keys(isoData).length > 0) {
      data.iso = isoData as CreateContractData['iso']
    }

    return data
  }, [customerForm, detailsForm, teamFinanceForm, isoForm])

  // --- Reset ---
  const resetAll = useCallback(() => {
    setActiveStep(0)
    customerForm.reset()
    detailsForm.reset()
    teamFinanceForm.reset()
    isoForm.reset()
  }, [customerForm, detailsForm, teamFinanceForm, isoForm])

  return {
    activeStep,
    totalSteps: TOTAL_STEPS,
    customerForm,
    detailsForm,
    teamFinanceForm,
    isoForm,
    handleNext,
    handleBack,
    getCombinedFormData,
    resetAll,
  }
}
