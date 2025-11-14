// ============================================================================
// CustomersContracts Module - Edit Contract Modal Component with Tabs
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import type { UpdateContractData, CustomerContract } from '../../types';

interface EditContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: number, data: UpdateContractData) => Promise<void>;
  contractId: number | null;
  onFetchContract: (id: number) => Promise<CustomerContract | null>;
}

type TabKey = 'dates' | 'customer' | 'team' | 'financial' | 'status' | 'other';

interface Tab {
  key: TabKey;
  label: string;
  icon: string;
}

export default function EditContractModal({ isOpen, onClose, onUpdate, contractId, onFetchContract }: EditContractModalProps) {
  const [contract, setContract] = useState<CustomerContract | null>(null);
  const [loadingContract, setLoadingContract] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('dates');

  const tabs: Tab[] = [
    { key: 'contract', label: 'Contract', icon: '📅' },
    { key: 'customer', label: 'Client', icon: '👤' },
    { key: 'team', label: 'Équipe', icon: '👥' },
    { key: 'financial', label: 'Finances', icon: '💰' },
    { key: 'status', label: 'Statuts', icon: '⚙️' },
    { key: 'other', label: 'Autres', icon: '📝' },
  ];

  const [formData, setFormData] = useState<UpdateContractData>({
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
      address: {
        address1: '',
        postcode: '',
        city: '',
      },
    },
    products: [],
  });

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

            console.log('====== DEBUG DATE FORMATTING ======');
            console.log('Full contract data:', fetchedContract);
            console.log('opc_at RAW value:', fetchedContract.opc_at);
            console.log('opc_at type:', typeof fetchedContract.opc_at);
            console.log('quoted_at RAW value:', fetchedContract.quoted_at);
            console.log('billing_at RAW value:', fetchedContract.billing_at);
            console.log('opened_at RAW value:', fetchedContract.opened_at);

            // Helper to format date from API format to input format
            const formatDate = (dateString: string | null | undefined, fieldName?: string) => {
              console.log(`\n--- Formatting ${fieldName || 'date'} ---`);
              console.log('Input:', dateString);

              if (!dateString) {
                console.log('Result: empty (no value)');
                return '';
              }

              // Extract only the date part (YYYY-MM-DD) to avoid timezone issues
              // This handles multiple formats: "YYYY-MM-DD", "YYYY-MM-DD HH:MM:SS", ISO strings
              const dateOnly = dateString.split('T')[0].split(' ')[0];
              console.log('After split:', dateOnly);

              // Validate it's a proper date format
              if (/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) {
                console.log('Result:', dateOnly, '(validated)');
                return dateOnly;
              }

              // Fallback: try to parse and format without timezone conversion
              try {
                const parts = dateString.match(/(\d{4})-(\d{2})-(\d{2})/);
                if (parts) {
                  const result = `${parts[1]}-${parts[2]}-${parts[3]}`;
                  console.log('Result:', result, '(regex fallback)');
                  return result;
                }
              } catch (e) {
                console.error('Error parsing date:', dateString, e);
              }

              console.log('Result: empty (failed to parse)');
              return '';
            };

            const formattedData = {
              // Dates - use the correct field names from API response
              quoted_at: formatDate(fetchedContract.quoted_at, 'quoted_at'),
              billing_at: formatDate(fetchedContract.billing_at, 'billing_at'),
              opc_at: formatDate(fetchedContract.opc_at, 'opc_at'),
              opened_at: formatDate(fetchedContract.opened_at, 'opened_at'),
              sent_at: formatDate(fetchedContract.sent_at, 'sent_at'),
              payment_at: formatDate(fetchedContract.payment_at, 'payment_at'),
              apf_at: formatDate(fetchedContract.apf_at, 'apf_at'),

              // IDs
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

              // Prices
              total_price_with_taxe: fetchedContract.total_price_with_taxe || undefined,
              total_price_without_taxe: fetchedContract.total_price_without_taxe || undefined,

              // Other
              remarks: fetchedContract.remarks || '',
              variables: fetchedContract.variables || undefined,
              is_signed: fetchedContract.is_signed || 'NO',
              status: fetchedContract.status_flag || 'ACTIVE',

              // Customer info
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

              // Products
              products: fetchedContract.products?.map(p => ({
                product_id: p.product_id,
                details: p.details,
              })) || [],
            };

            console.log('\n====== FORMATTED DATA ======');
            console.log('quoted_at formatted:', formattedData.quoted_at);
            console.log('billing_at formatted:', formattedData.billing_at);
            console.log('opc_at formatted:', formattedData.opc_at);
            console.log('opened_at formatted:', formattedData.opened_at);
            console.log('===========================\n');

            setFormData(formattedData);
          } else {
            setError('Impossible de charger les données du contrat');
          }
        } catch (err) {
          setError('Erreur lors du chargement du contrat');
          console.error('Error loading contract:', err);
        } finally {
          setLoadingContract(false);
        }
      }
    };

    loadContract();
  }, [isOpen, contractId, onFetchContract]);

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
    if (!contract) return;

    setError(null);
    setLoading(true);

    try {
      // Prepare data for update - keep all form data including customer info
      const updateData = { ...formData };

      // Convert variables to JSON string if it's an array or object
      if (updateData.variables !== undefined) {
        if (Array.isArray(updateData.variables) || typeof updateData.variables === 'object') {
          updateData.variables = JSON.stringify(updateData.variables);
        }
      }

      // Clean up undefined values and empty strings (same as CreateContractModal)
      // This will remove empty string fields but preserve objects like customer and products
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

  if (!isOpen || !contract) return null;

  // Modal Styles
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

  const subtitleStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#888',
    marginTop: '8px',
  };

  const tabsContainerStyle: React.CSSProperties = {
    display: 'flex',
    borderBottom: '2px solid #f0f0f0',
    marginBottom: '24px',
    gap: '8px',
    flexWrap: 'wrap',
  };

  const tabStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '12px 20px',
    cursor: 'pointer',
    border: 'none',
    background: isActive ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
    color: isActive ? 'white' : '#667eea',
    fontWeight: '600',
    fontSize: '14px',
    borderRadius: '8px 8px 0 0',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    position: 'relative',
    bottom: isActive ? '-2px' : '0',
  });

  const tabContentStyle: React.CSSProperties = {
    padding: '20px',
    background: '#fafafa',
    borderRadius: '8px',
    minHeight: '400px',
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

  if (!isOpen) return null;

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <h2 style={titleStyle}>Modifier le Contrat</h2>
          {contract && <p style={subtitleStyle}>Référence: {contract.reference}</p>}
        </div>

        {error && <div style={errorStyle}>{error}</div>}

        {loadingContract ? (
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
            <p style={{ marginTop: '16px', color: '#666' }}>Chargement du contrat...</p>
          </div>
        ) : !contract ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            Aucun contrat sélectionné
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Tabs Navigation */}
            <div style={tabsContainerStyle}>
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  style={tabStyle(activeTab === tab.key)}
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
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div style={tabContentStyle}>
              {/* ==================== DATES TAB ==================== */}
              {activeTab === 'contract' && (
                <div>
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
                </div>
              )}

              {/* ==================== CUSTOMER TAB ==================== */}
              {activeTab === 'customer' && (
                <div>
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

            <div style={{
              fontSize: '14px',
              fontWeight: '600',
              marginTop: '16px',
              marginBottom: '12px',
              color: '#555',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
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
                </div>
              )}

              {/* ==================== TEAM TAB ==================== */}
              {activeTab === 'team' && (
                <div>
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
                </div>
              )}

              {/* ==================== FINANCIAL TAB ==================== */}
              {activeTab === 'financial' && (
                <div>
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
                </div>
              )}

              {/* ==================== STATUS TAB ==================== */}
              {activeTab === 'status' && (
                <div>
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
                </div>
              )}

              {/* ==================== OTHER TAB ==================== */}
              {activeTab === 'other' && (
                <div>
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
                disabled
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
                Client ID
              </label>
              <input
                type="number"
                id="customer_id"
                name="customer_id"
                value={formData.customer_id || ''}
                onChange={handleInputChange}
                style={inputStyle}
                disabled
              />
            </div>
                </div>
              )}
            </div>

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
              {loading ? 'Mise à jour en cours...' : 'Mettre à Jour'}
            </button>
          </div>
        </form>
        )}

        {/* CSS Styles for spinner animation */}
        <style jsx>{`
          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    </div>
  );
}
