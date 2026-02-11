'use client';

import React, { useState, useEffect } from 'react';

import type { UpdateContractData, CustomerContract } from '../../types';
import { useContractTranslations } from '../hooks/useContractTranslations';
import type { ContractTranslations } from '../hooks/useContractTranslations';
import { getInitialFormData, createHandleInputChange, formatDateForInput } from './contract-modal/contractFormDefaults';
import type { ContractFormData } from './contract-modal/contractFormDefaults';
import ModalShell from './contract-modal/ModalShell';
import {
  tabsContainerStyle,
  getTabStyle,
  tabContentStyle,
} from './contract-modal/contractModalStyles';
import {
  DatesFields,
  CustomerFields,
  TeamFields,
  FinancialFields,
  StatusFields,
  OtherFields,
} from './contract-modal/ContractFormFields';
import type { FieldSectionProps } from './contract-modal/ContractFormFields';

interface EditContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: number, data: UpdateContractData) => Promise<void>;
  contractId: number | null;
  onFetchContract: (id: number) => Promise<CustomerContract | null>;
}

type TabKey = 'contract' | 'customer' | 'team' | 'financial' | 'status' | 'other';

interface TabDef {
  key: TabKey;
  labelKey: keyof ContractTranslations;
  icon: string;
  Component: React.ComponentType<FieldSectionProps>;
}

const TABS: TabDef[] = [
  { key: 'contract', labelKey: 'tabContract', icon: '\uD83D\uDCC5', Component: DatesFields },
  { key: 'customer', labelKey: 'tabClient', icon: '\uD83D\uDC64', Component: CustomerFields },
  { key: 'team', labelKey: 'tabTeam', icon: '\uD83D\uDC65', Component: TeamFields },
  { key: 'financial', labelKey: 'tabFinances', icon: '\uD83D\uDCB0', Component: FinancialFields },
  { key: 'status', labelKey: 'tabStatus', icon: '\u2699\uFE0F', Component: StatusFields },
  { key: 'other', labelKey: 'tabOther', icon: '\uD83D\uDCDD', Component: OtherFields },
];

const DISABLED_FIELDS = ['reference', 'customer_id'];
const HIDDEN_FIELDS = ['customer.union_id'];

