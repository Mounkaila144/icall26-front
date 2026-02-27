'use client';

import React, { useState, useCallback, useMemo } from 'react';

import type { CreateContractData } from '../../types';
import { useContractTranslations } from '../hooks/useContractTranslations';
import type { ContractTranslations } from '../hooks/useContractTranslations';
import { getInitialFormData, createHandleInputChange } from './contract-modal/contractFormDefaults';
import ModalShell from './contract-modal/ModalShell';
import CollapsibleSection from './contract-modal/CollapsibleSection';
import {
  DatesFields,
  CustomerFields,
  TeamFields,
  FinancialFields,
  StatusFields,
  OtherFields,
} from './contract-modal/ContractFormFields';
import type { FieldSectionProps } from './contract-modal/ContractFormFields';
import { useContractFormPermissions } from './contract-modal/useContractFormPermissions';
import { useFilterOptions } from '../hooks/useFilterOptions';

interface CreateContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: CreateContractData) => Promise<void>;
}

type SectionKey = 'dates' | 'customer' | 'team' | 'financial' | 'status' | 'other';

interface SectionDef {
  key: SectionKey;
  titleKey: keyof ContractTranslations;
  icon: string;
  Component: React.ComponentType<FieldSectionProps>;
}

const SECTIONS: SectionDef[] = [
  { key: 'dates', titleKey: 'sectionDates', icon: '\uD83D\uDCC5', Component: DatesFields },
  { key: 'customer', titleKey: 'sectionCustomer', icon: '\uD83D\uDC64', Component: CustomerFields },
  { key: 'team', titleKey: 'sectionTeam', icon: '\uD83D\uDC65', Component: TeamFields },
  { key: 'financial', titleKey: 'sectionFinancial', icon: '\uD83D\uDCB0', Component: FinancialFields },
  { key: 'status', titleKey: 'sectionStatus', icon: '\u2699\uFE0F', Component: StatusFields },
  { key: 'other', titleKey: 'sectionOther', icon: '\uD83D\uDCDD', Component: OtherFields },
];

export default function CreateContractModal({ isOpen, onClose, onCreate }: CreateContractModalProps) {
  const t = useContractTranslations();
  const hiddenFieldsSet = useContractFormPermissions();
  const hiddenFields = useMemo(() => Array.from(hiddenFieldsSet), [hiddenFieldsSet]);
  const { filterOptions } = useFilterOptions();
  const [formData, setFormData] = useState(getInitialFormData());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>({
    dates: true,
    customer: true,
    team: false,
    financial: false,
    status: false,
    other: false,
  });

  const toggleSection = useCallback((section: SectionKey) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  }, []);

  const handleInputChange = useMemo(() => createHandleInputChange(setFormData), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const cleanData = Object.fromEntries(
        Object.entries(formData).filter(([_, v]) => v !== undefined && v !== '')
      );

      await onCreate(cleanData as CreateContractData);
      setFormData(getInitialFormData());
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create contract');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalShell
      title={t.newContract}
      error={error}
      loading={loading}
      submitLabel={t.createContract}
      loadingLabel={t.creating}
      cancelLabel={t.cancel}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      {SECTIONS.map(({ key, titleKey, icon, Component }) => (
        <CollapsibleSection
          key={key}
          title={t[titleKey]}
          icon={icon}
          isOpen={openSections[key]}
          onToggle={() => toggleSection(key)}
        >
          <Component formData={formData} handleInputChange={handleInputChange} hiddenFields={hiddenFields} filterOptions={filterOptions} t={t} />
        </CollapsibleSection>
      ))}
    </ModalShell>
  );
}
