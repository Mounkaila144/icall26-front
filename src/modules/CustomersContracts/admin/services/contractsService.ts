// ============================================================================
// CustomersContracts Module - Service Layer
// ============================================================================
// This service handles all API communication for the CustomersContracts module
// following the repository pattern from the Laravel backend.
// ============================================================================

import { apiClient } from '@/shared/lib/api-client';
import type {
  CustomerContract,
  ContractListResponse,
  ContractDetailResponse,
  ContractStatsResponse,
  ContractHistoryResponse,
  ContractFilters,
  CreateContractData,
  UpdateContractData,
  FilterOptionsResponse,
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

      if (filters) {
        for (const [key, value] of Object.entries(filters)) {
          if (value === undefined || value === null || value === '') continue
          params.append(key, String(value))
        }
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
   * Get filter dropdown options (statuses, users, teams, partners, etc.)
   * Matches Symfony's CustomerContractsFormFilter choices.
   */
  async getFilterOptions(lang: string = 'fr'): Promise<FilterOptionsResponse> {
    try {
      const response = await apiClient.get<FilterOptionsResponse>(
        `${CONTRACTS_BASE_URL}/filter-options?lang=${lang}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching filter options:', error);
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
