// ============================================================================
// CustomersContracts Module - Create Contract Modal Component with Collapsible Sections
// ============================================================================

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import type { CreateContractData } from '../../types';

interface CreateContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: CreateContractData) => Promise<void>;
}

// Collapsible Section Component (moved outside to prevent re-renders)
interface CollapsibleSectionProps {
  title: string;
  icon: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  collapsibleHeaderStyle: React.CSSProperties;
  collapsibleHeaderHoverStyle: React.CSSProperties;
  sectionTitleStyle: React.CSSProperties;
}

const CollapsibleSection = React.memo(({
  title,
  icon,
  isOpen,
  onToggle,
  children,
  collapsibleHeaderStyle,
  collapsibleHeaderHoverStyle,
  sectionTitleStyle,
}: CollapsibleSectionProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div>
      <div
        style={isHovered ? { ...collapsibleHeaderStyle, ...collapsibleHeaderHoverStyle } : collapsibleHeaderStyle}
        onClick={onToggle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div style={sectionTitleStyle}>
          <span>{icon}</span>
          <span>{title}</span>
        </div>
        <span style={{
          transition: 'transform 0.3s ease',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          display: 'inline-block',
          color: '#667eea',
          fontWeight: 'bold',
        }}>
          ▼
        </span>
      </div>
      {isOpen && (
        <div style={{
          padding: '16px',
          background: '#fafafa',
          borderRadius: '8px',
          marginBottom: '8px'
        }}>
          {children}
        </div>
      )}
    </div>
  );
});

