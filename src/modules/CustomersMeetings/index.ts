// ============================================================================
// CustomersMeetings Module - Public API Exports
// ============================================================================

// Admin Layer Components
export { default as MeetingsList } from './admin/components/MeetingsList';

// Admin Layer Services
export { meetingsService } from './admin/services/meetingsService';

// Admin Layer Hooks
export { useMeetings } from './admin/hooks/useMeetings';
export { useMeetingTranslations } from './admin/hooks/useMeetingTranslations';

// Type Exports
export type {
  // Main Entities
  CustomerMeeting,
  MeetingStatus,
  MeetingCustomer,
  MeetingProduct,
  MeetingHistory,

  // API Response Types
  MeetingListResponse,
  MeetingDetailResponse,
  MeetingActionResponse,
  MeetingHistoryResponse,

  // Filter & Form Types
  MeetingFilters,
  CreateMeetingData,
  UpdateMeetingData,

  // Filter Options
  MeetingFilterOptions,
  FilterOption,
  FilterOptionsResponse,
} from './types';
