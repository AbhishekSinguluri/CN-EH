export type TrackerCategory = 
  | 'advertising'
  | 'analytics'
  | 'social'
  | 'pixels'
  | 'other';

export interface TrackerCategoryMeta {
  id: TrackerCategory;
  name: string;
  badgeLabel: string;
  description: string;
  color: string;
  bgLight: string;
  borderColor: string;
}

export interface TrackerEntry {
  domain: string;
  name: string;
  category: TrackerCategory;
  company: string;
  description: string;
  confidence: 'high' | 'medium';
  source: string;
}

export interface ObservedRequest {
  id: string;
  timestamp: number;
  siteHostname: string;
  trackerDomain: string;
  matchedDomain: string;
  trackerName: string;
  category: TrackerCategory;
  requestType: string;
  urlSanitized: string;
  blocked: boolean;
  isThirdParty: boolean;
}

export interface TrackingSettings {
  blockingEnabled: boolean;
  blockedCategories: Record<TrackerCategory, boolean>;
  allowedDomains: string[]; // Exception list: websites where blocking is disabled
  historyRetentionDays: number;
  maxHistoryRecords: number;
}

export interface TrackingStats {
  totalObservedRequests: number;
  estimatedBlockedRequests: number;
  uniqueTrackerDomainsCount: number;
  uniqueSitesCount: number;
  categoryCounts: Record<TrackerCategory, number>;
}

export interface SiteTrackerSummary {
  siteHostname: string;
  trackerDomains: string[];
  requestCount: number;
  categories: TrackerCategory[];
  lastObserved: number;
  isAllowlisted: boolean;
}

export interface TabActivityStatus {
  siteHostname: string | null;
  trackersCount: number;
  requestsCount: number;
  isProtected: boolean;
  isAllowlisted: boolean;
  recentTrackers: Array<{
    domain: string;
    name: string;
    category: TrackerCategory;
    timestamp: number;
    blocked: boolean;
  }>;
}

// Background <-> UI Messaging types
export type MessageType =
  | 'GET_TAB_STATUS'
  | 'GET_STATS'
  | 'GET_SETTINGS'
  | 'UPDATE_SETTINGS'
  | 'CLEAR_ACTIVITY'
  | 'GET_ACTIVITY'
  | 'GET_TRACKER_DATABASE'
  | 'TOGGLE_SITE_ALLOWLIST';

export interface BaseMessage<T = unknown> {
  type: MessageType;
  payload?: T;
}

export interface ResponseMessage<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
