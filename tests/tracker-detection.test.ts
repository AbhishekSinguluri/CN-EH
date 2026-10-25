import { describe, it, expect } from 'vitest';
import { trackerDatabase } from '../src/tracker/tracker-database';
import {
  trackerDetector,
  sanitizeRequestUrl,
} from '../src/tracker/tracker-detector';

describe('Tracker Database & Matching Engine', () => {
  it('matches exact known tracker domains', () => {
    const match = trackerDatabase.findTracker('doubleclick.net');
    expect(match).not.toBeNull();
    expect(match?.name).toBe('Google DoubleClick');
    expect(match?.category).toBe('advertising');
  });

  it('matches subdomains of known tracker domains via suffix matching', () => {
    const match = trackerDatabase.findTracker('stats.g.doubleclick.net');
    expect(match).not.toBeNull();
    expect(match?.domain).toBe('doubleclick.net');

    const analyticsMatch = trackerDatabase.findTracker('region1.google-analytics.com');
    expect(analyticsMatch).not.toBeNull();
    expect(analyticsMatch?.category).toBe('analytics');
  });

  it('returns null for unknown benign domains without false labeling', () => {
    expect(trackerDatabase.findTracker('wikipedia.org')).toBeNull();
    expect(trackerDatabase.findTracker('github.com')).toBeNull();
    expect(trackerDatabase.findTracker('my-personal-blog.io')).toBeNull();
  });

  it('correctly maps specific trackers across all 5 standard categories', () => {
    // Advertising
    expect(trackerDatabase.findTracker('adnxs.com')?.category).toBe('advertising');
    // Analytics
    expect(trackerDatabase.findTracker('hotjar.com')?.category).toBe('analytics');
    // Social media tracking
    expect(trackerDatabase.findTracker('connect.facebook.net')?.category).toBe('social');
    // Pixels & measurement
    expect(trackerDatabase.findTracker('bat.bing.com')?.category).toBe('pixels');
    // Other known third-party tracking
    expect(trackerDatabase.findTracker('branch.io')?.category).toBe('other');
  });
});

describe('URL Sanitization & Privacy Preservation', () => {
  it('strips query strings, search parameters, and hashes', () => {
    const raw = 'https://doubleclick.net/pagead/ads?client=ca-pub-1234&q=diabetes+symptoms#fragment';
    const sanitized = sanitizeRequestUrl(raw);
    expect(sanitized).toBe('https://doubleclick.net/pagead/ads');
    expect(sanitized).not.toContain('diabetes');
    expect(sanitized).not.toContain('fragment');
    expect(sanitized).not.toContain('?');
  });

  it('handles malformed URLs gracefully without throwing', () => {
    expect(sanitizeRequestUrl('not a valid url?query=123')).toBe('not a valid url');
  });
});

describe('Tracker Detector Request Inspection', () => {
  it('detects third-party tracker requests and extracts metadata', () => {
    const result = trackerDetector.inspectRequest({
      url: 'https://adservice.google.com/ads?id=99',
      initiator: 'https://www.theguardian.com',
      type: 'script',
    });

    // Note: googleadservices.com or doubleclick
    const dcResult = trackerDetector.inspectRequest({
      url: 'https://securepubads.g.doubleclick.net/gampad/ads',
      initiator: 'https://www.theguardian.com',
      type: 'xmlhttprequest',
    });

    expect(dcResult).not.toBeNull();
    expect(dcResult?.siteHostname).toBe('www.theguardian.com');
    expect(dcResult?.trackerName).toBe('Google DoubleClick');
    expect(dcResult?.isThirdParty).toBe(true);
    expect(dcResult?.category).toBe('advertising');
    expect(dcResult?.requestType).toBe('xmlhttprequest');
  });

  it('handles invalid, empty, or chrome-internal URLs safely', () => {
    expect(trackerDetector.inspectRequest({ url: '' })).toBeNull();
    expect(trackerDetector.inspectRequest({ url: 'javascript:void(0)' })).toBeNull();
    expect(trackerDetector.inspectRequest({ url: 'https://' })).toBeNull();
  });
});
