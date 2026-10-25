import trackerList from '../data/trackers.json';
import { TrackerCategory, TrackerEntry } from '../types';

/**
 * Normalizes hostnames by stripping trailing dots, lowercasing, and removing port numbers.
 */
export function normalizeHostname(host: string): string {
  if (!host) return '';
  return host
    .toLowerCase()
    .trim()
    .replace(/:\d+$/, '') // strip port
    .replace(/\.$/, ''); // strip trailing dot
}

export class TrackerDatabase {
  private trackers: TrackerEntry[];
  private domainMap: Map<string, TrackerEntry> = new Map();
  // Sorted list of tracker domains by descending length for longest-suffix matching
  private sortedDomains: string[] = [];

  constructor(customList?: TrackerEntry[]) {
    this.trackers = customList || (trackerList as TrackerEntry[]);
    this.initDatabase();
  }

  private initDatabase(): void {
    this.domainMap.clear();
    for (const tracker of this.trackers) {
      const cleanDomain = normalizeHostname(tracker.domain);
      this.domainMap.set(cleanDomain, { ...tracker, domain: cleanDomain });
    }

    // Sort domains descending by length so more specific matches (e.g. connect.facebook.net)
    // take precedence over broader ones (e.g. facebook.com)
    this.sortedDomains = Array.from(this.domainMap.keys()).sort(
      (a, b) => b.length - a.length
    );
  }

  /**
   * Matches a request hostname against known tracker entries.
   * Supports exact match and subdomain/suffix matches.
   * e.g., 'ad.doubleclick.net' -> matches 'doubleclick.net'
   */
  public findTracker(hostname: string): TrackerEntry | null {
    if (!hostname) return null;
    const cleanHost = normalizeHostname(hostname);

    // 1. Direct exact lookup
    const direct = this.domainMap.get(cleanHost);
    if (direct) {
      return direct;
    }

    // 2. Subdomain / suffix lookup (longest match wins)
    for (const domain of this.sortedDomains) {
      if (cleanHost.endsWith('.' + domain)) {
        return this.domainMap.get(domain) || null;
      }
    }

    return null;
  }

  public getAll(): TrackerEntry[] {
    return this.trackers;
  }

  public getByCategory(category: TrackerCategory): TrackerEntry[] {
    return this.trackers.filter((t) => t.category === category);
  }

  public getCount(): number {
    return this.trackers.length;
  }

  public getSourceAttribution(): {
    sources: string[];
    description: string;
    updateInstructions: string;
  } {
    return {
      sources: [
        'DuckDuckGo Tracker Radar (open-source behavioral tracker dataset)',
        'EasyPrivacy (community-curated privacy and tracking rule lists)',
        'Disconnect.me open-source tracking protection list',
      ],
      description:
        'Starter database featuring curated, high-confidence tracking domains across advertising, analytics, social widgets, and conversion pixels. Each entry includes ownership and purpose attribution.',
      updateInstructions:
        'New tracker definitions can be added to `src/data/trackers.json` or supplemented via local extension configurations without requiring external cloud dependencies.',
    };
  }
}

// Global default singleton instance
export const trackerDatabase = new TrackerDatabase();
