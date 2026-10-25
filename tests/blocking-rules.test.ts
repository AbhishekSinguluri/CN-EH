import { describe, it, expect, beforeEach } from 'vitest';
import { generateBlockingRules } from '../src/blocking/blocking-rules';
import { blockingManager } from '../src/blocking/blocking-manager';
import { TrackerEntry, TrackingSettings } from '../src/types';
import { DEFAULT_SETTINGS } from '../src/storage/settings-store';

describe('DeclarativeNetRequest Dynamic Rule Generation', () => {
  const sampleTrackers: TrackerEntry[] = [
    {
      domain: 'doubleclick.net',
      name: 'Google DoubleClick',
      category: 'advertising',
      company: 'Google',
      description: 'Ad network',
      confidence: 'high',
      source: 'EasyList',
    },
    {
      domain: 'google-analytics.com',
      name: 'Google Analytics',
      category: 'analytics',
      company: 'Google',
      description: 'Analytics',
      confidence: 'high',
      source: 'Disconnect',
    },
  ];

  it('generates dynamic rules for enabled tracker categories', () => {
    const rules = generateBlockingRules(sampleTrackers, DEFAULT_SETTINGS);
    expect(rules.length).toBe(2);

    expect(rules[0].condition.urlFilter).toBe('||doubleclick.net^');
    expect(rules[0].action.type).toBe('block');
    expect(rules[0].condition.domainType).toBe('thirdParty');
  });

  it('returns empty rule set when global blocking is disabled', () => {
    const settings: TrackingSettings = {
      ...DEFAULT_SETTINGS,
      blockingEnabled: false,
    };
    const rules = generateBlockingRules(sampleTrackers, settings);
    expect(rules).toEqual([]);
  });

  it('respects category preferences by filtering disabled categories', () => {
    const settings: TrackingSettings = {
      ...DEFAULT_SETTINGS,
      blockedCategories: {
        ...DEFAULT_SETTINGS.blockedCategories,
        analytics: false, // Turn off analytics blocking
      },
    };

    const rules = generateBlockingRules(sampleTrackers, settings);
    expect(rules.length).toBe(1);
    expect(rules[0].condition.urlFilter).toBe('||doubleclick.net^');
  });

  it('injects excludedInitiatorDomains when per-domain exceptions are configured', () => {
    const settings: TrackingSettings = {
      ...DEFAULT_SETTINGS,
      allowedDomains: ['trusted-partner.com', 'news-site.org'],
    };

    const rules = generateBlockingRules(sampleTrackers, settings);
    expect(rules.length).toBe(2);
    expect(rules[0].condition.excludedInitiatorDomains).toEqual([
      'trusted-partner.com',
      'news-site.org',
    ]);
  });
});

describe('Blocking Manager Integration & Setting Checks', () => {
  it('correctly evaluates isTrackerBlockedBySettings', () => {
    const settings: TrackingSettings = {
      ...DEFAULT_SETTINGS,
      allowedDomains: ['excepted-site.com'],
    };

    // On standard site: doubleclick is blocked
    expect(
      blockingManager.isTrackerBlockedBySettings(
        'doubleclick.net',
        'random-site.com',
        settings
      )
    ).toBe(true);

    // On allowlisted exception site: doubleclick is NOT blocked
    expect(
      blockingManager.isTrackerBlockedBySettings(
        'doubleclick.net',
        'excepted-site.com',
        settings
      )
    ).toBe(false);

    // When global blocking is disabled: nothing is blocked
    expect(
      blockingManager.isTrackerBlockedBySettings('doubleclick.net', 'random-site.com', {
        ...settings,
        blockingEnabled: false,
      })
    ).toBe(false);
  });

  it('synchronizes dynamic rules with Chrome declarativeNetRequest mock', async () => {
    const res = await blockingManager.syncRules(DEFAULT_SETTINGS);
    expect(res.success).toBe(true);
    expect(res.ruleCount).toBeGreaterThan(10);
  });
});
