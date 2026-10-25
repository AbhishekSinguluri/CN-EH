import { describe, it, expect, beforeEach } from 'vitest';
import { activityStore } from '../src/storage/activity-store';
import { settingsStore } from '../src/storage/settings-store';
import { ObservedRequest } from '../src/types';

describe('Activity Store & Aggregation Engine', () => {
  beforeEach(async () => {
    await activityStore.clearActivity();
    await settingsStore.resetSettings();
  });

  const createSampleRequest = (
    overrides?: Partial<ObservedRequest>
  ): ObservedRequest => ({
    id: `req-${Math.random()}`,
    timestamp: Date.now(),
    siteHostname: 'example.com',
    trackerDomain: 'ad.doubleclick.net',
    matchedDomain: 'doubleclick.net',
    trackerName: 'Google DoubleClick',
    category: 'advertising',
    requestType: 'script',
    urlSanitized: 'https://ad.doubleclick.net/pagead/ads',
    blocked: true,
    isThirdParty: true,
    ...overrides,
  });

  it('records requests and computes accurate statistics', async () => {
    await activityStore.recordRequest(
      createSampleRequest({
        siteHostname: 'news.com',
        trackerDomain: 'ad.doubleclick.net',
        matchedDomain: 'doubleclick.net',
        category: 'advertising',
        blocked: true,
      })
    );

    await activityStore.recordRequest(
      createSampleRequest({
        siteHostname: 'news.com',
        trackerDomain: 'region1.google-analytics.com',
        matchedDomain: 'google-analytics.com',
        category: 'analytics',
        blocked: false,
      })
    );

    const stats = await activityStore.getStats();
    expect(stats.totalObservedRequests).toBe(2);
    expect(stats.estimatedBlockedRequests).toBe(1);
    expect(stats.uniqueSitesCount).toBe(1);
    expect(stats.uniqueTrackerDomainsCount).toBe(2);
    expect(stats.categoryCounts.advertising).toBe(1);
    expect(stats.categoryCounts.analytics).toBe(1);
  });

  it('aggregates tracker summaries and publisher reach', async () => {
    await activityStore.recordRequest(
      createSampleRequest({
        siteHostname: 'siteA.com',
        matchedDomain: 'doubleclick.net',
      })
    );
    await activityStore.recordRequest(
      createSampleRequest({
        siteHostname: 'siteB.com',
        matchedDomain: 'doubleclick.net',
      })
    );

    const summaries = await activityStore.getTrackerSummaries();
    const dcSummary = summaries.find((s) => s.trackerDomain === 'doubleclick.net');
    expect(dcSummary).toBeDefined();
    expect(dcSummary?.requestCount).toBe(2);
    expect(dcSummary?.distinctSitesCount).toBe(2);
    expect(dcSummary?.observedSites).toContain('siteA.com');
    expect(dcSummary?.observedSites).toContain('siteB.com');
  });

  it('aggregates site summaries accurately', async () => {
    await activityStore.recordRequest(
      createSampleRequest({
        siteHostname: 'store.com',
        matchedDomain: 'doubleclick.net',
      })
    );
    await activityStore.recordRequest(
      createSampleRequest({
        siteHostname: 'store.com',
        matchedDomain: 'criteo.com',
        category: 'advertising',
      })
    );

    const sites = await activityStore.getSiteSummaries();
    expect(sites.length).toBe(1);
    expect(sites[0].siteHostname).toBe('store.com');
    expect(sites[0].trackerDomains.length).toBe(2);
    expect(sites[0].requestCount).toBe(2);
  });

  it('enforces bounded history retention and caps record limits', async () => {
    await settingsStore.saveSettings({ maxHistoryRecords: 5 });

    for (let i = 0; i < 10; i++) {
      await activityStore.recordRequest(
        createSampleRequest({ id: `batch-${i}` })
      );
    }

    const all = await activityStore.getAll();
    expect(all.length).toBe(5);
  });

  it('clears all activity records when requested', async () => {
    await activityStore.recordRequest(createSampleRequest());
    let all = await activityStore.getAll();
    expect(all.length).toBe(1);

    await activityStore.clearActivity();
    all = await activityStore.getAll();
    expect(all.length).toBe(0);
  });
});