export default function EditContractModal({ isOpen, onClose, onUpdate, contractId, onFetchContract }: EditContractModalProps) {
  const t = useContractTranslations();
  const [contract, setContract] = useState<CustomerContract | null>(null);
  const [loadingContract, setLoadingContract] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('contract');
  const [formData, setFormData] = useState<ContractFormData>(getInitialFormData());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load contract data when modal opens
  useEffect(() => {
    const loadContract = async () => {
      if (isOpen && contractId) {
        setLoadingContract(true);
        setError(null);

        try {
          const fetchedContract = await onFetchContract(contractId);

          if (fetchedContract) {
            setContract(fetchedContract);

            setFormData({
              quoted_at: formatDateForInput(fetchedContract.quoted_at),
              billing_at: formatDateForInput(fetchedContract.billing_at),
              opc_at: formatDateForInput(fetchedContract.opc_at),
              opened_at: formatDateForInput(fetchedContract.opened_at),
              sent_at: formatDateForInput(fetchedContract.sent_at),
              payment_at: formatDateForInput(fetchedContract.payment_at),
              apf_at: formatDateForInput(fetchedContract.apf_at),

              reference: fetchedContract.reference || '',
              customer_id: fetchedContract.customer_id,
              meeting_id: fetchedContract.meeting_id || undefined,
              financial_partner_id: fetchedContract.financial_partner_id || undefined,
              tax_id: fetchedContract.tax_id || undefined,
              team_id: fetchedContract.team_id || undefined,
              telepro_id: fetchedContract.telepro_id || undefined,
              sale_1_id: fetchedContract.sale_1_id || undefined,
              sale_2_id: fetchedContract.sale_2_id || undefined,
              manager_id: fetchedContract.manager_id || undefined,
              assistant_id: fetchedContract.assistant_id || undefined,
              installer_user_id: fetchedContract.installer_user_id || undefined,
              opened_at_range_id: fetchedContract.opened_at_range_id || undefined,
              opc_range_id: fetchedContract.opc_range_id || undefined,
              state_id: fetchedContract.state_id || undefined,
              install_state_id: fetchedContract.install_state_id || undefined,
              admin_status_id: fetchedContract.admin_status_id || undefined,
              company_id: fetchedContract.company_id || undefined,

              total_price_with_taxe: fetchedContract.total_price_with_taxe || undefined,
              total_price_without_taxe: fetchedContract.total_price_without_taxe || undefined,

              remarks: fetchedContract.remarks || '',
              variables: fetchedContract.variables || undefined,
              is_signed: fetchedContract.is_signed || 'NO',
              status: fetchedContract.status_flag || 'ACTIVE',

              customer: {
                lastname: fetchedContract.customer?.lastname || '',
                firstname: fetchedContract.customer?.firstname || '',
                phone: fetchedContract.customer?.phone || '',
                address: {
                  address1: fetchedContract.customer?.addresses?.[0]?.address1 || '',
                  postcode: fetchedContract.customer?.addresses?.[0]?.postcode || '',
                  city: fetchedContract.customer?.addresses?.[0]?.city || '',
                },
              },

              products: fetchedContract.products?.map(p => ({
                product_id: p.product_id,
                details: p.details,
              })) || [],
            });
          } else {
            setError(t.loadError);
          }
        } catch (err) {
          setError(t.loadErrorGeneric);
          console.error('Error loading contract:', err);
        } finally {
          setLoadingContract(false);
        }
      }
    };

    loadContract();
  }, [isOpen, contractId, onFetchContract, t.loadError, t.loadErrorGeneric]);

  const handleInputChange = createHandleInputChange(setFormData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract) return;

    setError(null);
    setLoading(true);

    try {
      const updateData = { ...formData };

      if (updateData.variables !== undefined) {
        if (Array.isArray(updateData.variables) || typeof updateData.variables === 'object') {
          updateData.variables = JSON.stringify(updateData.variables);
        }
      }

      const cleanData = Object.fromEntries(
        Object.entries(updateData).filter(([_, v]) => v !== undefined && v !== '')
      );

      await onUpdate(contract.id, cleanData as UpdateContractData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update contract');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Loading state
  if (loadingContract) {
    return (
      <ModalShell
        title={t.editContract}
        error={error}
        loading={false}
        submitLabel=""
        loadingLabel=""
        cancelLabel={t.cancel}
        onClose={onClose}
        onSubmit={(e) => e.preventDefault()}
        afterForm={
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        }
      >
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div
            style={{
              display: 'inline-block',
              width: '40px',
              height: '40px',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #667eea',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
          <p style={{ marginTop: '16px', color: '#666' }}>{t.loadingContract}</p>
        </div>
      </ModalShell>
    );
  }

  if (!contract) return null;

  const activeTabDef = TABS.find(tab => tab.key === activeTab)!;
  const ActiveComponent = activeTabDef.Component;

  return (
    <ModalShell
      title={t.editContract}
      subtitle={`${t.referenceLabel}: ${contract.reference}`}
      error={error}
      loading={loading}
      submitLabel={t.updateContract}
      loadingLabel={t.updating}
      cancelLabel={t.cancel}
      onClose={onClose}
      onSubmit={handleSubmit}
      afterForm={
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      }
    >
      {/* Tabs Navigation */}
      <div style={tabsContainerStyle}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            style={getTabStyle(activeTab === tab.key)}
            onMouseEnter={(e) => {
              if (activeTab !== tab.key) {
                e.currentTarget.style.background = 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.key) {
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            <span>{tab.icon}</span>
            <span>{t[tab.labelKey]}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={tabContentStyle}>
        <ActiveComponent
          formData={formData}
          handleInputChange={handleInputChange}
          disabledFields={DISABLED_FIELDS}
          hiddenFields={HIDDEN_FIELDS}
          t={t}
        />
      </div>
    </ModalShell>
  );
}
