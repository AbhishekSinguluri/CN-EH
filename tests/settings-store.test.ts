import { describe, it, expect, beforeEach } from 'vitest';
import { settingsStore, DEFAULT_SETTINGS } from '../src/storage/settings-store';

describe('Settings Store & Preference Persistence', () => {
  beforeEach(async () => {
    await settingsStore.resetSettings();
  });

  it('loads default settings initially', async () => {
    const settings = await settingsStore.getSettings();
    expect(settings.blockingEnabled).toBe(true);
    expect(settings.blockedCategories.advertising).toBe(true);
    expect(settings.blockedCategories.analytics).toBe(true);
    expect(settings.allowedDomains).toEqual([]);
    expect(settings.historyRetentionDays).toBe(7);
  });

  it('persists partial updates accurately', async () => {
    await settingsStore.saveSettings({
      blockingEnabled: false,
      historyRetentionDays: 14,
    });

    const updated = await settingsStore.getSettings();
    expect(updated.blockingEnabled).toBe(false);
    expect(updated.historyRetentionDays).toBe(14);
    // Other defaults remain intact
    expect(updated.blockedCategories.advertising).toBe(true);
  });

  it('toggles per-domain allowlist exceptions', async () => {
    // Add domain to allowlist
    await settingsStore.toggleSiteAllowlist('news.example.com');
    let settings = await settingsStore.getSettings();
    expect(settings.allowedDomains).toContain('news.example.com');

    // Toggle again removes it
    await settingsStore.toggleSiteAllowlist('news.example.com');
    settings = await settingsStore.getSettings();
    expect(settings.allowedDomains).not.toContain('news.example.com');
  });

  it('resets settings to default values', async () => {
    await settingsStore.saveSettings({
      blockingEnabled: false,
      allowedDomains: ['test.com'],
    });

    await settingsStore.resetSettings();
    const settings = await settingsStore.getSettings();
    expect(settings.blockingEnabled).toBe(true);
    expect(settings.allowedDomains).toEqual([]);
  });
});
