import { blockingManager } from '../blocking/blocking-manager';
import { activityStore } from '../storage/activity-store';
import { settingsStore } from '../storage/settings-store';
import { trackerDatabase } from '../tracker/tracker-database';
import { ResponseMessage, TabActivityStatus } from '../types';
import { RequestMessage } from './message-types';

export async function handleExtensionMessage(
  message: RequestMessage,
  sender: chrome.runtime.MessageSender
): Promise<ResponseMessage<unknown>> {
  try {
    switch (message.type) {
      case 'GET_SETTINGS': {
        const settings = await settingsStore.getSettings();
        return { success: true, data: settings };
      }

      case 'UPDATE_SETTINGS': {
        const updated = await settingsStore.saveSettings(message.payload);
        // Synchronize declarativeNetRequest dynamic blocking rules
        await blockingManager.syncRules(updated);
        return { success: true, data: updated };
      }

      case 'GET_STATS': {
        const stats = await activityStore.getStats();
        return { success: true, data: stats };
      }

      case 'GET_ACTIVITY': {
        const records = await activityStore.getFiltered(message.payload);
        return { success: true, data: records };
      }

      case 'CLEAR_ACTIVITY': {
        await activityStore.clearActivity();
        return { success: true, data: { cleared: true } };
      }

      case 'GET_TRACKER_SUMMARIES': {
        const summaries = await activityStore.getTrackerSummaries();
        return { success: true, data: summaries };
      }

      case 'GET_SITE_SUMMARIES': {
        const summaries = await activityStore.getSiteSummaries();
        return { success: true, data: summaries };
      }

      case 'GET_TRACKER_DATABASE': {
        return {
          success: true,
          data: {
            trackers: trackerDatabase.getAll(),
            count: trackerDatabase.getCount(),
            attribution: trackerDatabase.getSourceAttribution(),
          },
        };
      }

      case 'TOGGLE_SITE_ALLOWLIST': {
        const updated = await settingsStore.toggleSiteAllowlist(
          message.payload.siteHostname
        );
        await blockingManager.syncRules(updated);
        return { success: true, data: updated };
      }

      case 'GET_TAB_STATUS': {
        const tabId = message.payload?.tabId ?? sender.tab?.id;
        const status = await getTabActivityStatus(tabId);
        return { success: true, data: status };
      }

      default:
        return {
          success: false,
          error: `Unknown message type: ${(message as { type: string }).type}`,
        };
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[CTTS MessageHandler] Error processing message:', err);
    return { success: false, error: msg };
  }
}

async function getTabActivityStatus(tabId?: number): Promise<TabActivityStatus> {
  const settings = await settingsStore.getSettings();
  let siteHostname: string | null = null;

  if (typeof chrome !== 'undefined' && chrome.tabs) {
    try {
      let targetTab: chrome.tabs.Tab | undefined;
      if (tabId !== undefined) {
        targetTab = await chrome.tabs.get(tabId);
      } else {
        const [active] = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });
        targetTab = active;
      }

      if (targetTab?.url) {
        const parsed = new URL(targetTab.url);
        if (parsed.protocol.startsWith('http')) {
          siteHostname = parsed.hostname;
        }
      }
    } catch {}
  }

  if (!siteHostname) {
    return {
      siteHostname: null,
      trackersCount: 0,
      requestsCount: 0,
      isProtected: settings.blockingEnabled,
      isAllowlisted: false,
      recentTrackers: [],
    };
  }

  const siteRecords = await activityStore.getFiltered({ site: siteHostname });
  const trackerMap = new Map<
    string,
    {
      domain: string;
      name: string;
      category: TabActivityStatus['recentTrackers'][0]['category'];
      timestamp: number;
      blocked: boolean;
    }
  >();

  for (const r of siteRecords) {
    const key = r.matchedDomain || r.trackerDomain;
    if (!trackerMap.has(key)) {
      trackerMap.set(key, {
        domain: key,
        name: r.trackerName,
        category: r.category,
        timestamp: r.timestamp,
        blocked: r.blocked,
      });
    }
  }

  const isAllowlisted = settings.allowedDomains.includes(
    siteHostname.toLowerCase()
  );

  return {
    siteHostname,
    trackersCount: trackerMap.size,
    requestsCount: siteRecords.length,
    isProtected: settings.blockingEnabled && !isAllowlisted,
    isAllowlisted,
    recentTrackers: Array.from(trackerMap.values()).slice(0, 10),
  };
}
