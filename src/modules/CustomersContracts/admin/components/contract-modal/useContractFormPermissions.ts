'use client'

import { useMemo } from 'react'
import { useWizardPermissions } from '../contract-wizard/useWizardPermissions'

/**
 * Permission hook for the simple contract creation modal.
 * Mirrors the same Symfony credential logic used in the wizard.
 *
 * Returns a set of `hiddenFields` names that should not be rendered.
 */
export function useContractFormPermissions(): Set<string> {
  const { canShow, canShowForAdmin, shouldRemove } = useWizardPermissions()

  return useMemo(() => {
    const hidden = new Set<string>()

    // --- Dates (REMOVE credentials) ---
    if (shouldRemove('contract_new_remove_opened_at')) hidden.add('opened_at')
    if (shouldRemove('contract_new_opc_at_remove')) hidden.add('opc_at')
    if (shouldRemove('contract_new_payment_at_remove')) hidden.add('payment_at')
    if (shouldRemove('contract_new_apf_at_remove')) hidden.add('apf_at')

    // --- Team — Symfony: ['superadmin', 'admin', 'credential'] ---
    if (!canShowForAdmin('contract_attributions_modify_telepro')) hidden.add('telepro_id')
    if (!canShowForAdmin('contract_attributions_modify_sale1')) hidden.add('sale_1_id')
    if (!canShowForAdmin('contract_attributions_modify_sale2')) hidden.add('sale_2_id')
    if (!canShowForAdmin('contract_attributions_modify_managers')) hidden.add('manager_id')
    if (!canShowForAdmin('contract_attributions_modify_assistant')) hidden.add('assistant_id')
    // --- Team — Symfony: ['superadmin', 'credential'] ---
    if (!canShow('contract_new_installer_user')) hidden.add('installer_user_id')
    if (!canShow('contract_new_contract_company')) hidden.add('company_id')
    if (shouldRemove('contract_attributions_modify_no_team')) hidden.add('team_id')

    // --- Financial (REMOVE + template-level SHOW) ---
    if (shouldRemove('contract_new_financial_partner_remove')) hidden.add('financial_partner_id')
    if (shouldRemove('contract_new_total_price_with_taxe_remove') || !canShow('contract_new_total_price_with_taxe')) hidden.add('total_price_with_taxe')
    if (shouldRemove('contract_new_total_price_without_taxe_remove') || !canShow('contract_new_total_price_without_taxe')) hidden.add('total_price_without_taxe')
    if (shouldRemove('contract_new_tax_id_remove') || !canShow('contract_new_tva')) hidden.add('tax_id')

    // --- Status (mixed) ---
    if (shouldRemove('contract_new_remove_state')) hidden.add('state_id')
    if (!canShowForAdmin('contract_new_admin_status')) hidden.add('admin_status_id')
    if (!canShowForAdmin('contract_new_opc_range')) hidden.add('opc_range_id')

    // --- Other ---
    if (shouldRemove('contract_new_reference_remove')) hidden.add('reference')
    if (!canShow('contract_new_remarks')) hidden.add('remarks')

    return hidden
  }, [canShow, canShowForAdmin, shouldRemove])
}
