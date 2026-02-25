import {
  object,
  string,
  number,
  optional,
  pipe,
  nonEmpty,
  union,
  literal,
} from 'valibot'
import type { InferInput } from 'valibot'

// ---------------------------------------------------------------------------
// Step 1 – Customer (always new)
// ---------------------------------------------------------------------------

export const customerSchema = object({
  customer: object({
    gender: optional(string()),
    lastname: pipe(string(), nonEmpty('Required')),
    firstname: pipe(string(), nonEmpty('Required')),
    phone: pipe(string(), nonEmpty('Required')),
    email: optional(string()),
    mobile: optional(string()),
    mobile2: optional(string()),
    company: optional(string()),
    union_id: optional(number()),
    address: object({
      address1: pipe(string(), nonEmpty('Required')),
      address2: optional(string()),
      postcode: pipe(string(), nonEmpty('Required')),
      city: pipe(string(), nonEmpty('Required')),
    }),
  }),
})

export type CustomerFormData = InferInput<typeof customerSchema>

// ---------------------------------------------------------------------------
// Step 2 – Contract Details (dates + reference + remarks)
// All dates are optional in schema since "remove" credentials can hide them.
// Visual "required" is handled in the component.
// ---------------------------------------------------------------------------

export const contractDetailsSchema = object({
  // Dates that are shown by default (can be hidden by "remove" credentials)
  quoted_at: optional(string()),
  billing_at: optional(string()),
  opened_at: optional(string()),
  opc_at: optional(string()),
  sent_at: optional(string()),
  payment_at: optional(string()),
  apf_at: optional(string()),

  // Dates shown only with "show" credentials
  sav_at: optional(string()),
  pre_meeting_at: optional(string()),
  doc_at: optional(string()),
  closed_at: optional(string()),

  // Installation date
  install_at: optional(string()),

  // Other
  has_tva: optional(string()),
  reference: optional(string()),
  remarks: optional(string()),
})

export type ContractDetailsFormData = InferInput<typeof contractDetailsSchema>

// ---------------------------------------------------------------------------
// Step 3 – Team, Finance & Status (all optional)
// ---------------------------------------------------------------------------

export const teamFinanceSchema = object({
  // Team (attribution credentials)
  telepro_id: optional(number()),
  sale_1_id: optional(number()),
  sale_2_id: optional(number()),
  manager_id: optional(number()),
  assistant_id: optional(number()),
  installer_user_id: optional(number()),
  team_id: optional(number()),
  company_id: optional(number()),

  // Finance
  financial_partner_id: optional(number()),
  tax_id: optional(number()),
  total_price_without_taxe: optional(number()),
  total_price_with_taxe: optional(number()),
  mensuality: optional(number()),
  advance_payment: optional(number()),

  // Additional references (permission-gated)
  polluter_id: optional(number()),
  partner_layer_id: optional(number()),
  campaign_id: optional(number()),
  opc_range_id: optional(number()),
  sav_at_range_id: optional(number()),

  // Sous-traitant
  sous_traitant_id: optional(number()),

  // Reports
  rapport_installation: optional(string()),
  rapport_temps: optional(string()),

  // Other
  periode_cee: optional(string()),
  surface_parcelle: optional(string()),

  // Status
  state_id: optional(number()),
  install_state_id: optional(number()),
  admin_status_id: optional(number()),
  opc_status_id: optional(number()),
  time_state_id: optional(number()),
  is_signed: optional(union([literal('YES'), literal('NO')])),
  is_billable: optional(union([literal('YES'), literal('NO')])),
  status: optional(union([literal('ACTIVE'), literal('DELETE')])),
})

export type TeamFinanceFormData = InferInput<typeof teamFinanceSchema>

// ---------------------------------------------------------------------------
// Step 4 – Isolation + (ISO / Domoprime data)
// Matches Symfony app_domoprime_iso: t_domoprime_iso_customer_request
// No permission checks in Symfony (all fields use hasValidator only)
// ---------------------------------------------------------------------------

export const isoSchema = object({
  // Informations fiscales
  fiscal_reference_1: optional(string()),
  fiscal_number_1: optional(string()),
  fiscal_reference_2: optional(string()),
  fiscal_number_2: optional(string()),

  // Fiscal
  calcul_maprimerenov_manuel: optional(union([literal('YES'), literal('NO')])),
  number_of_people: optional(number()),
  number_of_children: optional(number()),
  revenue: optional(number()),
  number_of_fiscal: optional(number()),
  number_of_parts: optional(number()),
  tax_credit_used: optional(number()),
  declarants: optional(string()),

  // Habitat
  previous_energy_id: optional(number()),
  energy_id: optional(number()),
  occupation_id: optional(number()),
  layer_type_id: optional(number()),
  more_2_years: optional(union([literal('YES'), literal('NO')])),
  parcel_reference: optional(string()),
  parcel_surface: optional(number()),
  surface_home: optional(number()),

  // Surfaces
  surface_top: optional(number()),
  surface_wall: optional(number()),
  surface_floor: optional(number()),

  // Surfaces Installateur
  install_surface_top: optional(number()),
  install_surface_wall: optional(number()),
  install_surface_floor: optional(number()),
})

export type IsoFormData = InferInput<typeof isoSchema>
