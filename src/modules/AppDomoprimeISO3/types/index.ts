// ============================================================================
// AppDomoprimeISO3 Module - Type Definitions
// ============================================================================
// Types matching the Laravel backend Modules/AppDomoprimeISO3 entities
// and Symfony app_domoprime_iso3 module (multi-work quotations)
// ============================================================================

import type {
  DomoprimeEnergy,
  DomoprimeClass,
  DomoprimeSector,
  DomoprimeSubventionType,
  DomoprimeQuotation,
  DomoprimeQuotationProduct,
  DomoprimeBilling,
  FilterOption,
} from '@/src/modules/AppDomoprime';

// Re-export shared types used by this module
export type {
  DomoprimeEnergy,
  DomoprimeClass,
  DomoprimeSector,
  DomoprimeSubventionType,
  DomoprimeQuotation,
  DomoprimeQuotationProduct,
  DomoprimeBilling,
  FilterOption,
};

// ----------------------------------------------------------------------------
// Contract Results (CUMAC block from Symfony resultsForContract)
// ----------------------------------------------------------------------------

export interface Iso3ContractResultsInfo {
  zone: string | null;
  region: string | null;
  energy: string | null;
  level: string | null;
}

export interface Iso3ContractResultsCumacPrice {
  qmac: number | null;
  has_surface: boolean;
}

export interface Iso3ContractResultsCumac {
  prices: Iso3ContractResultsCumacPrice[];
  is_ana_available: boolean;
}

export interface Iso3ContractResultsData {
  has_polluter: boolean;
  info: Iso3ContractResultsInfo | null;
  cumac: Iso3ContractResultsCumac | null;
}

export interface Iso3ContractResultsResponse {
  success: boolean;
  data: Iso3ContractResultsData;
}

// ----------------------------------------------------------------------------
// ISO3 Type Date (t_domoprime_iso_type_date)
// ----------------------------------------------------------------------------

export interface Iso3TypeDate {
  id: number;
  date: string | null;
  type: string;
  difference: number;
  adder: number;
  is_copied: 'YES' | 'NO';
  is_dated_copied: 'YES' | 'NO';
  created_at: string;
  updated_at: string;
}

export interface SaveTypeDateData {
  date: string | null;
  type: string;
  difference: number;
  adder: number;
  is_copied?: 'YES' | 'NO';
  is_dated_copied?: 'YES' | 'NO';
}

// ----------------------------------------------------------------------------
// Previous Energy (re-uses AppDomoprime t_domoprime_previous_energy)
// ----------------------------------------------------------------------------

export interface Iso3PreviousEnergy {
  id: number;
  name: string;
  translations?: Iso3I18n[];
}

export interface Iso3I18n {
  id: number;
  lang: string;
  value: string;
}

export interface CreatePreviousEnergyData {
  translations: Record<string, string>;
}

export type UpdatePreviousEnergyData = CreatePreviousEnergyData;

// ----------------------------------------------------------------------------
// Polluter Class Sector Energy (t_domoprime_polluter_class_sector_energy)
// ----------------------------------------------------------------------------

export interface Iso3PolluterClassSectorEnergy {
  id: number;
  energy_id: number;
  polluter_id: number;
  class_id: number;
  sector_id: number;
  price: number;
  created_at: string;
  updated_at: string;

  // Relations (loaded on demand)
  energy?: DomoprimeEnergy;
  domoprime_class?: DomoprimeClass;
  sector?: DomoprimeSector;
  coefficients?: Iso3CumacSurfaceCoefficient[];
}

export interface CreatePolluterSectorEnergyData {
  energy_id: number;
  class_id: number;
  sector_id: number;
  price: number;
}

// ----------------------------------------------------------------------------
// Cumac Surface Coefficients (t_domoprime_iso_cumac_class_region_price_surface)
// ----------------------------------------------------------------------------

export interface Iso3CumacSurfaceCoefficient {
  id: number;
  price_id: number;
  min: number;
  max: number;
  coef: number;
  created_at: string;
  updated_at: string;
}

export interface SaveCoefficientData {
  min: number;
  max: number;
  coef: number;
}

// ----------------------------------------------------------------------------
// Product Sector Energy Class Surface (t_domoprime_iso_product_sector_energy_class_surface)
// ----------------------------------------------------------------------------

