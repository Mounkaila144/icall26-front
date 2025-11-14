// ============================================================================
// CustomersContracts Module - Contract Details Component
// ============================================================================
// Detailed view of a single contract with history and relations
// ============================================================================

'use client';

import React, { useEffect } from 'react';
import { useContract } from '../hooks/useContract';
import type { CustomerContract, ContractHistory } from '../../types';

interface ContractDetailsProps {
  contractId: number;
  onEdit?: (contract: CustomerContract) => void;
  onClose?: () => void;
}

/**
 * ContractDetails Component
 * Displays comprehensive contract information including relations and history
 */
export default function ContractDetails({ contractId, onEdit, onClose }: ContractDetailsProps) {
  const { contract, history, loading, error, historyLoading, refreshContract, loadHistory } =
    useContract(contractId);

  // Load history on mount
  useEffect(() => {
    if (contractId) {
      loadHistory();
    }
  }, [contractId, loadHistory]);

  // Styles
  const containerStyle: React.CSSProperties = {
    background: 'white',
    padding: '32px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    maxWidth: '1200px',
    margin: '0 auto',
  };

  const headerStyle: React.CSSProperties = {
    marginBottom: '32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '16px',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '28px',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '8px',
  };

  const buttonGroupStyle: React.CSSProperties = {
    display: 'flex',
    gap: '12px',
  };

  const buttonStyle: React.CSSProperties = {
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  };

  const secondaryButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    background: '#6c757d',
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: '32px',
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '16px',
    borderBottom: '2px solid #667eea',
    paddingBottom: '8px',
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '24px',
  };

  const fieldStyle: React.CSSProperties = {
    marginBottom: '16px',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '13px',
    color: '#666',
    fontWeight: '600',
    marginBottom: '4px',
  };

  const valueStyle: React.CSSProperties = {
    fontSize: '15px',
    color: '#333',
  };

  const badgeStyle: React.CSSProperties = {
    display: 'inline-block',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '500',
  };

  const loadingStyle: React.CSSProperties = {
    textAlign: 'center',
    padding: '60px 20px',
    fontSize: '16px',
    color: '#666',
  };

  const errorStyle: React.CSSProperties = {
    background: '#fee',
    color: '#c33',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '24px',
    border: '1px solid #fcc',
  };

  const historyItemStyle: React.CSSProperties = {
    padding: '16px',
    background: '#f8f9fa',
    borderRadius: '8px',
    marginBottom: '12px',
    borderLeft: '4px solid #667eea',
  };

  const productRowStyle: React.CSSProperties = {
    padding: '12px',
    background: '#f8f9fa',
    borderRadius: '8px',
    marginBottom: '8px',
  };

  // Helpers
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={loadingStyle}>
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
          <p style={{ marginTop: '16px' }}>Loading contract details...</p>
        </div>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div style={containerStyle}>
        <div style={errorStyle}>❌ {error || 'Contract not found'}</div>
        {onClose && (
          <button onClick={onClose} style={secondaryButtonStyle}>
            Close
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div>
          <h1 style={titleStyle}>Contract Details</h1>
          <div style={{ fontSize: '20px', fontWeight: '600', color: '#667eea' }}>
            {contract.reference}
          </div>
        </div>

        <div style={buttonGroupStyle}>
          {onEdit && (
            <button onClick={() => onEdit(contract)} style={buttonStyle}>
              Edit Contract
            </button>
          )}
          <button onClick={refreshContract} style={secondaryButtonStyle}>
            Refresh
          </button>
          {onClose && (
            <button onClick={onClose} style={secondaryButtonStyle}>
              Close
            </button>
          )}
        </div>
      </div>

      {/* Basic Information */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Basic Information</h2>
        <div style={gridStyle}>
          <div style={fieldStyle}>
            <div style={labelStyle}>Reference</div>
            <div style={valueStyle}>{contract.reference || `#${contract.id}`}</div>
          </div>

          <div style={fieldStyle}>
            <div style={labelStyle}>Status Contrat</div>
            <div>
              {contract.status_contrat && (
                <span
                  style={{
                    ...badgeStyle,
                    backgroundColor: `${contract.status_contrat.color || '#667eea'}20`,
                    color: contract.status_contrat.color || '#667eea',
                    border: `1px solid ${contract.status_contrat.color || '#667eea'}40`,
                  }}
                >
                  {contract.status_contrat.icon} {contract.status_contrat.name}
                </span>
              )}
            </div>
          </div>

          <div style={fieldStyle}>
            <div style={labelStyle}>Confirmed</div>
            <div>
              {contract.confirme ? (
                <span style={{ ...badgeStyle, backgroundColor: '#28a74520', color: '#28a745' }}>
                  ✅ Yes
                </span>
              ) : (
                <span style={{ ...badgeStyle, backgroundColor: '#ffc10720', color: '#ffc107' }}>
                  ⏳ No
                </span>
              )}
            </div>
          </div>

          <div style={fieldStyle}>
            <div style={labelStyle}>Active</div>
            <div>
              <span
                style={{
                  ...badgeStyle,
                  backgroundColor: contract.actif ? '#28a74520' : '#dc354520',
                  color: contract.actif ? '#28a745' : '#dc3545',
                }}
              >
                {contract.actif ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          <div style={fieldStyle}>
            <div style={labelStyle}>Facturable</div>
            <div style={valueStyle}>{contract.facturable ? '✅ Yes' : '❌ No'}</div>
          </div>

          <div style={fieldStyle}>
            <div style={labelStyle}>Bloqué</div>
            <div style={valueStyle}>{contract.bloque ? '🔒 Yes' : '🔓 No'}</div>
          </div>

          <div style={fieldStyle}>
            <div style={labelStyle}>Has Photos</div>
            <div style={valueStyle}>{contract.has_photos ? '📷 Yes' : '❌ No'}</div>
          </div>

          <div style={fieldStyle}>
            <div style={labelStyle}>Has Documents</div>
            <div style={valueStyle}>{contract.has_documents ? '📄 Yes' : '❌ No'}</div>
          </div>
        </div>
      </div>

      {/* Customer Information */}
      {contract.customer && (
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Customer Information</h2>
          <div style={gridStyle}>
            <div style={fieldStyle}>
              <div style={labelStyle}>Name</div>
              <div style={valueStyle}>
                {contract.customer.company || contract.customer.nom_prenom}
              </div>
            </div>

            <div style={fieldStyle}>
              <div style={labelStyle}>Gender</div>
              <div style={valueStyle}>{contract.customer.gender || '-'}</div>
            </div>

            <div style={fieldStyle}>
              <div style={labelStyle}>Email</div>
              <div style={valueStyle}>{contract.customer.email || '-'}</div>
            </div>

            <div style={fieldStyle}>
              <div style={labelStyle}>Phone</div>
              <div style={valueStyle}>{contract.customer.telephone || contract.customer.phone || '-'}</div>
            </div>

            <div style={fieldStyle}>
              <div style={labelStyle}>Mobile</div>
              <div style={valueStyle}>{contract.customer.mobile || '-'}</div>
            </div>

            <div style={fieldStyle}>
              <div style={labelStyle}>Mobile 2</div>
              <div style={valueStyle}>{contract.customer.mobile2 || '-'}</div>
            </div>

            <div style={fieldStyle}>
              <div style={labelStyle}>Occupation</div>
              <div style={valueStyle}>{contract.customer.occupation || '-'}</div>
            </div>

            <div style={fieldStyle}>
              <div style={labelStyle}>Salary</div>
              <div style={valueStyle}>{contract.customer.salary || '-'}</div>
            </div>
          </div>

          {/* Address */}
          {contract.customer.address && (
            <>
              <h3 style={{ ...sectionTitleStyle, fontSize: '16px', marginTop: '16px' }}>Address</h3>
              <div style={gridStyle}>
                <div style={fieldStyle}>
                  <div style={labelStyle}>Address</div>
                  <div style={valueStyle}>
                    {contract.customer.address.address1}
                    {contract.customer.address.address2 && `, ${contract.customer.address.address2}`}
                  </div>
                </div>

                <div style={fieldStyle}>
                  <div style={labelStyle}>City</div>
                  <div style={valueStyle}>{contract.customer.address.city}</div>
                </div>

                <div style={fieldStyle}>
                  <div style={labelStyle}>Postcode</div>
                  <div style={valueStyle}>{contract.customer.address.postcode}</div>
                </div>

                <div style={fieldStyle}>
                  <div style={labelStyle}>Country</div>
                  <div style={valueStyle}>{contract.customer.address.country}</div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Financial Information */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Financial Information</h2>
        <div style={gridStyle}>
          <div style={fieldStyle}>
            <div style={labelStyle}>Montant TTC</div>
            <div style={{ ...valueStyle, fontSize: '20px', fontWeight: '600', color: '#667eea' }}>
              {formatPrice(contract.montant_ttc)}
            </div>
          </div>

          <div style={fieldStyle}>
            <div style={labelStyle}>Montant HT</div>
            <div style={{ ...valueStyle, fontSize: '18px', fontWeight: '500' }}>
              {formatPrice(contract.montant_ht)}
            </div>
          </div>
        </div>
      </div>

      {/* Important Dates */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Important Dates</h2>
        <div style={gridStyle}>
          <div style={fieldStyle}>
            <div style={labelStyle}>Date Ouverture</div>
            <div style={valueStyle}>{formatDate(contract.date_ouverture)}</div>
          </div>

          <div style={fieldStyle}>
            <div style={labelStyle}>Date Envoi</div>
            <div style={valueStyle}>{formatDateTime(contract.date_envoi)}</div>
          </div>

          <div style={fieldStyle}>
            <div style={labelStyle}>Date Paiement</div>
            <div style={valueStyle}>{formatDate(contract.date_paiement)}</div>
          </div>

          <div style={fieldStyle}>
            <div style={labelStyle}>Date OPC</div>
            <div style={valueStyle}>{formatDateTime(contract.date_opc)}</div>
          </div>

          <div style={fieldStyle}>
            <div style={labelStyle}>Date APF</div>
            <div style={valueStyle}>{formatDate(contract.date_apf)}</div>
          </div>

          <div style={fieldStyle}>
            <div style={labelStyle}>Created</div>
            <div style={valueStyle}>{formatDateTime(contract.created_at)}</div>
          </div>

          <div style={fieldStyle}>
            <div style={labelStyle}>Updated</div>
            <div style={valueStyle}>{formatDateTime(contract.updated_at)}</div>
          </div>
        </div>
      </div>

      {/* Products */}
      {contract.products && contract.products.length > 0 && (
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Products ({contract.products.length})</h2>
          {contract.products.map((product) => (
            <div key={product.id} style={productRowStyle}>
              <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                Product ID: {product.product_id}
                {product.product && ` - ${product.product.name}`}
              </div>
              {product.details && (
                <div style={{ fontSize: '14px', color: '#666' }}>{product.details}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Remarques */}
      {contract.remarques && (
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Remarques</h2>
          <div
            style={{
              padding: '16px',
              background: '#f8f9fa',
              borderRadius: '8px',
              fontSize: '14px',
              lineHeight: '1.6',
            }}
          >
            {contract.remarques}
          </div>
        </div>
      )}

      {/* History */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>
          Change History {historyLoading && '(Loading...)'}
        </h2>
        {history.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
            No history available
          </div>
        ) : (
          history.map((item) => (
            <div key={item.id} style={historyItemStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ fontWeight: '600', color: '#333' }}>
                  {item.user ? `${item.user.firstname} ${item.user.lastname}` : 'Unknown User'}
                  <span
                    style={{
                      marginLeft: '8px',
                      fontSize: '12px',
                      color: '#666',
                      fontWeight: 'normal',
                    }}
                  >
                    ({item.user_application})
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: '#666' }}>
                  {formatDateTime(item.created_at)}
                </div>
              </div>
              <div style={{ fontSize: '14px', color: '#555' }}>{item.history}</div>
            </div>
          ))
        )}
      </div>

      {/* CSS Animation */}
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
  );
}
