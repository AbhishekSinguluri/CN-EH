import { ObservedRequest } from '../types';
import { normalizeHostname, trackerDatabase, TrackerDatabase } from './tracker-database';

/**
 * Common two-part top-level domains for basic eTLD+1 extraction without bloated external libraries.
 */
const COMMON_TWO_PART_TLDS = new Set([
  'co.uk', 'org.uk', 'gov.uk', 'ac.uk',
  'com.au', 'net.au', 'org.au', 'edu.au',
  'co.nz', 'org.nz', 'net.nz',
  'co.jp', 'ne.jp', 'or.jp',
  'com.br', 'org.br',
  'com.sg', 'edu.sg',
  'co.in', 'net.in', 'org.in', 'gen.in',
  'com.mx', 'org.mx',
]);

/**
 * Extracts the registrable base domain (eTLD+1) for first-party vs third-party comparison.
 * e.g. "sub.example.com" -> "example.com"
 * e.g. "news.bbc.co.uk" -> "bbc.co.uk"
 */
export function getBaseDomain(hostname: string): string {
  const clean = normalizeHostname(hostname);
  if (!clean) return '';

  const parts = clean.split('.');
  if (parts.length <= 2) {
    return clean;
  }

  const lastTwo = parts.slice(-2).join('.');
  if (COMMON_TWO_PART_TLDS.has(lastTwo)) {
    if (parts.length >= 3) {
      return parts.slice(-3).join('.');
    }
    return clean;
  }

  return parts.slice(-2).join('.');
}

/**
 * Safely sanitizes a URL to prevent capturing query strings, search terms,
 * tokens, or sensitive user inputs. Returns only the scheme + host + safe base pathname.
 */
export function sanitizeRequestUrl(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl);
    // Truncate path to first 2 segments maximum and remove any query/hash
    const pathSegments = parsed.pathname.split('/').filter(Boolean).slice(0, 2);
    const safePath = pathSegments.length > 0 ? '/' + pathSegments.join('/') : '';
    return `${parsed.protocol}//${parsed.hostname}${safePath}`;
  } catch {
    return rawUrl.split('?')[0].split('#')[0];
  }
}

/**
 * Determines whether the request is third-party relative to the initiator/origin site.
 */
export function isThirdPartyRequest(siteHostname: string, requestHostname: string): boolean {
  if (!siteHostname || !requestHostname) return true;
  const siteBase = getBaseDomain(siteHostname);
  const reqBase = getBaseDomain(requestHostname);
  return siteBase !== reqBase;
}

export interface RequestInspectionInput {
  url: string;
  initiator?: string;
  documentUrl?: string;
  type?: string;
  tabId?: number;
}

export class TrackerDetector {
  private db: TrackerDatabase;

  constructor(customDb?: TrackerDatabase) {
    this.db = customDb || trackerDatabase;
  }

  /**
   * Inspects a web request event and determines if it matches a known tracker.
   * Returns an ObservedRequest record if detected, or null if unknown / benign.
   */
  public inspectRequest(
    input: RequestInspectionInput,
    isBlocked: boolean = false
  ): ObservedRequest | null {
    if (!input.url) return null;

    let targetHost = '';
    try {
      const urlObj = new URL(input.url);
      targetHost = urlObj.hostname;
    } catch {
      return null;
    }

    // Match against tracker database
    const matched = this.db.findTracker(targetHost);
    if (!matched) {
      // Prompt requirement: "Treat unknown domains as unknown rather than automatically labeling them malicious."
      return null;
    }

    // Determine the initiating website hostname
    let siteHostname = 'direct-or-unknown';
    const rawOrigin = input.initiator || input.documentUrl;
    if (rawOrigin) {
      try {
        const originUrl = new URL(rawOrigin);
        siteHostname = originUrl.hostname;
      } catch {
        siteHostname = normalizeHostname(rawOrigin);
      }
    }

    const thirdParty = isThirdPartyRequest(siteHostname, targetHost);

    // Sanitize request URL (NEVER store sensitive query strings or credentials)
    const urlSanitized = sanitizeRequestUrl(input.url);

    return {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: Date.now(),
      siteHostname: normalizeHostname(siteHostname),
      trackerDomain: normalizeHostname(targetHost),
      matchedDomain: matched.domain,
      trackerName: matched.name,
      category: matched.category,
      requestType: input.type || 'other',
      urlSanitized,
      blocked: isBlocked,
      isThirdParty: thirdParty,
    };
  }
}

export const trackerDetector = new TrackerDetector();