export interface Iso3ProductSurfaceCoefficient {
  id: number;
  price_id: number;
  min: number;
  max: number;
  coef: number;
  created_at: string;
  updated_at: string;
}

// ----------------------------------------------------------------------------
// Master Product (for quotation creation)
// ----------------------------------------------------------------------------

export interface Iso3MasterProduct {
  id: number;
  name: string;
  title: string;
  type: string;
  items?: Iso3MasterProductItem[];
}

export interface Iso3MasterProductItem {
  id: number;
  product_id: number;
  item_id: number;
  title: string;
  unit: string;
  coefficient: number;
  is_mandatory: 'YES' | 'NO';
  is_master: 'YES' | 'NO';
  purchase_price_with_tax: number;
  purchase_price_without_tax: number;
  sale_price_with_tax: number;
  sale_price_without_tax: number;
}

// ----------------------------------------------------------------------------
// Quotation Meeting / Contract creation
// ----------------------------------------------------------------------------

export interface CreateQuotationMeetingData {
  meeting_id: number;
  customer_id: number;
  type: string;
  polluter_id?: number;
  subvention_type_id?: number;
  dated_at?: string;
  discount_amount?: number;
  products: QuotationProductInput[];
}

export interface CreateQuotationContractData {
  contract_id: number;
  customer_id: number;
  type: string;
  polluter_id?: number;
  subvention_type_id?: number;
  dated_at?: string;
  discount_amount?: number;
  products: QuotationProductInput[];
}

export interface QuotationProductInput {
  product_id: number;
  quantity: number;
  items?: QuotationProductItemInput[];
}

export interface QuotationProductItemInput {
  item_id: number;
  quantity: number;
  coefficient?: number;
}

export type UpdateQuotationMeetingData = Partial<CreateQuotationMeetingData>;
export type UpdateQuotationContractData = Partial<CreateQuotationContractData>;

// ----------------------------------------------------------------------------
// Simulation
// ----------------------------------------------------------------------------

export interface Iso3SimulationInput {
  type: string;
  customer_id: number;
  polluter_id?: number;
  subvention_type_id?: number;
  products: QuotationProductInput[];
}

export interface Iso3SimulationResult {
  total_sale_with_tax: number;
  total_sale_without_tax: number;
  total_tax: number;
  prime: number;
  cee_prime: number;
  rest_in_charge: number;
  qmac_value: number;
  products: DomoprimeQuotationProduct[];
}

// ----------------------------------------------------------------------------
// API Response Types
// ----------------------------------------------------------------------------

export interface Iso3TypeDateListResponse {
  success: boolean;
  data: Iso3TypeDate[];
}

export interface Iso3TypeDateSaveResponse {
  success: boolean;
  data: Iso3TypeDate[];
  message?: string;
}

export interface Iso3PreviousEnergyListResponse {
  success: boolean;
  data: Iso3PreviousEnergy[];
}

export interface Iso3PreviousEnergyResponse {
  success: boolean;
  data: Iso3PreviousEnergy;
}

export interface Iso3PolluterPricingListResponse {
  success: boolean;
  data: Iso3PolluterClassSectorEnergy[];
}

export interface Iso3PolluterPricingResponse {
  success: boolean;
  data: Iso3PolluterClassSectorEnergy;
}

export interface Iso3MasterProductListResponse {
  success: boolean;
  data: Iso3MasterProduct[];
}

export interface Iso3SubventionTypeListResponse {
  success: boolean;
  data: DomoprimeSubventionType[];
}

export interface Iso3QuotationResponse {
  success: boolean;
  data: DomoprimeQuotation;
}

export interface Iso3QuotationListResponse {
  success: boolean;
  data: {
    quotations: DomoprimeQuotation[];
    pagination?: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

export interface Iso3BillingListResponse {
  success: boolean;
  data: {
    billings: DomoprimeBilling[];
    pagination?: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

export interface Iso3SimulationResponse {
  success: boolean;
  data: Iso3SimulationResult;
}

export interface Iso3ImportResponse {
  success: boolean;
  data: {
    imported: number;
    errors?: string[];
  };
  message?: string;
}
