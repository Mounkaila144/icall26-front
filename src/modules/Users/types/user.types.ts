/**
 * User group information
 */
export interface UserGroup {
  id: number;
  name: string;
  permissions: string[] | null;
}

/**
 * User entity from the API
 */
export interface User {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  full_name: string;
  email: string;
  sex: string;
  phone: string;
  mobile: string;
  birthday: string | null;
  picture: string;
  application: string;
  is_active: 'YES' | 'NO';
  is_guess: 'YES' | 'NO';
  is_locked: 'YES' | 'NO';
  locked_at: string | null;
  is_secure_by_code: 'YES' | 'NO';
  status: string;
  number_of_try: number;
  last_password_gen: string;
  lastlogin: string | null;
  created_at: string;
  updated_at: string;
  groups_list: string;
  teams_list: string;
  functions_list: string;
  profiles_list: string;
  groups: UserGroup[];
  company_id: number | null;
  callcenter_id: number;
  team_id: number | null;
  creator_id: number | null;
  unlocked_by: number | null;
  permissions: string[];
  roles: string[];
  is_superadmin: boolean;
}

/**
 * Filters for user list
 */
export interface UserFilters {
  search?: string;
  status?: string;
  is_active?: 'YES' | 'NO';
  is_locked?: 'YES' | 'NO';
  team_id?: number;
  application?: string;
}

/**
 * Pagination meta information
 */
export interface PaginationMeta {
  current_page: number;
  total: number;
  per_page: number;
  last_page: number;
}
