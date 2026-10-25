import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard,
  Radio,
  BarChart3,
  Globe,
  Sliders,
  BookOpen,
  Info,
  Shield,
  RefreshCw,
} from 'lucide-react';
import { Header } from '../components/Header';
import { sendExtensionMessage } from '../messaging/message-types';
import { TrackerSummary } from '../storage/activity-store';
import { DEFAULT_SETTINGS } from '../storage/settings-store';
import {
  ObservedRequest,
  SiteTrackerSummary,
  TrackingSettings,
  TrackingStats,
} from '../types';

import { OverviewTab } from './pages/OverviewTab';
import { LiveActivityTab } from './pages/LiveActivityTab';
import { InsightsTab } from './pages/InsightsTab';
import { WebsiteDetailsTab } from './pages/WebsiteDetailsTab';
import { PrivacyControlsTab } from './pages/PrivacyControlsTab';
import { EducationTab } from './pages/EducationTab';
import { AboutTab } from './pages/AboutTab';

type NavTabId =
  | 'overview'
  | 'activity'
  | 'insights'
  | 'websites'
  | 'privacy'
  | 'education'
  | 'about';

export const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTabId>('overview');
  const [selectedSite, setSelectedSite] = useState<string | null>(null);

  const [settings, setSettings] = useState<TrackingSettings>(DEFAULT_SETTINGS);
  const [stats, setStats] = useState<TrackingStats>({
    totalObservedRequests: 0,
    estimatedBlockedRequests: 0,
    uniqueTrackerDomainsCount: 0,
    uniqueSitesCount: 0,
    categoryCounts: {
      advertising: 0,
      analytics: 0,
      social: 0,
      pixels: 0,
      other: 0,
    },
  });
  const [activity, setActivity] = useState<ObservedRequest[]>([]);
  const [trackerSummaries, setTrackerSummaries] = useState<TrackerSummary[]>([]);
  const [siteSummaries, setSiteSummaries] = useState<SiteTrackerSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Synchronize hash from URL on mount
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'settings' || hash === 'privacy') {
      setActiveTab('privacy');
    } else if (hash === 'education') {
      setActiveTab('education');
    } else if (hash === 'activity') {
      setActiveTab('activity');
    }
  }, []);

  const loadAllData = useCallback(async () => {
    setLoading(true);
    const [
      settingsRes,
      statsRes,
      activityRes,
      trackerSumRes,
      siteSumRes,
    ] = await Promise.all([
      sendExtensionMessage({ type: 'GET_SETTINGS' }),
      sendExtensionMessage({ type: 'GET_STATS' }),
      sendExtensionMessage({ type: 'GET_ACTIVITY', payload: { limit: 500 } }),
      sendExtensionMessage({ type: 'GET_TRACKER_SUMMARIES' }),
      sendExtensionMessage({ type: 'GET_SITE_SUMMARIES' }),
    ]);

    if (settingsRes.success && settingsRes.data) {
      setSettings(settingsRes.data);
    }
    if (statsRes.success && statsRes.data) {
      setStats(statsRes.data);
    }
    if (activityRes.success && activityRes.data) {
      setActivity(activityRes.data);
    }
    if (trackerSumRes.success && trackerSumRes.data) {
      setTrackerSummaries(trackerSumRes.data);
    }
    if (siteSumRes.success && siteSumRes.data) {
      setSiteSummaries(siteSumRes.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const handleUpdateSettings = async (newSettings: Partial<TrackingSettings>) => {
    const res = await sendExtensionMessage({
      type: 'UPDATE_SETTINGS',
      payload: newSettings,
    });
    if (res.success && res.data) {
      setSettings(res.data);
      // Re-fetch site summaries as allowlist may have shifted
      const siteRes = await sendExtensionMessage({ type: 'GET_SITE_SUMMARIES' });
      if (siteRes.success && siteRes.data) {
        setSiteSummaries(siteRes.data);
      }
    }
  };

  const handleClearHistory = async () => {
    const res = await sendExtensionMessage({ type: 'CLEAR_ACTIVITY' });
    if (res.success) {
      await loadAllData();
    }
  };

  const handleResetSettings = async () => {
    await handleUpdateSettings(DEFAULT_SETTINGS);
    await loadAllData();
  };

  const handleToggleAllowlist = async (siteHostname: string) => {
    const res = await sendExtensionMessage({
      type: 'TOGGLE_SITE_ALLOWLIST',
      payload: { siteHostname },
    });
    if (res.success && res.data) {
      setSettings(res.data);
      const siteRes = await sendExtensionMessage({ type: 'GET_SITE_SUMMARIES' });
      if (siteRes.success && siteRes.data) {
        setSiteSummaries(siteRes.data);
      }
    }
  };

  const handleSelectSiteAndNavigate = (site: string) => {
    setSelectedSite(site);
    setActiveTab('websites');
  };

  const navItems: Array<{ id: NavTabId; label: string; icon: React.FC<{ className?: string }> }> = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'activity', label: 'Live Activity', icon: Radio },
    { id: 'insights', label: 'Tracker Insights', icon: BarChart3 },
    { id: 'websites', label: 'Website Details', icon: Globe },
    { id: 'privacy', label: 'Privacy Controls', icon: Sliders },
    { id: 'education', label: 'Learn Tracking', icon: BookOpen },
    { id: 'about', label: 'About & Source', icon: Info },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Application Header */}
      <Header
        title="CTTS Dashboard"
        isDashboard={true}
        blockingEnabled={settings.blockingEnabled}
        onRefresh={loadAllData}
      />

      {/* Main Container */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex-1 flex flex-col md:flex-row gap-6">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-60 flex-shrink-0">
          <nav className="bg-white rounded-xl border border-slate-200/80 p-2 shadow-card space-y-1 sticky top-20">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors text-left ${
                    isActive
                      ? 'bg-navy-900 text-white shadow-sm'
                      : 'text-slate-600 hover:text-navy-950 hover:bg-slate-50'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-brand-400' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Quick stats mini-box in sidebar */}
            <div className="pt-3 mt-3 border-t border-slate-100 px-3 pb-2 text-[11px] text-slate-500">
              <div className="flex items-center justify-between py-1">
                <span>Active Trackers:</span>
                <span className="font-mono font-bold text-navy-950">
                  {stats.uniqueTrackerDomainsCount}
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span>Logged Requests:</span>
                <span className="font-mono font-bold text-brand-600">
                  {stats.totalObservedRequests}
                </span>
              </div>
            </div>
          </nav>
        </aside>

        {/* Tab Content Display Area */}
        <main className="flex-1 min-w-0">
          {activeTab === 'overview' && (
            <OverviewTab
              stats={stats}
              settings={settings}
              recentRequests={activity}
              topTrackers={trackerSummaries}
              topSites={siteSummaries}
              onNavigateTab={(tab) => setActiveTab(tab as NavTabId)}
              onSelectSite={handleSelectSiteAndNavigate}
            />
          )}

          {activeTab === 'activity' && (
            <LiveActivityTab
              requests={activity}
              onRefresh={loadAllData}
              onClearHistory={handleClearHistory}
              onSelectSite={handleSelectSiteAndNavigate}
            />
          )}

          {activeTab === 'insights' && (
            <InsightsTab
              trackerSummaries={trackerSummaries}
              siteSummaries={siteSummaries}
              onSelectSite={handleSelectSiteAndNavigate}
            />
          )}

          {activeTab === 'websites' && (
            <WebsiteDetailsTab
              siteSummaries={siteSummaries}
              selectedSite={selectedSite}
              settings={settings}
              onSelectSite={(site) => setSelectedSite(site)}
              onToggleAllowlist={handleToggleAllowlist}
            />
          )}

          {activeTab === 'privacy' && (
            <PrivacyControlsTab
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onClearHistory={handleClearHistory}
              onResetSettings={handleResetSettings}
            />
          )}

          {activeTab === 'education' && <EducationTab />}

          {activeTab === 'about' && <AboutTab />}
        </main>
      </div>
    </div>
  );
};
