import { trackerDatabase } from '../tracker/tracker-database';
import { TrackingSettings } from '../types';
import { DynamicRule, generateBlockingRules } from './blocking-rules';

export class BlockingManager {
  private lastAppliedRuleCount: number = 0;
  private lastError: string | null = null;

  /**
   * Synchronizes browser declarativeNetRequest dynamic rules with current user settings.
   */
  public async syncRules(settings: TrackingSettings): Promise<{
    success: boolean;
    ruleCount: number;
    error?: string;
  }> {
    if (typeof chrome === 'undefined' || !chrome.declarativeNetRequest) {
      this.lastError = 'declarativeNetRequest API not available in this environment';
      return { success: false, ruleCount: 0, error: this.lastError };
    }

    try {
      // 1. Get existing installed dynamic rules
      const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
      const existingRuleIds = existingRules.map((r) => r.id);

      // 2. Generate new rules based on settings
      const trackers = trackerDatabase.getAll();
      const newRules = generateBlockingRules(trackers, settings);

      // 3. Check browser dynamic rule limits
      const maxRules =
        (chrome.declarativeNetRequest as unknown as { MAX_NUMBER_OF_DYNAMIC_RULES?: number })
          .MAX_NUMBER_OF_DYNAMIC_RULES || 5000;
      if (newRules.length > maxRules) {
        throw new Error(
          `Requested dynamic rules (${newRules.length}) exceed Chrome maximum (${maxRules}).`
        );
      }

      // 4. Update dynamic rules in Chrome
      // Cast to any to satisfy chrome types if exact Rule enum differs
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: existingRuleIds,
        addRules: newRules as unknown as chrome.declarativeNetRequest.Rule[],
      });

      this.lastAppliedRuleCount = newRules.length;
      this.lastError = null;

      return {
        success: true,
        ruleCount: newRules.length,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.lastError = msg;
      console.error('[CTTS BlockingManager] Error updating dynamic rules:', msg);
      return {
        success: false,
        ruleCount: 0,
        error: msg,
      };
    }
  }

  public getRuleCount(): number {
    return this.lastAppliedRuleCount;
  }

  public getLastError(): string | null {
    return this.lastError;
  }

  /**
   * Evaluates whether a given tracker request should be blocked based on settings.
   */
  public isTrackerBlockedBySettings(
    trackerDomain: string,
    initiatorSite: string,
    settings: TrackingSettings
  ): boolean {
    if (!settings.blockingEnabled) return false;

    // Check allowlisted initiator exceptions
    const isExcluded = settings.allowedDomains.some(
      (d) => d.toLowerCase() === initiatorSite.toLowerCase()
    );
    if (isExcluded) return false;

    const entry = trackerDatabase.findTracker(trackerDomain);
    if (!entry) return false;

    return Boolean(settings.blockedCategories[entry.category]);
  }
}

export const blockingManager = new BlockingManager();
