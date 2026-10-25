import { TrackingSettings } from '../types';

export const DEFAULT_SETTINGS: TrackingSettings = {
  blockingEnabled: true,
  blockedCategories: {
    advertising: true,
    analytics: true,
    social: true,
    pixels: true,
    other: true,
  },
  allowedDomains: [],
  historyRetentionDays: 7,
  maxHistoryRecords: 1000,
};

const STORAGE_KEY = 'ctts_user_settings';

export class SettingsStore {
  private memorySettings: TrackingSettings = { ...DEFAULT_SETTINGS };

  public async getSettings(): Promise<TrackingSettings> {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      try {
        const result = await chrome.storage.local.get(STORAGE_KEY);
        if (result && result[STORAGE_KEY]) {
          this.memorySettings = { ...DEFAULT_SETTINGS, ...result[STORAGE_KEY] };
          return this.memorySettings;
        }
      } catch (e) {
        console.warn('[CTTS SettingsStore] Error reading chrome.storage, falling back to memory/local', e);
      }
    } else if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          this.memorySettings = { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
          return this.memorySettings;
        }
      } catch {}
    }

    return this.memorySettings;
  }

  public async saveSettings(newSettings: Partial<TrackingSettings>): Promise<TrackingSettings> {
    const current = await this.getSettings();
    const updated: TrackingSettings = {
      ...current,
      ...newSettings,
      blockedCategories: {
        ...current.blockedCategories,
        ...(newSettings.blockedCategories || {}),
      },
    };

    this.memorySettings = updated;

    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      try {
        await chrome.storage.local.set({ [STORAGE_KEY]: updated });
      } catch (e) {
        console.warn('[CTTS SettingsStore] Error saving to chrome.storage', e);
      }
    } else if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
    }

    return updated;
  }

  public async resetSettings(): Promise<TrackingSettings> {
    return this.saveSettings(DEFAULT_SETTINGS);
  }

  public async toggleSiteAllowlist(domain: string): Promise<TrackingSettings> {
    const clean = domain.trim().toLowerCase();
    if (!clean) return this.getSettings();

    const settings = await this.getSettings();
    const exists = settings.allowedDomains.includes(clean);
    const updatedAllowed = exists
      ? settings.allowedDomains.filter((d) => d !== clean)
      : [...settings.allowedDomains, clean];

    return this.saveSettings({ allowedDomains: updatedAllowed });
  }
}

export const settingsStore = new SettingsStore();
