// ============================================================================
// CustomersContracts Module - TypeScript Type Definitions
// ============================================================================

// ----------------------------------------------------------------------------
// Status Entities
// ----------------------------------------------------------------------------

export interface ContractStatus {
  id: number;
  name: string;
  color: string;
  icon: string;
}

export interface ContractAdminStatus {
  id: number;
  name: string;
  color: string;
  icon: string;
}

export interface ContractInstallStatus {
  id: number;
  name: string;
  color: string;
  icon: string;
}

// ----------------------------------------------------------------------------
// Customer & Address (nested in contract)
// ----------------------------------------------------------------------------

export interface CustomerAddress {
  id: number;
  address1: string;
  address2: string;
  postcode: string;
  city: string;
  country: string;
}

export interface ContractCustomer {
  id: number;
  company?: string;
  gender?: string | null;
  firstname: string;
  lastname: string;
  nom_prenom?: string;
  email?: string;
  phone: string;
  mobile?: string;
  mobile2?: string;
  phone1?: string;
  telephone?: string;
  birthday?: string | null;
  age?: string | null;
  occupation?: string | null;
  salary?: string | null;
  union_id?: number;
  address?: CustomerAddress;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

// ----------------------------------------------------------------------------
// Contract Product
// ----------------------------------------------------------------------------

export interface ContractProduct {
  id: number;
  contract_id: number;
  product_id: number;
  details: string;
  product?: {
    id: number;
    name: string;
    reference?: string;
    price?: number;
  };
  created_at: string;
  updated_at: string;
}

// ----------------------------------------------------------------------------
// Contract Contributor
// ----------------------------------------------------------------------------

export interface ContractContributor {
  id: number;
  type: string;
  contract_id: number;
  user_id: number;
  attribution_id: number;
  user?: {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
  };
  created_at: string;
  updated_at: string;
}

// ----------------------------------------------------------------------------
// Contract History
// ----------------------------------------------------------------------------

export interface ContractHistory {
  id: number;
  contract_id: number;
  user_id: number;
  user_application: 'admin' | 'superadmin';
  history: string;
  user?: {
    id: number;
    firstname: string;
    lastname: string;
  };
  created_at: string;
  updated_at: string;
}

// ----------------------------------------------------------------------------
// Main Contract Entity (Updated to match backend structure)
// ----------------------------------------------------------------------------

export interface CustomerContract {
  id: number;
  reference: string;

  // Customer (nested object)
  customer?: ContractCustomer;
  customer_id: number;

  // Dates (both old and new field names for compatibility)
  quoted_at?: string | null;
  billing_at?: string | null;
  opened_at?: string | null;
  sent_at?: string | null;
  payment_at?: string | null;
  opc_at?: string | null;
  apf_at?: string | null;
  date_ouverture?: string | null;
  date_envoi?: string | null;
  date_paiement?: string | null;
  date_opc?: string | null;
  date_apf?: string | null;

  // Additional IDs
  meeting_id?: number | null;
  financial_partner_id?: number | null;
  tax_id?: number | null;
  team_id?: number | null;
  opened_at_range_id?: number | null;
  opc_range_id?: number | null;
  company_id?: number | null;

  // Signature status
  is_signed?: 'YES' | 'NO';
  variables?: any;

  // Access & Source
  acces_1: string | null;
  acces_2: string | null;
  source: string | null;
  periode_cee: string | null;
  surface_parcelle: string | null;
  societe_porteuse: string | null;

  // Team & Staff IDs (support both naming conventions)
  regie_callcenter?: number;
  telepro_id?: number;
  commercial_1_id?: number;
  commercial_2_id?: number;
  sale_1_id?: number;
  sale_2_id?: number;
  manager_id?: number;
  assistant_id?: number;
  installateur_id?: number | null;
  installer_user_id?: number | null;
  createur_id?: number | null;
  confirmateur_id?: number | null;
  equipe_installation?: string | null;
  sous_traitant_id?: number | null;

  // Status Fields (support both naming conventions)
  status_contrat_id?: number;
  status_contrat?: ContractStatus;
  state_id?: number;
  contract_status?: ContractStatus;
  status_installation_id?: number | null;
  status_installation?: ContractInstallStatus | null;
  install_state_id?: number | null;
  install_status?: ContractInstallStatus | null;
  status_admin_id?: number | null;
  status_admin?: ContractAdminStatus | null;
  admin_status_id?: number | null;
  admin_status?: ContractAdminStatus | null;

  // Boolean Flags
  confirme: boolean;
  facturable: boolean;
  bloque: boolean;
  devis_bloque: boolean;
  has_photos: boolean;
  controle_qualite_valide: boolean;
  has_documents: boolean;

  // Reports
  rapport_temps: string | null;
  rapport_admin: string | null;
  rapport_attribution: string | null;
  rapport_installation: string | null;

  // Financial (support both naming conventions)
  montant_ttc?: number;
  montant_ht?: number;
  total_price_with_taxe?: number;
  total_price_without_taxe?: number;
  mensuality?: number;
  advance_payment?: number;

  // Other Fields
  campaign_id?: number | null;
  esclave?: string | null;
  actif?: boolean;
  status_flag?: 'ACTIVE' | 'DELETE';
  remarques?: string;
  remarks?: string;
  sav_at_range_id?: number;

  // Relations (optional, loaded on demand)
  products?: ContractProduct[];
  contributors?: ContractContributor[];
  history?: ContractHistory[];

