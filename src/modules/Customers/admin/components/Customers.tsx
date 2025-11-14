'use client';

import React, { useEffect, useState } from 'react';
import { customersService } from '../services/customersService';
import type { Customer, CustomerFilters, CustomerStatsResponse } from '../../types';

/**
 * Customers Component
 * Displays a paginated list of customers with search and filtering
 */
export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState<CustomerStatsResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<CustomerFilters>({
    status: 'ACTIVE',
    sort_by: 'created_at',
    sort_order: 'desc',
    per_page: 15,
  });

  // Load customers
  useEffect(() => {
    loadCustomers();
  }, [currentPage, filters]);

  // Load stats
  useEffect(() => {
    loadStats();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await customersService.getCustomers({
        ...filters,
        page: currentPage,
        search: search || undefined,
      });

      console.log('🔍 API Response:', response);
      console.log('🔍 Response data:', response.data);
      console.log('🔍 Response meta:', response.meta);

      if (response.success) {
        setCustomers(response.data);

        // Handle meta - may not exist in current API response
        if (response.meta) {
          setTotalPages(response.meta.last_page);
          setTotal(response.meta.total);
        } else {
          // Fallback if no meta
          setTotalPages(1);
          setTotal(response.data.length);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load customers');
      console.error('❌ Error loading customers:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await customersService.getStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadCustomers();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this customer?')) {
      return;
    }

    try {
      await customersService.deleteCustomer(id);
      loadCustomers();
      loadStats();
    } catch (err: any) {
      alert('Error deleting customer: ' + err.message);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1
          style={{
            fontSize: '32px',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '8px',
          }}
        >
          Customers Management
        </h1>
        <p style={{ color: '#666', fontSize: '16px' }}>
          Manage and view all your customers
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '24px',
          }}
        >
          <StatsCard
            label="Total Customers"
            value={stats.total_customers}
            color="#667eea"
          />
          <StatsCard
            label="With Company"
            value={stats.with_company}
            color="#48bb78"
          />
          <StatsCard
            label="With Email"
            value={stats.with_email}
            color="#ed8936"
          />
          <StatsCard
            label="With Mobile"
            value={stats.with_mobile}
            color="#9f7aea"
          />
        </div>
      )}

      {/* Filters */}
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <form onSubmit={handleSearch} style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: '1 1 300px',
                padding: '10px 16px',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '14px',
              }}
            />
            <button
              type="submit"
              style={{
                padding: '10px 24px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Search
            </button>
          </div>
        </form>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <select
            value={filters.status}
            onChange={(e) =>
              setFilters({ ...filters, status: e.target.value as any })
            }
            style={{
              padding: '8px 12px',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '14px',
            }}
          >
            <option value="ACTIVE">Active</option>
            <option value="DELETE">Deleted</option>
          </select>

          <select
            value={filters.sort_by}
            onChange={(e) => setFilters({ ...filters, sort_by: e.target.value })}
            style={{
              padding: '8px 12px',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '14px',
            }}
          >
            <option value="created_at">Created Date</option>
            <option value="firstname">First Name</option>
            <option value="lastname">Last Name</option>
            <option value="company">Company</option>
            <option value="email">Email</option>
          </select>

          <select
            value={filters.sort_order}
            onChange={(e) =>
              setFilters({ ...filters, sort_order: e.target.value as any })
            }
            style={{
              padding: '8px 12px',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '14px',
            }}
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>

          <select
            value={filters.per_page}
            onChange={(e) =>
              setFilters({ ...filters, per_page: parseInt(e.target.value) })
            }
            style={{
              padding: '8px 12px',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '14px',
            }}
          >
            <option value="10">10 per page</option>
            <option value="15">15 per page</option>
            <option value="25">25 per page</option>
            <option value="50">50 per page</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #667eea',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto',
              }}
            />
            <p style={{ marginTop: '16px', color: '#666' }}>Loading customers...</p>
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
        ) : error ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <p style={{ color: '#e53e3e', fontSize: '16px' }}>{error}</p>
          </div>
        ) : customers.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
            <p style={{ color: '#666', fontSize: '16px' }}>No customers found</p>
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e0e0e0' }}>
                    <th style={tableHeaderStyle}>ID</th>
                    <th style={tableHeaderStyle}>Company/Name</th>
                    <th style={tableHeaderStyle}>Email</th>
                    <th style={tableHeaderStyle}>Phone/Mobile</th>
                    <th style={tableHeaderStyle}>Address</th>
                    <th style={tableHeaderStyle}>Created</th>
                    <th style={tableHeaderStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr
                      key={customer.id}
                      style={{ borderBottom: '1px solid #e0e0e0' }}
                    >
                      <td style={tableCellStyle}>{customer.id}</td>
                      <td style={tableCellStyle}>
                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                          {customer.display_name}
                        </div>
                        {customer.occupation && (
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            {customer.occupation}
                          </div>
                        )}
                      </td>
                      <td style={tableCellStyle}>{customer.email || '-'}</td>
                      <td style={tableCellStyle}>
                        {customer.phone && (
                          <div style={{ fontSize: '13px' }}>📞 {customer.phone}</div>
                        )}
                        {customer.mobile && (
                          <div style={{ fontSize: '13px' }}>📱 {customer.mobile}</div>
                        )}
                      </td>
                      <td style={tableCellStyle}>
                        {customer.primary_address ? (
                          <div style={{ fontSize: '13px' }}>
                            {customer.primary_address.city},{' '}
                            {customer.primary_address.postcode}
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td style={tableCellStyle}>
                        <div style={{ fontSize: '13px' }}>
                          {new Date(customer.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td style={tableCellStyle}>
                        <button
                          onClick={() => handleDelete(customer.id)}
                          style={{
                            padding: '6px 12px',
                            background: '#fee',
                            color: '#c33',
                            border: '1px solid #fcc',
                            borderRadius: '6px',
                            fontSize: '12px',
                            cursor: 'pointer',
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div
              style={{
                padding: '20px',
                borderTop: '1px solid #e0e0e0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px',
              }}
            >
              <div style={{ color: '#666', fontSize: '14px' }}>
                Showing {customers.length} of {total} customers
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '6px',
                    background: currentPage === 1 ? '#f5f5f5' : 'white',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                  }}
                >
                  Previous
                </button>
                <div
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '6px',
                    background: '#f9fafb',
                    fontSize: '14px',
                  }}
                >
                  Page {currentPage} of {totalPages}
                </div>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '6px',
                    background: currentPage === totalPages ? '#f5f5f5' : 'white',
                    cursor:
                      currentPage === totalPages ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Styles
const tableHeaderStyle: React.CSSProperties = {
  padding: '12px 16px',
  textAlign: 'left',
  fontSize: '13px',
  fontWeight: '600',
  color: '#333',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const tableCellStyle: React.CSSProperties = {
  padding: '12px 16px',
  fontSize: '14px',
  color: '#333',
};

// Stats Card Component
function StatsCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div
      style={{
        background: 'white',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        borderLeft: `4px solid ${color}`,
      }}
    >
      <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>
        {label}
      </div>
      <div style={{ fontSize: '28px', fontWeight: '700', color: color }}>
        {value.toLocaleString()}
      </div>
    </div>
  );
}
