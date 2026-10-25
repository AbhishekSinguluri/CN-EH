import {
  BaseMessage,
  ObservedRequest,
  ResponseMessage,
  SiteTrackerSummary,
  TabActivityStatus,
  TrackerCategory,
  TrackerEntry,
  TrackingSettings,
  TrackingStats,
} from '../types';
import { TrackerSummary } from '../storage/activity-store';

export type RequestMessage =
  | { type: 'GET_TAB_STATUS'; payload?: { tabId?: number } }
  | { type: 'GET_STATS' }
  | { type: 'GET_SETTINGS' }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<TrackingSettings> }
  | { type: 'CLEAR_ACTIVITY' }
  | {
      type: 'GET_ACTIVITY';
      payload?: {
        site?: string;
        trackerDomain?: string;
        category?: TrackerCategory;
        search?: string;
        limit?: number;
      };
    }
  | { type: 'GET_TRACKER_SUMMARIES' }
  | { type: 'GET_SITE_SUMMARIES' }
  | { type: 'GET_TRACKER_DATABASE' }
  | { type: 'TOGGLE_SITE_ALLOWLIST'; payload: { siteHostname: string } };

export interface MessageResponseMap {
  GET_TAB_STATUS: TabActivityStatus;
  GET_STATS: TrackingStats;
  GET_SETTINGS: TrackingSettings;
  UPDATE_SETTINGS: TrackingSettings;
  CLEAR_ACTIVITY: { cleared: boolean };
  GET_ACTIVITY: ObservedRequest[];
  GET_TRACKER_SUMMARIES: TrackerSummary[];
  GET_SITE_SUMMARIES: SiteTrackerSummary[];
  GET_TRACKER_DATABASE: { trackers: TrackerEntry[]; count: number; attribution: unknown };
  TOGGLE_SITE_ALLOWLIST: TrackingSettings;
}

/**
 * Type-safe helper to send messages to the background service worker.
 */
export async function sendExtensionMessage<K extends RequestMessage['type']>(
  message: Extract<RequestMessage, { type: K }>
): Promise<ResponseMessage<MessageResponseMap[K]>> {
  if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.sendMessage) {
    return {
      success: false,
      error: 'Chrome extension runtime messaging not available',
    };
  }

  try {
    const response = await chrome.runtime.sendMessage(message);
    return response as ResponseMessage<MessageResponseMap[K]>;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      error: msg,
    };
  }
}