  // Timestamps
  created_at: string;
  updated_at: string;
}

// ----------------------------------------------------------------------------
// API Request/Response Types
// ----------------------------------------------------------------------------

export interface ContractListResponse {
  success: boolean;
  data: {
    contracts: CustomerContract[];
    pagination?: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
      from: number | null;
      to: number | null;
    };
  };
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
  };
}

export interface ContractDetailResponse {
  success: boolean;
  data: CustomerContract;
}

export interface ContractStatsResponse {
  success: boolean;
  data: {
    total_contracts: number;
    total_signed: number;
    total_unsigned: number;
    total_revenue: number;
    by_status: Array<{
      status_id: number;
      status_name: string;
      count: number;
    }>;
    by_install_status: Array<{
      status_id: number;
      status_name: string;
      count: number;
    }>;
    recent_contracts: number;
  };
}

export interface ContractHistoryResponse {
  success: boolean;
  data: ContractHistory[];
}

// ----------------------------------------------------------------------------
// Filter Types (Updated to match backend fields)
// ----------------------------------------------------------------------------

export interface ContractFilters {
  // Search & Basic Filters
  reference?: string;
  customer_id?: number;
  remarques?: string;

  // Status Filters
  status_contrat_id?: number;
  status_installation_id?: number;
  status_admin_id?: number;
  confirme?: boolean;
  actif?: boolean;
  status?: 'ACTIVE' | 'DELETE';

  // Date Range Filters
  date_ouverture_from?: string;
  date_ouverture_to?: string;
  date_paiement_from?: string;
  date_paiement_to?: string;
  date_opc_from?: string;
  date_opc_to?: string;

  // Team & Staff Filters
  regie_callcenter?: number;
  telepro_id?: number;
  commercial_1_id?: number;
  commercial_2_id?: number;
  manager_id?: number;
  assistant_id?: number;
  installateur_id?: number;

  // Financial Filters
  montant_min?: number;
  montant_max?: number;

  // Boolean Filters
  facturable?: boolean;
  bloque?: boolean;
  has_photos?: boolean;
  has_documents?: boolean;

  // Pagination & Sorting
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
  with_relations?: boolean;
}

// ----------------------------------------------------------------------------
// Form Data Types (Updated to match backend structure)
// ----------------------------------------------------------------------------

export interface CreateContractData {
  reference?: string;
  customer_id?: number;

  // Dates (API expects these field names)
  quoted_at?: string;
  billing_at?: string;
  opened_at?: string;
  opc_at?: string;
  date_ouverture?: string;
  date_envoi?: string;
  date_paiement?: string;
  date_opc?: string;
  date_apf?: string;

  // Nested customer data (for creating new customer with contract)
  customer?: {
    lastname: string;
    firstname: string;
    phone: string;
    union_id?: number;
    address: {
      address1: string;
      postcode: string;
      city: string;
    };
  };

  // Additional fields from backend validation
  sent_at?: string;
  payment_at?: string;
  apf_at?: string;
  opened_at_range_id?: number;
  opc_range_id?: number;
  state_id?: number;
  install_state_id?: number;
  admin_status_id?: number;
  total_price_with_taxe?: number;
  total_price_without_taxe?: number;
  remarks?: string;
  variables?: any;
  is_signed?: 'YES' | 'NO';
  status?: 'ACTIVE' | 'DELETE';
  company_id?: number;
  team_id?: number;
  meeting_id?: number;
  financial_partner_id?: number;
  tax_id?: number;

  // Access & Source
  acces_1?: string;
  acces_2?: string;
  source?: string;
  periode_cee?: string;
  surface_parcelle?: string;
  societe_porteuse?: string;

  // Team & Staff
  regie_callcenter?: number;
  telepro_id?: number;
  sale_1_id?: number;
  sale_2_id?: number;
  commercial_1_id?: number;
  commercial_2_id?: number;
  manager_id?: number;
  assistant_id?: number;
  installer_user_id?: number;
  installateur_id?: number;
  createur_id?: number;
  confirmateur_id?: number;
  equipe_installation?: string;
  sous_traitant_id?: number;

  // Status
  status_contrat_id?: number;
  status_installation_id?: number;
  status_admin_id?: number;

  // Boolean Flags
  confirme?: boolean;
  facturable?: boolean;
  bloque?: boolean;
  devis_bloque?: boolean;
  has_photos?: boolean;
  controle_qualite_valide?: boolean;
  has_documents?: boolean;

  // Reports
  rapport_temps?: string;
  rapport_admin?: string;
  rapport_attribution?: string;
  rapport_installation?: string;

  // Financial
  montant_ttc?: number;
  montant_ht?: number;

  // Other
  campaign_id?: number;
  esclave?: string;
  actif?: boolean;
  status_flag?: 'ACTIVE' | 'DELETE';
  remarques?: string;

  // Products
  products?: Array<{
    product_id: number;
    details?: string;
  }>;
}

export interface UpdateContractData extends Partial<CreateContractData> {}

// ----------------------------------------------------------------------------
// Utility Types
// ----------------------------------------------------------------------------

export type ContractSortField =
  | 'reference'
  | 'customer_id'
  | 'date_ouverture'
  | 'date_paiement'
  | 'date_opc'
  | 'montant_ttc'
  | 'created_at'
  | 'updated_at';

export type ContractStatusType = 'ACTIVE' | 'DELETE';
export type ContractUserApplication = 'admin' | 'superadmin';
