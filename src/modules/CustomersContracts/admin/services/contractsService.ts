// ============================================================================
// CustomersContracts Module - Service Layer
// ============================================================================
// This service handles all API communication for the CustomersContracts module
// following the repository pattern from the Laravel backend.
// ============================================================================

import { apiClient } from '@/src/shared/lib/api-client';
import type {
  CustomerContract,
  ContractListResponse,
  ContractDetailResponse,
  ContractStatsResponse,
  ContractHistoryResponse,
  ContractFilters,
  CreateContractData,
  UpdateContractData,
} from '../../types';

const CONTRACTS_BASE_URL = '/admin/customerscontracts/contracts';

/**
 * CustomersContracts Service
 * Provides methods to interact with the contracts API
 */
export const contractsService = {
  /**
   * Get paginated list of contracts with optional filters
   * @param filters - Optional filters for search, pagination, sorting, etc.
   * @returns Promise with paginated contracts data
   */
  async getContracts(filters?: ContractFilters): Promise<ContractListResponse> {
    try {
      const params = new URLSearchParams();

      // Search & Basic Filters
      if (filters?.reference) params.append('reference', filters.reference);
      if (filters?.customer_id) params.append('customer_id', filters.customer_id.toString());
      if (filters?.remarques) params.append('remarques', filters.remarques);

      // Status Filters
      if (filters?.status_contrat_id) params.append('status_contrat_id', filters.status_contrat_id.toString());
      if (filters?.status_installation_id) params.append('status_installation_id', filters.status_installation_id.toString());
      if (filters?.status_admin_id) params.append('status_admin_id', filters.status_admin_id.toString());
      if (filters?.confirme !== undefined) params.append('confirme', filters.confirme ? '1' : '0');
      if (filters?.actif !== undefined) params.append('actif', filters.actif ? '1' : '0');
      if (filters?.status) params.append('status', filters.status);

      // Date Range Filters
      if (filters?.date_ouverture_from) params.append('date_ouverture_from', filters.date_ouverture_from);
      if (filters?.date_ouverture_to) params.append('date_ouverture_to', filters.date_ouverture_to);
      if (filters?.date_paiement_from) params.append('date_paiement_from', filters.date_paiement_from);
      if (filters?.date_paiement_to) params.append('date_paiement_to', filters.date_paiement_to);
      if (filters?.date_opc_from) params.append('date_opc_from', filters.date_opc_from);
      if (filters?.date_opc_to) params.append('date_opc_to', filters.date_opc_to);

      // Team & Staff Filters
      if (filters?.regie_callcenter) params.append('regie_callcenter', filters.regie_callcenter.toString());
      if (filters?.telepro_id) params.append('telepro_id', filters.telepro_id.toString());
      if (filters?.commercial_1_id) params.append('commercial_1_id', filters.commercial_1_id.toString());
      if (filters?.commercial_2_id) params.append('commercial_2_id', filters.commercial_2_id.toString());
      if (filters?.manager_id) params.append('manager_id', filters.manager_id.toString());
      if (filters?.assistant_id) params.append('assistant_id', filters.assistant_id.toString());
      if (filters?.installateur_id) params.append('installateur_id', filters.installateur_id.toString());

      // Financial Filters
      if (filters?.montant_min) params.append('montant_min', filters.montant_min.toString());
      if (filters?.montant_max) params.append('montant_max', filters.montant_max.toString());

      // Boolean Filters
      if (filters?.facturable !== undefined) params.append('facturable', filters.facturable ? '1' : '0');
      if (filters?.bloque !== undefined) params.append('bloque', filters.bloque ? '1' : '0');
      if (filters?.has_photos !== undefined) params.append('has_photos', filters.has_photos ? '1' : '0');
      if (filters?.has_documents !== undefined) params.append('has_documents', filters.has_documents ? '1' : '0');

      // Pagination & Sorting
      if (filters?.sort_by) params.append('sort_by', filters.sort_by);
      if (filters?.sort_order) params.append('sort_order', filters.sort_order);
      if (filters?.per_page) params.append('per_page', filters.per_page.toString());
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.with_relations !== undefined) {
        params.append('with_relations', filters.with_relations ? '1' : '0');
      }

      const url = `${CONTRACTS_BASE_URL}${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await apiClient.get<ContractListResponse>(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching contracts:', error);
      throw error;
    }
  },

  /**
   * Get single contract by ID with all relations
   * @param id - Contract ID
   * @returns Promise with contract details
   */
  async getContract(id: number): Promise<ContractDetailResponse> {
    try {
      const response = await apiClient.get<ContractDetailResponse>(`${CONTRACTS_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching contract ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get contract statistics
   * @returns Promise with aggregated statistics
   */
  async getStatistics(): Promise<ContractStatsResponse> {
    try {
      const response = await apiClient.get<ContractStatsResponse>(`${CONTRACTS_BASE_URL}/statistics`);
      return response.data;
    } catch (error) {
      console.error('Error fetching contract statistics:', error);
      throw error;
    }
  },

  /**
   * Get contract history (change log)
   * @param id - Contract ID
   * @returns Promise with contract history
   */
  async getContractHistory(id: number): Promise<ContractHistoryResponse> {
    try {
      const response = await apiClient.get<ContractHistoryResponse>(`${CONTRACTS_BASE_URL}/${id}/history`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching contract ${id} history:`, error);
      throw error;
    }
  },

  /**
   * Create new contract
   * @param data - Contract creation data
   * @returns Promise with created contract
   */
  async createContract(data: CreateContractData): Promise<ContractDetailResponse> {
    try {
      const response = await apiClient.post<ContractDetailResponse>(CONTRACTS_BASE_URL, data);
      return response.data;
    } catch (error) {
      console.error('Error creating contract:', error);
      throw error;
    }
  },

  /**
   * Update existing contract
   * @param id - Contract ID
   * @param data - Contract update data
   * @returns Promise with updated contract
   */
  async updateContract(id: number, data: UpdateContractData): Promise<ContractDetailResponse> {
    try {
      const response = await apiClient.put<ContractDetailResponse>(`${CONTRACTS_BASE_URL}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating contract ${id}:`, error);
      throw error;
    }
  },

  /**
   * Soft delete contract (sets status to DELETE)
   * @param id - Contract ID
   * @returns Promise with success message
   */
  async deleteContract(id: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.delete<{ success: boolean; message: string }>(
        `${CONTRACTS_BASE_URL}/${id}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error deleting contract ${id}:`, error);
      throw error;
    }
  },

  /**
   * Generate unique contract reference
   * @param prefix - Reference prefix (default: 'CONT')
   * @returns Promise with generated reference
   */
  async generateReference(prefix: string = 'CONT'): Promise<{ success: boolean; reference: string }> {
    try {
      const response = await apiClient.post<{ success: boolean; reference: string }>(
        `${CONTRACTS_BASE_URL}/generate-reference`,
        { prefix }
      );
      return response.data;
    } catch (error) {
      console.error('Error generating contract reference:', error);
      throw error;
    }
  },
};
