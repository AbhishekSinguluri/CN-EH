import { TrackerEntry, TrackingSettings } from '../types';

export interface DynamicRuleCondition {
  urlFilter: string;
  resourceTypes?: string[];
  excludedInitiatorDomains?: string[];
  domainType?: 'firstParty' | 'thirdParty';
}

export interface DynamicRule {
  id: number;
  priority: number;
  action: {
    type: 'block' | 'allow';
  };
  condition: DynamicRuleCondition;
}

const ALL_RESOURCE_TYPES = [
  'main_frame',
  'sub_frame',
  'stylesheet',
  'script',
  'image',
  'font',
  'object',
  'xmlhttprequest',
  'ping',
  'csp_report',
  'media',
  'websocket',
  'other',
];

/**
 * Builds declarativeNetRequest dynamic rules matching enabled tracker categories
 * and respecting per-domain allowlist exceptions.
 */
export function generateBlockingRules(
  trackers: TrackerEntry[],
  settings: TrackingSettings
): DynamicRule[] {
  if (!settings.blockingEnabled) {
    return [];
  }

  const rules: DynamicRule[] = [];
  const cleanExceptions = (settings.allowedDomains || [])
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean);

  let ruleId = 1;

  for (const tracker of trackers) {
    // Only generate rule if category blocking is toggled ON
    if (!settings.blockedCategories[tracker.category]) {
      continue;
    }

    const cleanDomain = tracker.domain.trim().toLowerCase();
    if (!cleanDomain) continue;

    const condition: DynamicRuleCondition = {
      // Chrome urlFilter format '||domain.com^' matches hostname and all subdomains
      urlFilter: `||${cleanDomain}^`,
      resourceTypes: ALL_RESOURCE_TYPES,
      // Block as third-party to avoid breaking first-party visits when user purposefully browses the site
      domainType: 'thirdParty',
    };

    if (cleanExceptions.length > 0) {
      condition.excludedInitiatorDomains = cleanExceptions;
    }

    rules.push({
      id: ruleId++,
      priority: 1,
      action: {
        type: 'block',
      },
      condition,
    });
  }

  return rules;
}
