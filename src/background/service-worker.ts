import { blockingManager } from '../blocking/blocking-manager';
import { handleExtensionMessage } from '../messaging/message-handlers';
import { activityStore } from '../storage/activity-store';
import { settingsStore } from '../storage/settings-store';
import { trackerDetector } from '../tracker/tracker-detector';

console.log('[CTTS] Background Service Worker initializing...');

/**
 * Initializes settings and synchronizes declarativeNetRequest blocking rules on extension load/restart.
 */
async function initializeServiceWorker(): Promise<void> {
  try {
    const settings = await settingsStore.getSettings();
    const result = await blockingManager.syncRules(settings);
    console.log(
      `[CTTS] Blocking rules synchronized (${result.ruleCount} active rules, enabled: ${settings.blockingEnabled})`
    );
  } catch (err) {
    console.error('[CTTS] Error initializing service worker rules:', err);
  }
}

// Extension installation or update
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('[CTTS] Extension installed / updated:', details.reason);
  await initializeServiceWorker();
});

// Browser startup
chrome.runtime.onStartup.addListener(async () => {
  console.log('[CTTS] Browser startup detected');
  await initializeServiceWorker();
});

// Immediately initialize on worker wake-up
initializeServiceWorker();

// Message listener for popup & dashboard UI requests
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Return true to indicate asynchronous response
  handleExtensionMessage(message, sender)
    .then((res) => sendResponse(res))
    .catch((err) =>
      sendResponse({
        success: false,
        error: err instanceof Error ? err.message : String(err),
      })
    );
  return true;
});

/**
 * Update the extension icon badge for a tab to display the count of trackers observed on that page.
 */
async function updateTabBadge(tabId: number, siteHostname: string): Promise<void> {
  if (tabId < 0 || !siteHostname) return;
  try {
    const records = await activityStore.getFiltered({ site: siteHostname });
    const uniqueTrackers = new Set(
      records.map((r) => r.matchedDomain || r.trackerDomain)
    );
    const count = uniqueTrackers.size;

    await chrome.action.setBadgeText({
      tabId,
      text: count > 0 ? String(count) : '',
    });

    await chrome.action.setBadgeBackgroundColor({
      tabId,
      color: '#4338ca', // Deep Indigo
    });
  } catch {
    // Tab might have closed or not accessible
  }
}

// Observe web requests to detect known third-party tracker domains
if (chrome.webRequest && chrome.webRequest.onBeforeRequest) {
  chrome.webRequest.onBeforeRequest.addListener(
    (details) => {
      // Ignore extension internal pages and data URLs
      if (!details.url || details.url.startsWith('chrome-extension://') || details.url.startsWith('data:')) {
        return;
      }

      // Check request asynchronously
      (async () => {
        try {
          const settings = await settingsStore.getSettings();

          // Determine if this tracker is targeted by our active blocking rules
          let targetHost = '';
          try {
            targetHost = new URL(details.url).hostname;
          } catch {
            return;
          }

          let initiatorHost = '';
          if (details.initiator) {
            try {
              initiatorHost = new URL(details.initiator).hostname;
            } catch {
              initiatorHost = details.initiator;
            }
          }

          const isBlocked = blockingManager.isTrackerBlockedBySettings(
            targetHost,
            initiatorHost,
            settings
          );

          const record = trackerDetector.inspectRequest(
            {
              url: details.url,
              initiator: details.initiator,
              documentUrl: (details as unknown as { documentUrl?: string }).documentUrl,
              type: details.type,
              tabId: details.tabId,
            },
            isBlocked
          );

          if (record) {
            await activityStore.recordRequest(record);
            if (details.tabId && details.tabId >= 0 && record.siteHostname) {
              updateTabBadge(details.tabId, record.siteHostname);
            }
          }
        } catch (err) {
          console.warn('[CTTS] Error observing request:', err);
        }
      })();
    },
    { urls: ['<all_urls>'] }
  );
} else {
  console.warn('[CTTS] chrome.webRequest API not available in this scope.');
}
