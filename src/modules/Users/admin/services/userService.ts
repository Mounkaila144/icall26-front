import { createApiClient } from '@/shared/lib/api-client';
import type { ApiResponse } from '@/shared/types/api.types';
import type { User, UserFilters, PaginatedUsersResponse, UserQueryParams } from '../../types/user.types';

/**
 * User Service
 * Handles all API communication related to users
 */
class UserService {
  /**
   * Fetch paginated users with filters
   * @param tenantId - The tenant ID for multi-tenancy
   * @param params - Query parameters including pagination and filters
   * @returns Promise with paginated response
   */
  async getUsers(
    tenantId?: string,
    params?: UserQueryParams
  ): Promise<PaginatedUsersResponse> {
    try {
      const client = createApiClient(tenantId);

      // Build query parameters
      const queryParams = new URLSearchParams();

      // Add pagination params
      if (params?.page) {
        queryParams.append('page', String(params.page));
      }

      if (params?.nbitemsbypage) {
        queryParams.append('nbitemsbypage', String(params.nbitemsbypage));
      }

      // Add filter params
      if (params?.filter) {
        // Search filter
        if (params.filter.search) {
          queryParams.append('filter[search]', params.filter.search);
        }

        // Equal filters
        if (params.filter.equal) {
          Object.entries(params.filter.equal).forEach(([key, value]) => {
            queryParams.append(`filter[equal][${key}]`, value);
          });
        }

        // Order filters
        if (params.filter.order) {
          Object.entries(params.filter.order).forEach(([key, value]) => {
            queryParams.append(`filter[order][${key}]`, value);
          });
        }

        // Range filters
        if (params.filter.range) {
          Object.entries(params.filter.range).forEach(([key, value]) => {
            queryParams.append(`filter[range][${key}][from]`, value.from);
            queryParams.append(`filter[range][${key}][to]`, value.to);
          });
        }
      }

      const queryString = queryParams.toString();
      const url = `/admin/users${queryString ? `?${queryString}` : ''}`;

      const response = await client.get<ApiResponse<PaginatedUsersResponse>>(url);

      return response.data;
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
