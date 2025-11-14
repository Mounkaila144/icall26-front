// ============================================================================
// CustomersContracts Module - Contract Form Hook
// ============================================================================
// Custom hook for managing contract creation and editing forms
// ============================================================================

'use client';

import { useState, useCallback } from 'react';
import { contractsService } from '../services/contractsService';
import type { CreateContractData, UpdateContractData, CustomerContract } from '../../types';

interface UseContractFormReturn {
  // Loading & Error States
  submitting: boolean;
  error: string | null;

  // Actions
  createContract: (data: CreateContractData) => Promise<CustomerContract | null>;
  updateContract: (id: number, data: UpdateContractData) => Promise<CustomerContract | null>;
  generateReference: (prefix?: string) => Promise<string | null>;
  clearError: () => void;
}

/**
 * Custom hook for contract form management
 * Handles form submission, validation, and API communication
 */
export const useContractForm = (): UseContractFormReturn => {
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Create new contract
   */
  const createContract = useCallback(async (data: CreateContractData): Promise<CustomerContract | null> => {
    try {
      setSubmitting(true);
      setError(null);

      const response = await contractsService.createContract(data);

      if (response.success) {
        return response.data;
      } else {
        setError('Failed to create contract');
        return null;
      }
    } catch (err: any) {
      console.error('Error creating contract:', err);

      // Handle validation errors
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        const errorMessages = Object.values(errors).flat();
        setError(errorMessages.join(', '));
      } else {
        setError(err instanceof Error ? err.message : 'An error occurred while creating contract');
      }

      return null;
    } finally {
      setSubmitting(false);
    }
  }, []);

  /**
   * Update existing contract
   */
  const updateContract = useCallback(
    async (id: number, data: UpdateContractData): Promise<CustomerContract | null> => {
      try {
        setSubmitting(true);
        setError(null);

        const response = await contractsService.updateContract(id, data);

        if (response.success) {
          return response.data;
        } else {
          setError('Failed to update contract');
          return null;
        }
      } catch (err: any) {
        console.error(`Error updating contract ${id}:`, err);

        // Handle validation errors
        if (err.response?.data?.errors) {
          const errors = err.response.data.errors;
          const errorMessages = Object.values(errors).flat();
          setError(errorMessages.join(', '));
        } else {
          setError(err instanceof Error ? err.message : 'An error occurred while updating contract');
        }

        return null;
      } finally {
        setSubmitting(false);
      }
    },
    []
  );

  /**
   * Generate unique contract reference
   */
  const generateReference = useCallback(async (prefix: string = 'CONT'): Promise<string | null> => {
    try {
      const response = await contractsService.generateReference(prefix);

      if (response.success) {
        return response.reference;
      }

      return null;
    } catch (err) {
      console.error('Error generating reference:', err);
      return null;
    }
  }, []);

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Loading & Error
    submitting,
    error,

    // Actions
    createContract,
    updateContract,
    generateReference,
    clearError,
  };
};
