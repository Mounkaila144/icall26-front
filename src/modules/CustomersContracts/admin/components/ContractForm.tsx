// ============================================================================
// CustomersContracts Module - Contract Form Component
// ============================================================================
// Form component for creating and editing contracts
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import { useContractForm } from '../hooks/useContractForm';
import type { CreateContractData, UpdateContractData, CustomerContract } from '../../types';

interface ContractFormProps {
  contract?: CustomerContract | null;
  onSuccess?: (contract: CustomerContract) => void;
  onCancel?: () => void;
}

/**
 * ContractForm Component
 * Handles both creation and editing of contracts
 */
export default function ContractForm({ contract, onSuccess, onCancel }: ContractFormProps) {
  const { submitting, error, createContract, updateContract, generateReference, clearError } =
    useContractForm();

  // Form state
  const [formData, setFormData] = useState<Partial<CreateContractData>>({
    reference: contract?.reference || '',
    customer_id: contract?.customer?.id || 0,
    regie_callcenter: contract?.regie_callcenter || 0,
    telepro_id: contract?.telepro_id || 0,
    commercial_1_id: contract?.commercial_1_id || 0,
    commercial_2_id: contract?.commercial_2_id || 0,
    manager_id: contract?.manager_id || 0,
    assistant_id: contract?.assistant_id || 0,
    installateur_id: contract?.installateur_id || 0,
    status_contrat_id: contract?.status_contrat_id || 0,
    status_installation_id: contract?.status_installation_id || 0,
    status_admin_id: contract?.status_admin_id || 0,
    montant_ttc: contract?.montant_ttc || 0,
    montant_ht: contract?.montant_ht || 0,
    confirme: contract?.confirme || false,
    actif: contract?.actif ?? true,
    status_flag: contract?.status_flag || 'ACTIVE',
    remarques: contract?.remarques || '',
  });

  const isEditMode = !!contract;

  // Styles
  const containerStyle: React.CSSProperties = {
    background: 'white',
    padding: '32px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    maxWidth: '900px',
    margin: '0 auto',
  };

  const headerStyle: React.CSSProperties = {
    marginBottom: '32px',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '28px',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '8px',
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#666',
  };

  const formGroupStyle: React.CSSProperties = {
    marginBottom: '24px',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '8px',
  };

  const requiredStyle: React.CSSProperties = {
    color: '#dc3545',
    marginLeft: '4px',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box',
  };

  const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    minHeight: '100px',
    resize: 'vertical',
    fontFamily: 'inherit',
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '24px',
  };

  const buttonGroupStyle: React.CSSProperties = {
    display: 'flex',
    gap: '16px',
    justifyContent: 'flex-end',
    marginTop: '32px',
  };

  const buttonStyle: React.CSSProperties = {
    padding: '12px 32px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  };

  const secondaryButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    background: '#6c757d',
  };

  const errorStyle: React.CSSProperties = {
    background: '#fee',
    color: '#c33',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '24px',
    border: '1px solid #fcc',
  };

  const linkButtonStyle: React.CSSProperties = {
    background: 'transparent',
    color: '#667eea',
    border: 'none',
    cursor: 'pointer',
    fontSize: '13px',
    textDecoration: 'underline',
    marginTop: '8px',
  };

  // Handlers
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'number'
          ? value === ''
            ? 0
            : parseFloat(value)
          : value,
    }));

    // Clear error when user starts typing
    if (error) clearError();
  };

  const handleGenerateReference = async () => {
    const ref = await generateReference('CONT');
    if (ref) {
      setFormData((prev) => ({ ...prev, reference: ref }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let result: CustomerContract | null = null;

    if (isEditMode && contract) {
      result = await updateContract(contract.id, formData as UpdateContractData);
    } else {
      result = await createContract(formData as CreateContractData);
    }

    if (result && onSuccess) {
      onSuccess(result);
    }
  };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h1 style={titleStyle}>{isEditMode ? 'Edit Contract' : 'Create New Contract'}</h1>
        <p style={subtitleStyle}>
          {isEditMode
            ? 'Update contract information below'
            : 'Fill in the details to create a new contract'}
        </p>
      </div>

      {/* Error Message */}
      {error && <div style={errorStyle}>❌ {error}</div>}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        {/* Reference */}
        <div style={formGroupStyle}>
          <label style={labelStyle}>
            Reference <span style={requiredStyle}>*</span>
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              name="reference"
              value={formData.reference}
              onChange={handleChange}
              required
              style={{ ...inputStyle, flex: 1 }}
              placeholder="e.g., CONT-2024-00001"
            />
            {!isEditMode && (
              <button
                type="button"
                onClick={handleGenerateReference}
                style={linkButtonStyle}
              >
                Generate
              </button>
            )}
          </div>
        </div>

        {/* Basic Information Grid */}
        <div style={gridStyle}>
          <div style={formGroupStyle}>
            <label style={labelStyle}>
              Customer ID <span style={requiredStyle}>*</span>
            </label>
            <input
              type="number"
              name="customer_id"
              value={formData.customer_id}
              onChange={handleChange}
              required
              style={inputStyle}
              placeholder="Customer ID"
            />
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>
              Status Contrat ID <span style={requiredStyle}>*</span>
            </label>
            <input
              type="number"
              name="status_contrat_id"
              value={formData.status_contrat_id}
              onChange={handleChange}
              required
              style={inputStyle}
              placeholder="Contract Status ID"
            />
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>
              Status Installation ID
            </label>
            <input
              type="number"
              name="status_installation_id"
              value={formData.status_installation_id || ''}
              onChange={handleChange}
              style={inputStyle}
              placeholder="Installation Status ID (optional)"
            />
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>
              Status Admin ID
            </label>
            <input
              type="number"
              name="status_admin_id"
              value={formData.status_admin_id || ''}
              onChange={handleChange}
              style={inputStyle}
              placeholder="Admin Status ID (optional)"
            />
          </div>
        </div>

        {/* Team Information Grid */}
        <div style={gridStyle}>
          <div style={formGroupStyle}>
            <label style={labelStyle}>
              Regie Callcenter
            </label>
            <input
              type="number"
              name="regie_callcenter"
              value={formData.regie_callcenter || ''}
              onChange={handleChange}
              style={inputStyle}
              placeholder="Regie Callcenter ID"
            />
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>
              Telepro ID
            </label>
            <input
              type="number"
              name="telepro_id"
              value={formData.telepro_id || ''}
              onChange={handleChange}
              style={inputStyle}
              placeholder="Telepro ID"
            />
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>
              Commercial 1 ID
            </label>
            <input
              type="number"
              name="commercial_1_id"
              value={formData.commercial_1_id || ''}
              onChange={handleChange}
              style={inputStyle}
              placeholder="Primary Commercial ID"
            />
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>
              Commercial 2 ID
            </label>
            <input
              type="number"
              name="commercial_2_id"
              value={formData.commercial_2_id || ''}
              onChange={handleChange}
              style={inputStyle}
              placeholder="Secondary Commercial ID"
            />
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>
              Manager ID
            </label>
            <input
              type="number"
              name="manager_id"
              value={formData.manager_id || ''}
              onChange={handleChange}
              style={inputStyle}
              placeholder="Manager ID"
            />
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>
              Assistant ID
            </label>
            <input
              type="number"
              name="assistant_id"
              value={formData.assistant_id || ''}
              onChange={handleChange}
              style={inputStyle}
              placeholder="Assistant ID"
            />
          </div>
        </div>

        {/* Price Information Grid */}
        <div style={gridStyle}>
          <div style={formGroupStyle}>
            <label style={labelStyle}>
              Montant TTC (Tax Included)
            </label>
            <input
              type="number"
              name="montant_ttc"
              value={formData.montant_ttc || ''}
              onChange={handleChange}
              step="0.01"
              min="0"
              style={inputStyle}
              placeholder="0.00"
            />
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>
              Montant HT (Tax Excluded)
            </label>
            <input
              type="number"
              name="montant_ht"
              value={formData.montant_ht || ''}
              onChange={handleChange}
              step="0.01"
              min="0"
              style={inputStyle}
              placeholder="0.00"
            />
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>Confirme</label>
            <select
              name="confirme"
              value={formData.confirme ? 'true' : 'false'}
              onChange={(e) => setFormData({ ...formData, confirme: e.target.value === 'true' })}
              style={inputStyle}
            >
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>Contract Status</label>
            <select
              name="status_flag"
              value={formData.status_flag}
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="ACTIVE">Active</option>
              <option value="DELETE">Deleted</option>
            </select>
          </div>
        </div>

        {/* Remarks */}
        <div style={formGroupStyle}>
          <label style={labelStyle}>Remarques</label>
          <textarea
            name="remarques"
            value={formData.remarques}
            onChange={handleChange}
            style={textareaStyle}
            placeholder="Additional notes or remarks..."
          />
        </div>

        {/* Action Buttons */}
        <div style={buttonGroupStyle}>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              style={secondaryButtonStyle}
              disabled={submitting}
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            style={{
              ...buttonStyle,
              opacity: submitting ? 0.6 : 1,
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}
            disabled={submitting}
          >
            {submitting ? 'Saving...' : isEditMode ? 'Update Contract' : 'Create Contract'}
          </button>
        </div>
      </form>
    </div>
  );
}
