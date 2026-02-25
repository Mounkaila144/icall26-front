import type { ReactNode } from 'react'

import type { ColumnConfig } from '@/components/shared/DataTable'
import type { ContractTranslations } from '../../hooks/useContractTranslations'
import type { CustomerContract } from '../../../types'

import { isYes, getCustomerFullName, formatPrice } from './helpers'
import { textCell, booleanChip, statusChip, dateCellMultiLine, customerCell, phoneCell } from './cell-renderers'

export interface ContractColumnDef extends ColumnConfig {
  /**
   * Maps to a backend permission key from ContractListResource::FIELD_PERMISSIONS.
   * If set, this column is only visible when the key is present in meta.permitted_fields.
   * If omitted, the column is always visible.
   */
  permissionKey?: string
  /**
   * Frontend credential check matching Symfony's $user->hasCredential() pattern.
   * Format: [['perm1', 'perm2']] = OR logic (any credential suffices).
   * If set, column is hidden when hasCredential returns false.
   */
  credential?: string[][]
  getValue: (row: CustomerContract) => any
  renderCell: (row: CustomerContract) => ReactNode
}

export const STORAGE_KEY = 'contractsListTableColumns'

/**
 * Column definitions ordered to match the Symfony 1 template.
 * Now a function that receives translations for i18n column labels & cell text.
 */
