import {
  object,
  string,
  number,
  optional,
  union,
  literal,
} from 'valibot'
import type { InferInput } from 'valibot'

// ---------------------------------------------------------------------------
// Edit: Contract Details (dates, TVA, reference, remarks)
// The edit module has its own schema — independent of the wizard's field split.
// ---------------------------------------------------------------------------

export const contractDetailsSchema = object({
  quoted_at: optional(string()),
  billing_at: optional(string()),
  opened_at: optional(string()),
  opc_at: optional(string()),
  sent_at: optional(string()),
  payment_at: optional(string()),
  apf_at: optional(string()),
  sav_at: optional(string()),
  pre_meeting_at: optional(string()),
  doc_at: optional(string()),
  closed_at: optional(string()),
  has_tva: optional(string()),
  reference: optional(string()),
  remarks: optional(string()),
})

export type ContractDetailsFormData = InferInput<typeof contractDetailsSchema>

// ---------------------------------------------------------------------------
// Edit: Team, Finance & Status
// ---------------------------------------------------------------------------

export const teamFinanceSchema = object({
  // Team
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

  // References
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
