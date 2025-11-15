import { createApiClient } from '@/shared/lib/api-client';
import type { ApiResponse } from '@/shared/types/api.types';
import type { User, UserFilters } from '../../types/user.types';

/**
 * User Service
 * Handles all API communication related to users
 */
class UserService {
  /**
   * Fetch all users
   * @param tenantId - The tenant ID for multi-tenancy
   * @param filters - Optional filters for the user list
   * @returns Promise with list of users
   */
  async getUsers(tenantId?: string, filters?: UserFilters): Promise<User[]> {
    try {
      const client = createApiClient(tenantId);

      // Build query parameters from filters
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, String(value));
          }
        });
      }

      const queryString = params.toString();
      const url = `/admin/users${queryString ? `?${queryString}` : ''}`;

      const response = await client.get<ApiResponse<User[]>>(url);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  /**
   * Fetch a single user by ID
   * @param userId - The user ID
   * @param tenantId - The tenant ID for multi-tenancy
   * @returns Promise with user data
   */
  async getUserById(userId: number, tenantId?: string): Promise<User> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get<ApiResponse<User>>(`/admin/users/${userId}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Create a new user
   * @param userData - The user data to create
   * @param tenantId - The tenant ID for multi-tenancy
   * @returns Promise with created user data
   */
  async createUser(userData: Partial<User>, tenantId?: string): Promise<User> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.post<ApiResponse<User>>('/admin/users', userData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Update an existing user
   * @param userId - The user ID
   * @param userData - The user data to update
   * @param tenantId - The tenant ID for multi-tenancy
   * @returns Promise with updated user data
   */
  async updateUser(userId: number, userData: Partial<User>, tenantId?: string): Promise<User> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.put<ApiResponse<User>>(`/admin/users/${userId}`, userData);
      return response.data.data;
    } catch (error) {
      console.error(`Error updating user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Delete a user
   * @param userId - The user ID
   * @param tenantId - The tenant ID for multi-tenancy
   * @returns Promise with success status
   */
  async deleteUser(userId: number, tenantId?: string): Promise<void> {
    try {
      const client = createApiClient(tenantId);
      await client.delete(`/admin/users/${userId}`);
    } catch (error) {
      console.error(`Error deleting user ${userId}:`, error);
      throw error;
    }
  }
}

// Export a singleton instance
export const userService = new UserService();