export function getColumnDefs(t: ContractTranslations): ContractColumnDef[] {
  return [
    // ── 1. Date ──
    {
      id: 'date', label: t.colDate, defaultVisible: true,
      getValue: r => r.opened_at,
      renderCell: r => dateCellMultiLine(r, t)
    },

    // ── 2. Client ──
    {
      id: 'customer_name', label: t.colClient, defaultVisible: true,
      permissionKey: 'customer',
      getValue: r => getCustomerFullName(r),
      renderCell: r => customerCell(r)
    },

    // ── 3. Société Porteuse ──
    {
      id: 'company', label: t.colCompany, defaultVisible: true,
      permissionKey: 'company',
      getValue: r => r.company?.name,
      renderCell: r => textCell(r.company?.name)
    },

    // ── 4. Facturable ──
    {
      id: 'is_billable', label: t.colBillable, defaultVisible: true,
      getValue: r => r.is_billable,
      renderCell: r => booleanChip(isYes(r.is_billable), t.chipYes, t.chipNo, 'success', 'error')
    },

    // ── 5. Téléphone ──
    {
      id: 'customer_phone', label: t.colPhone, defaultVisible: true,
      permissionKey: 'customer_phone',
      getValue: r => r.customer?.phone,
      renderCell: r => phoneCell(r)
    },

    // ── 6. Code Postal ──
    {
      id: 'customer_postcode', label: t.colPostcode, defaultVisible: true,
      permissionKey: 'customer_postcode',
      getValue: r => r.customer?.address?.postcode,
      renderCell: r => textCell(r.customer?.address?.postcode?.toUpperCase())
    },

    // ── 7. Ville ──
    {
      id: 'customer_city', label: t.colCity, defaultVisible: true,
      permissionKey: 'customer_city',
      getValue: r => r.customer?.address?.city,
      renderCell: r => textCell(r.customer?.address?.city?.toUpperCase())
    },

    // ── 8. Commercial 1 ──
    {
      id: 'sale1', label: t.colSale1, defaultVisible: true,
      permissionKey: 'sale1',
      credential: [['superadmin', 'admin', 'contract_list_view_sale1']],
      getValue: r => r.sale1?.name,
      renderCell: r => textCell(r.sale1?.name)
    },

    // ── 9. Commercial 2 ──
    {
      id: 'sale2', label: t.colSale2, defaultVisible: true,
      permissionKey: 'sale2',
      credential: [['superadmin', 'admin', 'contract_list_view_sale2']],
      getValue: r => r.sale2?.name,
      renderCell: r => textCell(r.sale2?.name)
    },

    // ── 10. Télépro ──
    {
      id: 'telepro', label: t.colTelepro, defaultVisible: true,
      permissionKey: 'telepro',
      getValue: r => r.telepro?.name,
      renderCell: r => textCell(r.telepro?.name)
    },

    // ── 11. Assistant ──
    {
      id: 'assistant', label: t.colAssistant, defaultVisible: true,
      permissionKey: 'assistant',
      credential: [['superadmin', 'admin', 'contract_view_list_assistant', 'contract_list_display_assistant']],
      getValue: r => r.assistant?.name,
      renderCell: r => textCell(r.assistant?.name)
    },

    // ── 12. Équipe Installation ──
    {
      id: 'financial_partner', label: t.colFinancialPartner, defaultVisible: true,
      permissionKey: 'financial_partner',
      credential: [['superadmin', 'admin', 'contract_view_list_partner']],
      getValue: r => r.financial_partner?.name,
      renderCell: r => textCell(r.financial_partner?.name)
    },

    // ── 13. Sous-traitant ──
    {
      id: 'partner_layer', label: t.colPartnerLayer, defaultVisible: true,
      permissionKey: 'partner_layer',
      credential: [['superadmin', 'admin', 'contract_view_list_partner_layer']],
      getValue: r => r.partner_layer?.name,
      renderCell: r => textCell(r.partner_layer?.name)
    },

    // ── 14. Statut Attribution (OPC) ──
    {
      id: 'opc_status', label: t.colOpcStatus, defaultVisible: true,
      permissionKey: 'opc_status',
      credential: [['superadmin', 'admin', 'contract_view_list_opc_status']],
      getValue: r => r.opc_status?.value ?? r.opc_status?.name,
      renderCell: r => statusChip(r.opc_status)
    },

    // ── 15. Statut Admin ──
    {
      id: 'admin_status', label: t.colAdminStatus, defaultVisible: true,
      permissionKey: 'admin_status',
      credential: [['superadmin', 'admin', 'contract_view_list_admin_status']],
      getValue: r => r.admin_status?.value ?? r.admin_status?.name,
      renderCell: r => statusChip(r.admin_status)
    },

    // ── 16. Statut Temps ──
    {
      id: 'time_status', label: t.colTimeStatus, defaultVisible: true,
      permissionKey: 'time_status',
      credential: [['superadmin', 'contract_view_list_time_state']],
      getValue: r => r.time_status?.value ?? r.time_status?.name,
      renderCell: r => statusChip(r.time_status)
    },

    // ── 17. Obligé ──
    {
      id: 'polluter', label: t.colPolluter, defaultVisible: true,
      permissionKey: 'polluter',
      credential: [['superadmin', 'admin', 'contract_view_list_polluter']],
      getValue: r => r.polluter?.name,
      renderCell: r => textCell(r.polluter?.name)
    },

    // ── 18. Régie / Équipe ──
    {
      id: 'team', label: t.colTeam, defaultVisible: true,
      permissionKey: 'team',
      credential: [['superadmin', 'admin', 'contract_view_list_team', 'contract_list_display_team']],
      getValue: r => r.team?.name,
      renderCell: r => textCell(r.team?.name)
    },

    // ── 19. Confirmé ──
    {
      id: 'is_confirmed', label: t.colConfirmed, defaultVisible: true,
      permissionKey: 'is_confirmed',
      credential: [['superadmin', 'contract_view_list_confirmed']],
      getValue: r => r.is_confirmed,
      renderCell: r => booleanChip(isYes(r.is_confirmed), t.chipConfirmed, t.chipNotConfirmed, 'success', 'warning')
    },

    // ── 20. Bloqué ──
    {
      id: 'is_hold', label: t.colBlocked, defaultVisible: true,
      permissionKey: 'is_hold',
      credential: [['superadmin', 'admin', 'contract_view_list_hold']],
      getValue: r => r.is_hold,
      renderCell: r => booleanChip(isYes(r.is_hold), t.chipYes, t.chipNo, 'error', 'success')
    },

    // ── 21. Devis Bloqué ──
    {
      id: 'is_hold_quote', label: t.colQuoteBlocked, defaultVisible: true,
      permissionKey: 'is_hold_quote',
      credential: [['superadmin', 'contract_view_list_hold_quote']],
      getValue: r => r.is_hold_quote,
      renderCell: r => booleanChip(isYes(r.is_hold_quote), t.chipYes, t.chipNo, 'error', 'success')
    },

    // ── 22. Document ──
    {
      id: 'is_document', label: t.colDocument, defaultVisible: true,
      permissionKey: 'is_document',
      getValue: r => r.is_document,
      renderCell: r => booleanChip(isYes(r.is_document), t.chipYes, t.chipNo, 'success', 'default')
    },

    // ── 23. Photo ──
    {
      id: 'is_photo', label: t.colPhoto, defaultVisible: true,
      permissionKey: 'is_photo',
      getValue: r => r.is_photo,
      renderCell: r => booleanChip(isYes(r.is_photo), t.chipYes, t.chipNo, 'success', 'default')
    },

    // ── 24. Qualité ──
    {
      id: 'is_quality', label: t.colQuality, defaultVisible: true,
      permissionKey: 'is_quality',
      getValue: r => r.is_quality,
      renderCell: r => booleanChip(isYes(r.is_quality), t.chipValidated, t.chipPending, 'success', 'default')
    },

    // ── 25. Créateur ──
    {
      id: 'creator', label: t.colCreator, defaultVisible: true,
      permissionKey: 'creator',
      getValue: r => r.creator?.name,
      renderCell: r => textCell(r.creator?.name)
    },

    // ── 26. Campagne ──
    {
      id: 'campaign', label: t.colCampaign, defaultVisible: false,
      permissionKey: 'campaign',
      getValue: r => r.campaign?.name,
      renderCell: r => textCell(r.campaign?.name)
    },

    // ── 27. Attributions (contributors) ──
    {
      id: 'contributor', label: t.colContributor, defaultVisible: false,
      permissionKey: 'contributor',
      getValue: r => r.contributor_summary,
      renderCell: r => textCell(r.contributor_summary)
    },

    // ── 28. Surface Habitation ──
    {
      id: 'surface_home', label: t.colSurfaceHome, defaultVisible: false,
      getValue: r => r.surface_home,
      renderCell: r => textCell(r.surface_home)
    },

    // ── 29. Surface 101 (Combles) ──
    {
      id: 'surface_top', label: t.colSurfaceTop, defaultVisible: false,
      permissionKey: 'surface_top',
      credential: [['app_domoprime_iso_contract_list_surface_101', 'app_domoprime_contract_list_surface_from_forms_101', 'app_domoprime_iso_contract_list_surface_from_form_101']],
      getValue: r => r.surface_top,
      renderCell: r => textCell(r.surface_top)
    },

    // ── 30. Surface 102 (Murs) ──
    {
      id: 'surface_wall', label: t.colSurfaceWall, defaultVisible: false,
      permissionKey: 'surface_wall',
      credential: [['app_domoprime_iso_contract_list_surface_102', 'app_domoprime_contract_list_surface_from_forms_102', 'app_domoprime_iso_contract_list_surface_from_form_102']],
      getValue: r => r.surface_wall,
      renderCell: r => textCell(r.surface_wall)
    },

    // ── 31. Surface 103 (Plancher) ──
    {
      id: 'surface_floor', label: t.colSurfaceFloor, defaultVisible: false,
      permissionKey: 'surface_floor',
      credential: [['app_domoprime_iso_contract_list_surface_103', 'app_domoprime_contract_list_surface_from_forms_103', 'app_domoprime_iso_contract_list_surface_from_form_103']],
      getValue: r => r.surface_floor,
      renderCell: r => textCell(r.surface_floor)
    },

    // ── 32. Surface Parcelle ──
    {
      id: 'surface_parcel', label: t.colSurfaceParcel, defaultVisible: false,
      permissionKey: 'surface_parcel',
      credential: [['superadmin', 'app_domoprime_iso_contract_list_surface_parcel']],
      getValue: r => r.surface_parcel,
      renderCell: r => textCell(r.surface_parcel)
    },

    // ── 33. Tarification ──
    {
      id: 'pricing', label: t.colPricing, defaultVisible: false,
      permissionKey: 'pricing',
      getValue: r => r.pricing,
      renderCell: r => textCell(r.pricing)
    },

    // ── 34. Classe Énergie ──
    {
      id: 'class_energy', label: t.colClassEnergy, defaultVisible: false,
      permissionKey: 'class_energy',
      credential: [['app_domoprime_iso_contract_list_filter_header_class', 'contract_list_calculation_class_pager']],
      getValue: r => r.class_energy,
      renderCell: r => textCell(r.class_energy)
    },

    // ── 35. Statut Contrat ──
    {
      id: 'contract_status', label: t.colContractStatus, defaultVisible: true,
      permissionKey: 'contract_status',
      getValue: r => r.contract_status?.value ?? r.contract_status?.name,
      renderCell: r => statusChip(r.contract_status)
    },

    // ── 36. Statut Installation ──
    {
      id: 'install_status', label: t.colInstallStatus, defaultVisible: true,
      permissionKey: 'install_status',
      credential: [['superadmin', 'contract_list_install_state']],
      getValue: r => r.install_status?.value ?? r.install_status?.name,
      renderCell: r => statusChip(r.install_status)
    },

    // ── 37. Statut ──
    {
      id: 'status', label: t.colStatus, defaultVisible: true,
      permissionKey: 'status',
      credential: [['superadmin', 'admin', 'contract_list_status']],
      getValue: r => r.status,
      renderCell: r => booleanChip(r.status === 'ACTIVE', t.chipActive, t.statusDeleted, 'success', 'error')
    },

    // ── 38. Montant TTC ──
    {
      id: 'montant_ttc', label: t.colAmountTtc, defaultVisible: true,
      getValue: r => r.total_price_with_taxe,
      renderCell: r => textCell(formatPrice(r.total_price_with_taxe), 'font-semibold', 'success.main')
    },
  ]
}

/**
 * @deprecated Use getColumnDefs(t) instead. Kept for default visibility initialization.
 */
export const COLUMN_DEF_IDS = [
  'date', 'customer_name', 'company', 'is_billable', 'customer_phone',
  'customer_postcode', 'customer_city', 'sale1', 'sale2', 'telepro',
  'assistant', 'financial_partner', 'partner_layer', 'opc_status',
  'admin_status', 'time_status', 'polluter', 'team', 'is_confirmed',
  'is_hold', 'is_hold_quote', 'is_document', 'is_photo', 'is_quality',
  'creator', 'campaign', 'contributor', 'surface_home', 'surface_top',
  'surface_wall', 'surface_floor', 'surface_parcel', 'pricing',
  'class_energy', 'contract_status', 'install_status', 'status', 'montant_ttc',
] as const