export default function CreateContractModal({ isOpen, onClose, onCreate }: CreateContractModalProps) {
  const [formData, setFormData] = useState<CreateContractData>({
    // Required dates
    quoted_at: '',
    billing_at: '',
    opc_at: '',
    opened_at: '',

    // Optional dates
    sent_at: '',
    payment_at: '',
    apf_at: '',

    // IDs
    reference: '',
    customer_id: undefined,
    meeting_id: undefined,
    financial_partner_id: undefined,
    tax_id: undefined,
    team_id: undefined,
    telepro_id: undefined,
    sale_1_id: undefined,
    sale_2_id: undefined,
    manager_id: undefined,
    assistant_id: undefined,
    installer_user_id: undefined,
    opened_at_range_id: undefined,
    opc_range_id: undefined,
    state_id: undefined,
    install_state_id: undefined,
    admin_status_id: undefined,
    company_id: undefined,

    // Prices
    total_price_with_taxe: undefined,
    total_price_without_taxe: undefined,

    // Other
    remarks: '',
    variables: undefined,
    is_signed: 'NO',
    status: 'ACTIVE',

    // Required customer info
    customer: {
      lastname: '',
      firstname: '',
      phone: '',
      union_id: undefined,
      address: {
        address1: '',
        postcode: '',
        city: '',
      },
    },

    // Products
    products: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Collapsible sections state
  const [openSections, setOpenSections] = useState({
    dates: true,
    customer: true,
    team: false,
    financial: false,
    status: false,
    products: false,
    other: false,
  });

  const toggleSection = useCallback((section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    // Handle numeric inputs
    const isNumber = type === 'number';
    const finalValue = isNumber && value !== '' ? Number(value) : value;

    if (name.startsWith('customer.')) {
      const fieldName = name.replace('customer.', '');

      if (fieldName.startsWith('address.')) {
        const addressField = fieldName.replace('address.', '');
        setFormData(prev => ({
          ...prev,
          customer: {
            ...prev.customer!,
            address: {
              ...prev.customer!.address!,
              [addressField]: finalValue,
            },
          },
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          customer: {
            ...prev.customer!,
            [fieldName]: finalValue,
          },
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: finalValue === '' ? undefined : finalValue,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Clean up undefined values
      const cleanData = Object.fromEntries(
        Object.entries(formData).filter(([_, v]) => v !== undefined && v !== '')
      );

      await onCreate(cleanData as CreateContractData);

      // Reset form
      setFormData({
        quoted_at: '',
        billing_at: '',
        opc_at: '',
        opened_at: '',
        sent_at: '',
        payment_at: '',
        apf_at: '',
        reference: '',
        customer_id: undefined,
        meeting_id: undefined,
        financial_partner_id: undefined,
        tax_id: undefined,
        team_id: undefined,
        telepro_id: undefined,
        sale_1_id: undefined,
        sale_2_id: undefined,
        manager_id: undefined,
        assistant_id: undefined,
        installer_user_id: undefined,
        opened_at_range_id: undefined,
        opc_range_id: undefined,
        state_id: undefined,
        install_state_id: undefined,
        admin_status_id: undefined,
        company_id: undefined,
        total_price_with_taxe: undefined,
        total_price_without_taxe: undefined,
        remarks: '',
        variables: undefined,
        is_signed: 'NO',
        status: 'ACTIVE',
        customer: {
          lastname: '',
          firstname: '',
          phone: '',
          union_id: undefined,
          address: {
            address1: '',
            postcode: '',
            city: '',
          },
        },
        products: [],
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create contract');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Styles
  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  };

  const modalStyle: React.CSSProperties = {
    background: 'white',
    borderRadius: '12px',
    padding: '32px',
    maxWidth: '900px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
  };

  const headerStyle: React.CSSProperties = {
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '2px solid #f0f0f0',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    margin: 0,
  };

  const collapsibleHeaderStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
    border: '1px solid #667eea40',
    borderRadius: '8px',
    cursor: 'pointer',
    marginTop: '16px',
    marginBottom: '12px',
    transition: 'all 0.2s',
  };

  const collapsibleHeaderHoverStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #667eea25 0%, #764ba225 100%)',
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: '600',
    color: '#667eea',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const formGroupStyle: React.CSSProperties = {
    marginBottom: '16px',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#555',
    marginBottom: '6px',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  };

  const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    minHeight: '80px',
    resize: 'vertical',
    fontFamily: 'inherit',
  };

  const rowStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  };

  const row3Style: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '16px',
  };

  const errorStyle: React.CSSProperties = {
    background: '#fee',
    color: '#c33',
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '16px',
    fontSize: '14px',
    border: '1px solid #fcc',
  };

  const buttonsStyle: React.CSSProperties = {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    marginTop: '24px',
    paddingTop: '20px',
    borderTop: '2px solid #f0f0f0',
  };

  const buttonStyle: React.CSSProperties = {
    padding: '10px 24px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    border: 'none',
  };

  const primaryButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
  };

  const secondaryButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    background: '#e0e0e0',
    color: '#555',
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <h2 style={titleStyle}>Nouveau Contrat</h2>
        </div>

        {error && <div style={errorStyle}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* ==================== DATES SECTION ==================== */}
          <CollapsibleSection
            title="Dates du Contrat"
            icon="📅"
            isOpen={openSections.dates}
            onToggle={() => toggleSection('dates')}
            collapsibleHeaderStyle={collapsibleHeaderStyle}
            collapsibleHeaderHoverStyle={collapsibleHeaderHoverStyle}
            sectionTitleStyle={sectionTitleStyle}
          >
            <div style={rowStyle}>
              <div style={formGroupStyle}>
                <label style={labelStyle} htmlFor="quoted_at">
                  Date de Devis <span style={{ color: '#dc3545' }}>*</span>
                </label>
                <input
                  type="date"
                  id="quoted_at"
                  name="quoted_at"
                  value={formData.quoted_at}
                  onChange={handleInputChange}
                  required
                  style={inputStyle}
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle} htmlFor="billing_at">
                  Date de Facturation <span style={{ color: '#dc3545' }}>*</span>
                </label>
                <input
                  type="date"
                  id="billing_at"
                  name="billing_at"
                  value={formData.billing_at}
                  onChange={handleInputChange}
                  required
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={rowStyle}>
              <div style={formGroupStyle}>
                <label style={labelStyle} htmlFor="opened_at">
                  Date d'Engagement <span style={{ color: '#dc3545' }}>*</span>
                </label>
                <input
                  type="date"
                  id="opened_at"
                  name="opened_at"
                  value={formData.opened_at}
                  onChange={handleInputChange}
                  required
                  style={inputStyle}
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle} htmlFor="opc_at">
                  Date OPC <span style={{ color: '#dc3545' }}>*</span>
                </label>
                <input
                  type="date"
                  id="opc_at"
                  name="opc_at"
                  value={formData.opc_at}
                  onChange={handleInputChange}
                  required
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={row3Style}>
              <div style={formGroupStyle}>
                <label style={labelStyle} htmlFor="sent_at">
                  Date d'Envoi
                </label>
                <input
                  type="date"
                  id="sent_at"
                  name="sent_at"
                  value={formData.sent_at}
                  onChange={handleInputChange}
                  style={inputStyle}
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle} htmlFor="payment_at">
                  Date de Paiement
                </label>
                <input
                  type="date"
                  id="payment_at"
                  name="payment_at"
                  value={formData.payment_at}
                  onChange={handleInputChange}
                  style={inputStyle}
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle} htmlFor="apf_at">
                  Date APF
                </label>
                <input
                  type="date"
                  id="apf_at"
                  name="apf_at"
                  value={formData.apf_at}
                  onChange={handleInputChange}
                  style={inputStyle}
                />
              </div>
            </div>
          </CollapsibleSection>

          {/* ==================== CUSTOMER SECTION ==================== */}
          <CollapsibleSection
            title="Informations Client"
            icon="👤"
            isOpen={openSections.customer}
            onToggle={() => toggleSection('customer')}
            collapsibleHeaderStyle={collapsibleHeaderStyle}
            collapsibleHeaderHoverStyle={collapsibleHeaderHoverStyle}
            sectionTitleStyle={sectionTitleStyle}
          >
            <div style={rowStyle}>
              <div style={formGroupStyle}>
                <label style={labelStyle} htmlFor="customer.lastname">
                  Nom <span style={{ color: '#dc3545' }}>*</span>
                </label>
                <input
                  type="text"
                  id="customer.lastname"
                  name="customer.lastname"
                  value={formData.customer?.lastname || ''}
                  onChange={handleInputChange}
                  required
                  style={inputStyle}
                  placeholder="Dupont"
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle} htmlFor="customer.firstname">
                  Prénom <span style={{ color: '#dc3545' }}>*</span>
                </label>
                <input
                  type="text"
                  id="customer.firstname"
                  name="customer.firstname"
                  value={formData.customer?.firstname || ''}
                  onChange={handleInputChange}
                  required
                  style={inputStyle}
                  placeholder="Jean"
                />
              </div>
            </div>

            <div style={rowStyle}>
              <div style={formGroupStyle}>
                <label style={labelStyle} htmlFor="customer.phone">
                  Téléphone <span style={{ color: '#dc3545' }}>*</span>
                </label>
                <input
                  type="tel"
                  id="customer.phone"
                  name="customer.phone"
                  value={formData.customer?.phone || ''}
                  onChange={handleInputChange}
                  required
                  style={inputStyle}
                  placeholder="0612345678"
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle} htmlFor="customer.union_id">
                  Union ID
                </label>
                <input
                  type="number"
                  id="customer.union_id"
                  name="customer.union_id"
                  value={formData.customer?.union_id || ''}
                  onChange={handleInputChange}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ ...sectionTitleStyle, fontSize: '14px', marginTop: '16px', marginBottom: '12px', color: '#555' }}>
              <span>🏠</span>
              <span>Adresse</span>
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle} htmlFor="customer.address.address1">
                Adresse <span style={{ color: '#dc3545' }}>*</span>
              </label>
              <input
                type="text"
                id="customer.address.address1"
                name="customer.address.address1"
                value={formData.customer?.address?.address1 || ''}
                onChange={handleInputChange}
                required
                style={inputStyle}
                placeholder="123 Rue de la République"
              />
            </div>

            <div style={rowStyle}>
              <div style={formGroupStyle}>
                <label style={labelStyle} htmlFor="customer.address.postcode">
                  Code Postal <span style={{ color: '#dc3545' }}>*</span>
                </label>
                <input
                  type="text"
                  id="customer.address.postcode"
                  name="customer.address.postcode"
                  value={formData.customer?.address?.postcode || ''}
                  onChange={handleInputChange}
                  required
                  style={inputStyle}
                  placeholder="75001"
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle} htmlFor="customer.address.city">
                  Ville <span style={{ color: '#dc3545' }}>*</span>
                </label>
                <input
                  type="text"
                  id="customer.address.city"
                  name="customer.address.city"
                  value={formData.customer?.address?.city || ''}
                  onChange={handleInputChange}
                  required
                  style={inputStyle}
                  placeholder="Paris"
                />
              </div>
            </div>
          </CollapsibleSection>

          {/* ==================== TEAM SECTION ==================== */}
          <CollapsibleSection
            title="Équipe & Collaborateurs"
            icon="👥"
            isOpen={openSections.team}
            onToggle={() => toggleSection('team')}
            collapsibleHeaderStyle={collapsibleHeaderStyle}
            collapsibleHeaderHoverStyle={collapsibleHeaderHoverStyle}
            sectionTitleStyle={sectionTitleStyle}
          >
            <div style={row3Style}>
              <div style={formGroupStyle}>
                <label style={labelStyle} htmlFor="telepro_id">
                  Téléprospecteur ID
                </label>
                <input
                  type="number"
                  id="telepro_id"
                  name="telepro_id"
                  value={formData.telepro_id || ''}
                  onChange={handleInputChange}
                  style={inputStyle}
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle} htmlFor="sale_1_id">
                  Commercial 1 ID
                </label>
                <input
                  type="number"
                  id="sale_1_id"
                  name="sale_1_id"
                  value={formData.sale_1_id || ''}
                  onChange={handleInputChange}
                  style={inputStyle}
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle} htmlFor="sale_2_id">
                  Commercial 2 ID
                </label>
                <input
                  type="number"
                  id="sale_2_id"
                  name="sale_2_id"
                  value={formData.sale_2_id || ''}
                  onChange={handleInputChange}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={row3Style}>
              <div style={formGroupStyle}>
                <label style={labelStyle} htmlFor="manager_id">
                  Manager ID
                </label>
                <input
                  type="number"
                  id="manager_id"
                  name="manager_id"
                  value={formData.manager_id || ''}
                  onChange={handleInputChange}
                  style={inputStyle}
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle} htmlFor="assistant_id">
                  Assistant ID
                </label>
                <input
                  type="number"
                  id="assistant_id"
                  name="assistant_id"
                  value={formData.assistant_id || ''}
                  onChange={handleInputChange}
                  style={inputStyle}
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle} htmlFor="installer_user_id">
                  Installateur ID
                </label>
                <input
                  type="number"
                  id="installer_user_id"
                  name="installer_user_id"
                  value={formData.installer_user_id || ''}
                  onChange={handleInputChange}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={rowStyle}>
              <div style={formGroupStyle}>
                <label style={labelStyle} htmlFor="team_id">
                  Équipe ID
                </label>
                <input
                  type="number"
                  id="team_id"
                  name="team_id"
                  value={formData.team_id || ''}
                  onChange={handleInputChange}
                  style={inputStyle}
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle} htmlFor="company_id">
                  Société ID
                </label>
                <input
                  type="number"
                  id="company_id"
                  name="company_id"
                  value={formData.company_id || ''}
                  onChange={handleInputChange}
                  style={inputStyle}
                />
              </div>
            </div>
          </CollapsibleSection>

          {/* ==================== FINANCIAL SECTION ==================== */}
          <CollapsibleSection
            title="Informations Financières"
            icon="💰"
            isOpen={openSections.financial}
            onToggle={() => toggleSection('financial')}
            collapsibleHeaderStyle={collapsibleHeaderStyle}
            collapsibleHeaderHoverStyle={collapsibleHeaderHoverStyle}
            sectionTitleStyle={sectionTitleStyle}
          >
            <div style={row3Style}>
              <div style={formGroupStyle}>
                <label style={labelStyle} htmlFor="financial_partner_id">
                  Partenaire Financier ID
                </label>
                <input
                  type="number"
                  id="financial_partner_id"
                  name="financial_partner_id"
                  value={formData.financial_partner_id || ''}
                  onChange={handleInputChange}
                  style={inputStyle}
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle} htmlFor="total_price_without_taxe">
                  Prix HT (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  id="total_price_without_taxe"
                  name="total_price_without_taxe"
                  value={formData.total_price_without_taxe || ''}
                  onChange={handleInputChange}
                  style={inputStyle}
                  placeholder="0.00"
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle} htmlFor="total_price_with_taxe">
                  Prix TTC (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  id="total_price_with_taxe"
                  name="total_price_with_taxe"
                  value={formData.total_price_with_taxe || ''}
                  onChange={handleInputChange}
                  style={inputStyle}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle} htmlFor="tax_id">
                Taxe ID
              </label>
              <input
                type="number"
                id="tax_id"
                name="tax_id"
                value={formData.tax_id || ''}
                onChange={handleInputChange}
                style={inputStyle}
              />
            </div>
          </CollapsibleSection>

          {/* ==================== STATUS SECTION ==================== */}
          <CollapsibleSection
            title="Statuts & Configuration"
            icon="⚙️"
            isOpen={openSections.status}
            onToggle={() => toggleSection('status')}
            collapsibleHeaderStyle={collapsibleHeaderStyle}
            collapsibleHeaderHoverStyle={collapsibleHeaderHoverStyle}
            sectionTitleStyle={sectionTitleStyle}
          >
            <div style={row3Style}>
              <div style={formGroupStyle}>
                <label style={labelStyle} htmlFor="state_id">
                  Statut Contrat ID
                </label>
                <input
                  type="number"
                  id="state_id"
                  name="state_id"
                  value={formData.state_id || ''}
                  onChange={handleInputChange}
                  style={inputStyle}
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle} htmlFor="install_state_id">
                  Statut Installation ID
                </label>
                <input
                  type="number"
                  id="install_state_id"
                  name="install_state_id"
                  value={formData.install_state_id || ''}
                  onChange={handleInputChange}
                  style={inputStyle}
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle} htmlFor="admin_status_id">
                  Statut Admin ID
                </label>
                <input
                  type="number"
                  id="admin_status_id"
                  name="admin_status_id"
                  value={formData.admin_status_id || ''}
                  onChange={handleInputChange}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={row3Style}>
              <div style={formGroupStyle}>
                <label style={labelStyle} htmlFor="opened_at_range_id">
                  Plage Ouverture ID
                </label>
                <input
                  type="number"
                  id="opened_at_range_id"
                  name="opened_at_range_id"
                  value={formData.opened_at_range_id || ''}
                  onChange={handleInputChange}
                  style={inputStyle}
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle} htmlFor="opc_range_id">
                  Plage OPC ID
                </label>
                <input
                  type="number"
                  id="opc_range_id"
                  name="opc_range_id"
                  value={formData.opc_range_id || ''}
                  onChange={handleInputChange}
                  style={inputStyle}
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle} htmlFor="meeting_id">
                  Réunion ID
                </label>
                <input
                  type="number"
                  id="meeting_id"
                  name="meeting_id"
                  value={formData.meeting_id || ''}
                  onChange={handleInputChange}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={rowStyle}>
              <div style={formGroupStyle}>
                <label style={labelStyle} htmlFor="is_signed">
                  Signé ?
                </label>
                <select
                  id="is_signed"
                  name="is_signed"
                  value={formData.is_signed}
                  onChange={handleInputChange}
                  style={inputStyle}
                >
                  <option value="NO">Non</option>
                  <option value="YES">Oui</option>
                </select>
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle} htmlFor="status">
                  Statut
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  style={inputStyle}
                >
                  <option value="ACTIVE">Actif</option>
                  <option value="DELETE">Supprimé</option>
                </select>
              </div>
            </div>
          </CollapsibleSection>

          {/* ==================== OTHER SECTION ==================== */}
          <CollapsibleSection
            title="Autres Informations"
            icon="📝"
            isOpen={openSections.other}
            onToggle={() => toggleSection('other')}
            collapsibleHeaderStyle={collapsibleHeaderStyle}
            collapsibleHeaderHoverStyle={collapsibleHeaderHoverStyle}
            sectionTitleStyle={sectionTitleStyle}
          >
            <div style={formGroupStyle}>
              <label style={labelStyle} htmlFor="reference">
                Référence
              </label>
              <input
                type="text"
                id="reference"
                name="reference"
                value={formData.reference}
                onChange={handleInputChange}
                style={inputStyle}
                placeholder="Sera généré automatiquement si vide"
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle} htmlFor="remarks">
                Remarques
              </label>
              <textarea
                id="remarks"
                name="remarks"
                value={formData.remarks}
                onChange={handleInputChange}
                style={textareaStyle}
                placeholder="Ajoutez des remarques..."
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle} htmlFor="customer_id">
                Client Existant ID (optionnel)
              </label>
              <input
                type="number"
                id="customer_id"
                name="customer_id"
                value={formData.customer_id || ''}
                onChange={handleInputChange}
                style={inputStyle}
                placeholder="Laisser vide pour créer un nouveau client"
              />
            </div>
          </CollapsibleSection>

          {/* Form Actions */}
          <div style={buttonsStyle}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={secondaryButtonStyle}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.background = '#d0d0d0';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#e0e0e0';
              }}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                ...primaryButtonStyle,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Création en cours...' : 'Créer le Contrat'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
