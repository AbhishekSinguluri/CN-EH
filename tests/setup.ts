import { vi } from 'vitest';

// In-memory mock storage
const mockStorageData: Record<string, unknown> = {};

// In-memory mock dynamic rules
let mockDynamicRules: any[] = [];

// Setup global Chrome API mock for tests
(global as any).chrome = {
  storage: {
    local: {
      get: vi.fn(async (keys?: string | string[] | Record<string, unknown> | null) => {
        if (!keys) return { ...mockStorageData };
        if (typeof keys === 'string') {
          return { [keys]: mockStorageData[keys] };
        }
        if (Array.isArray(keys)) {
          const res: Record<string, unknown> = {};
          keys.forEach((k) => {
            res[k] = mockStorageData[k];
          });
          return res;
        }
        return { ...keys, ...mockStorageData };
      }),
      set: vi.fn(async (items: Record<string, unknown>) => {
        Object.assign(mockStorageData, items);
      }),
      clear: vi.fn(async () => {
        for (const k of Object.keys(mockStorageData)) {
          delete mockStorageData[k];
        }
      }),
    },
  },
  declarativeNetRequest: {
    MAX_NUMBER_OF_DYNAMIC_RULES: 5000,
    getDynamicRules: vi.fn(async () => [...mockDynamicRules]),
    updateDynamicRules: vi.fn(async (options: { removeRuleIds?: number[]; addRules?: any[] }) => {
      if (options.removeRuleIds) {
        mockDynamicRules = mockDynamicRules.filter(
          (r) => !options.removeRuleIds?.includes(r.id)
        );
      }
      if (options.addRules) {
        mockDynamicRules.push(...options.addRules);
      }
    }),
  },
  runtime: {
    sendMessage: vi.fn(),
    onMessage: {
      addListener: vi.fn(),
    },
    onInstalled: {
      addListener: vi.fn(),
    },
    onStartup: {
      addListener: vi.fn(),
    },
    getURL: vi.fn((path: string) => `chrome-extension://mock-id/${path}`),
  },
  tabs: {
    query: vi.fn(async () => [{ id: 1, url: 'https://example.com' }]),
    get: vi.fn(async (tabId: number) => ({ id: tabId, url: 'https://example.com' })),
    create: vi.fn(async () => ({ id: 2 })),
  },
  action: {
    setBadgeText: vi.fn(async () => {}),
    setBadgeBackgroundColor: vi.fn(async () => {}),
  },
  webRequest: {
    onBeforeRequest: {
      addListener: vi.fn(),
    },
  },
};
