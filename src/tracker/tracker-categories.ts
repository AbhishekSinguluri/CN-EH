import { TrackerCategory, TrackerCategoryMeta } from '../types';

export const TRACKER_CATEGORIES: Record<TrackerCategory, TrackerCategoryMeta> = {
  advertising: {
    id: 'advertising',
    name: 'Advertising & Marketing',
    badgeLabel: 'Ad Network',
    description: 'Networks and demand-side platforms delivering targeted or behavioral advertisements across publisher websites.',
    color: '#4f46e5', // Indigo
    bgLight: '#eef2ff',
    borderColor: '#c7d2fe',
  },
  analytics: {
    id: 'analytics',
    name: 'Site Analytics & Telemetry',
    badgeLabel: 'Analytics',
    description: 'Services monitoring user pageviews, scroll depth, click funnels, and performance metrics across browsing sessions.',
    color: '#0284c7', // Sky
    bgLight: '#f0f9ff',
    borderColor: '#bae6fd',
  },
  social: {
    id: 'social',
    name: 'Social Media Tracking',
    badgeLabel: 'Social Tracker',
    description: 'Embedded widgets, login SDKs, and social tracking pixels linking browsing behavior with social identity accounts.',
    color: '#9333ea', // Purple
    bgLight: '#faf5ff',
    borderColor: '#e9d5ff',
  },
  pixels: {
    id: 'pixels',
    name: 'Tracking Pixels & Measurement',
    badgeLabel: 'Beacon / Pixel',
    description: 'Invisible single-pixel images, sync beacons, and audience measurement tags used for conversion attribution and cookie syncing.',
    color: '#d97706', // Amber
    bgLight: '#fffbeb',
    borderColor: '#fde68a',
  },
  other: {
    id: 'other',
    name: 'Other Known Third-Party Tracking',
    badgeLabel: 'Third-Party',
    description: 'Attribution SDKs, device fingerprinting endpoints, and unclassified cross-site telemetry services.',
    color: '#64748b', // Slate
    bgLight: '#f8fafc',
    borderColor: '#e2e8f0',
  },
};

export function getCategoryMeta(category: TrackerCategory): TrackerCategoryMeta {
  return TRACKER_CATEGORIES[category] || TRACKER_CATEGORIES.other;
}
