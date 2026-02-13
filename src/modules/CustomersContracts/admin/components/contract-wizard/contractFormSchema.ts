import {
  object,
  string,
  number,
  optional,
  pipe,
  nonEmpty,
  union,
  literal,
  variant,
} from 'valibot'
import type { InferInput } from 'valibot'

// ---------------------------------------------------------------------------
// Step 1 – Customer
// ---------------------------------------------------------------------------

const existingCustomerSchema = object({
  customerMode: literal('existing'),
  customer_id: number(),
  customer: optional(
    object({
      gender: optional(string()),
      lastname: optional(string()),
      firstname: optional(string()),
      phone: optional(string()),
      email: optional(string()),
      mobile: optional(string()),
      mobile2: optional(string()),
      company: optional(string()),
      union_id: optional(number()),
      address: optional(
        object({
          address1: optional(string()),
          address2: optional(string()),
          postcode: optional(string()),
          city: optional(string()),
        })
      ),
    })
  ),
})

const newCustomerSchema = object({
  customerMode: literal('new'),
  customer_id: optional(number()),
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

export const customerSchema = variant('customerMode', [
  existingCustomerSchema,
  newCustomerSchema,
])

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
