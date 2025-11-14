'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTenant } from '@/src/shared/lib/tenant-context';
import { userService } from '../services/userService';
import type { User, UserFilters } from '../../types/user.types';

/**
 * Custom hook for managing users
 * Provides state management and data fetching for the user list
 */
export const useUsers = (initialFilters?: UserFilters) => {
  const { tenantId } = useTenant();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<UserFilters>(initialFilters || {});

  /**
   * Fetch users from the API
   */
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getUsers(tenantId, filters);
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch users'));
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }, [tenantId, filters]);

  /**
   * Refresh the user list
   */
  const refresh = useCallback(() => {
    fetchUsers();
  }, [fetchUsers]);

  /**
   * Update filters and refetch
   */
  const updateFilters = useCallback((newFilters: UserFilters) => {
    setFilters(newFilters);
  }, []);

  /**
   * Delete a user
   */
  const deleteUser = useCallback(async (userId: number) => {
    try {
      setLoading(true);
      setError(null);
      await userService.deleteUser(userId, tenantId);
      // Refresh the list after deletion
      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete user'));
      console.error('Error deleting user:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [tenantId, fetchUsers]);

  // Fetch users on mount and when dependencies change
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    filters,
    updateFilters,
    refresh,
    deleteUser,
  };
};
