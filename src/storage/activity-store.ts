import {
  ObservedRequest,
  SiteTrackerSummary,
  TrackerCategory,
  TrackingStats,
} from '../types';
import { settingsStore } from './settings-store';

const ACTIVITY_STORAGE_KEY = 'ctts_activity_records';

export interface TrackerSummary {
  trackerDomain: string;
  name: string;
  category: TrackerCategory;
  requestCount: number;
  blockedCount: number;
  distinctSitesCount: number;
  observedSites: string[];
  lastObserved: number;
}

export class ActivityStore {
  private memoryRecords: ObservedRequest[] = [];
  private isLoaded: boolean = false;

  public async loadRecords(): Promise<ObservedRequest[]> {
    if (this.isLoaded && this.memoryRecords.length > 0) {
      return this.memoryRecords;
    }

    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      try {
        const result = await chrome.storage.local.get(ACTIVITY_STORAGE_KEY);
        if (result && Array.isArray(result[ACTIVITY_STORAGE_KEY])) {
          this.memoryRecords = result[ACTIVITY_STORAGE_KEY];
          this.isLoaded = true;
          return this.memoryRecords;
        }
      } catch (e) {
        console.warn('[CTTS ActivityStore] Error reading storage', e);
      }
    } else if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const raw = window.localStorage.getItem(ACTIVITY_STORAGE_KEY);
        if (raw) {
          this.memoryRecords = JSON.parse(raw);
          this.isLoaded = true;
          return this.memoryRecords;
        }
      } catch {}
    }

    this.memoryRecords = [];
    this.isLoaded = true;
    return this.memoryRecords;
  }

  private async persist(): Promise<void> {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      try {
        await chrome.storage.local.set({
          [ACTIVITY_STORAGE_KEY]: this.memoryRecords,
        });
      } catch (e) {
        console.warn('[CTTS ActivityStore] Error persisting records', e);
      }
    } else if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(
          ACTIVITY_STORAGE_KEY,
          JSON.stringify(this.memoryRecords)
        );
      } catch {}
    }
  }

  public async recordRequest(req: ObservedRequest): Promise<void> {
    await this.loadRecords();
    const settings = await settingsStore.getSettings();

    // Prepend newer record
    this.memoryRecords.unshift(req);

    // Apply bounded retention: Max records & max age in days
    const now = Date.now();
    const maxAgeMs = (settings.historyRetentionDays || 7) * 24 * 60 * 60 * 1000;
    const maxRecords = settings.maxHistoryRecords || 1000;

    // Filter by timestamp and slice by max records
    this.memoryRecords = this.memoryRecords
      .filter((r) => now - r.timestamp < maxAgeMs)
      .slice(0, maxRecords);

    await this.persist();
  }

  public async recordBatch(batch: ObservedRequest[]): Promise<void> {
    if (batch.length === 0) return;
    await this.loadRecords();
    const settings = await settingsStore.getSettings();

    this.memoryRecords.unshift(...batch);

    const now = Date.now();
    const maxAgeMs = (settings.historyRetentionDays || 7) * 24 * 60 * 60 * 1000;
    const maxRecords = settings.maxHistoryRecords || 1000;

    this.memoryRecords = this.memoryRecords
      .filter((r) => now - r.timestamp < maxAgeMs)
      .slice(0, maxRecords);

    await this.persist();
  }

  public async clearActivity(): Promise<void> {
    this.memoryRecords = [];
    await this.persist();
  }

  public async getAll(): Promise<ObservedRequest[]> {
    await this.loadRecords();
    return [...this.memoryRecords];
  }

  public async getFiltered(filter?: {
    site?: string;
    trackerDomain?: string;
    category?: TrackerCategory;
    search?: string;
    limit?: number;
  }): Promise<ObservedRequest[]> {
    await this.loadRecords();
    let records = this.memoryRecords;

    if (filter) {
      if (filter.site) {
        const s = filter.site.toLowerCase();
        records = records.filter((r) => r.siteHostname.toLowerCase() === s);
      }
      if (filter.trackerDomain) {
        const td = filter.trackerDomain.toLowerCase();
        records = records.filter((r) => r.trackerDomain.toLowerCase() === td || r.matchedDomain.toLowerCase() === td);
      }
      if (filter.category) {
        records = records.filter((r) => r.category === filter.category);
      }
      if (filter.search) {
        const query = filter.search.toLowerCase().trim();
        records = records.filter(
          (r) =>
            r.trackerDomain.toLowerCase().includes(query) ||
            r.trackerName.toLowerCase().includes(query) ||
            r.siteHostname.toLowerCase().includes(query)
        );
      }
      if (filter.limit && filter.limit > 0) {
        records = records.slice(0, filter.limit);
      }
    }

    return records;
  }

  public async getStats(): Promise<TrackingStats> {
    await this.loadRecords();
    const uniqueTrackers = new Set<string>();
    const uniqueSites = new Set<string>();
    let blockedCount = 0;

    const categoryCounts: Record<TrackerCategory, number> = {
      advertising: 0,
      analytics: 0,
      social: 0,
      pixels: 0,
      other: 0,
    };

    for (const r of this.memoryRecords) {
      uniqueTrackers.add(r.matchedDomain || r.trackerDomain);
      if (r.siteHostname && r.siteHostname !== 'direct-or-unknown') {
        uniqueSites.add(r.siteHostname);
      }
      if (r.blocked) {
        blockedCount++;
      }
      if (categoryCounts[r.category] !== undefined) {
        categoryCounts[r.category]++;
      } else {
        categoryCounts.other++;
      }
    }

    return {
      totalObservedRequests: this.memoryRecords.length,
      estimatedBlockedRequests: blockedCount,
      uniqueTrackerDomainsCount: uniqueTrackers.size,
      uniqueSitesCount: uniqueSites.size,
      categoryCounts,
    };
  }

  public async getTrackerSummaries(): Promise<TrackerSummary[]> {
    await this.loadRecords();
    const map = new Map<string, TrackerSummary>();

    for (const r of this.memoryRecords) {
      const key = r.matchedDomain || r.trackerDomain;
      let summary = map.get(key);
      if (!summary) {
        summary = {
          trackerDomain: key,
          name: r.trackerName,
          category: r.category,
          requestCount: 0,
          blockedCount: 0,
          distinctSitesCount: 0,
          observedSites: [],
          lastObserved: r.timestamp,
        };
        map.set(key, summary);
      }

      summary.requestCount++;
      if (r.blocked) summary.blockedCount++;
      if (r.timestamp > summary.lastObserved) summary.lastObserved = r.timestamp;

      if (
        r.siteHostname &&
        r.siteHostname !== 'direct-or-unknown' &&
        !summary.observedSites.includes(r.siteHostname)
      ) {
        summary.observedSites.push(r.siteHostname);
      }
    }

    const result = Array.from(map.values());
    for (const item of result) {
      item.distinctSitesCount = item.observedSites.length;
    }

    return result.sort((a, b) => b.requestCount - a.requestCount);
  }

  public async getSiteSummaries(): Promise<SiteTrackerSummary[]> {
    await this.loadRecords();
    const settings = await settingsStore.getSettings();
    const map = new Map<string, SiteTrackerSummary>();

    for (const r of this.memoryRecords) {
      const site = r.siteHostname;
      if (!site || site === 'direct-or-unknown') continue;

      let summary = map.get(site);
      if (!summary) {
        summary = {
          siteHostname: site,
          trackerDomains: [],
          requestCount: 0,
          categories: [],
          lastObserved: r.timestamp,
          isAllowlisted: settings.allowedDomains.includes(site),
        };
        map.set(site, summary);
      }

      summary.requestCount++;
      if (r.timestamp > summary.lastObserved) summary.lastObserved = r.timestamp;

      const domain = r.matchedDomain || r.trackerDomain;
      if (!summary.trackerDomains.includes(domain)) {
        summary.trackerDomains.push(domain);
      }
      if (!summary.categories.includes(r.category)) {
        summary.categories.push(r.category);
      }
    }

    return Array.from(map.values()).sort((a, b) => b.requestCount - a.requestCount);
  }
}

export const activityStore = new ActivityStore();
