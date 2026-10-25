import React, { useEffect, useState } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Globe,
  ExternalLink,
  Settings,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { TrackerBadge } from '../components/TrackerBadge';
import { sendExtensionMessage } from '../messaging/message-types';
import { TabActivityStatus, TrackingSettings } from '../types';

export const Popup: React.FC = () => {
  const [tabStatus, setTabStatus] = useState<TabActivityStatus | null>(null);
  const [settings, setSettings] = useState<TrackingSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const [statusRes, settingsRes] = await Promise.all([
      sendExtensionMessage({ type: 'GET_TAB_STATUS' }),
      sendExtensionMessage({ type: 'GET_SETTINGS' }),
    ]);

    if (statusRes.success && statusRes.data) {
      setTabStatus(statusRes.data);
    }
    if (settingsRes.success && settingsRes.data) {
      setSettings(settingsRes.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleGlobalBlocking = async () => {
    if (!settings || toggling) return;
    setToggling(true);
    const updated = !settings.blockingEnabled;
    const res = await sendExtensionMessage({
      type: 'UPDATE_SETTINGS',
      payload: { blockingEnabled: updated },
    });
    if (res.success && res.data) {
      setSettings(res.data);
    }
    // Refresh tab status to reflect new protection status
    const statusRes = await sendExtensionMessage({ type: 'GET_TAB_STATUS' });
    if (statusRes.success && statusRes.data) {
      setTabStatus(statusRes.data);
    }
    setToggling(false);
  };

  const handleToggleSiteAllowlist = async () => {
    if (!tabStatus?.siteHostname || toggling) return;
    setToggling(true);
    const res = await sendExtensionMessage({
      type: 'TOGGLE_SITE_ALLOWLIST',
      payload: { siteHostname: tabStatus.siteHostname },
    });
    if (res.success && res.data) {
      setSettings(res.data);
      const statusRes = await sendExtensionMessage({ type: 'GET_TAB_STATUS' });
      if (statusRes.success && statusRes.data) {
        setTabStatus(statusRes.data);
      }
    }
    setToggling(false);
  };

  const handleOpenDashboard = (tabHash: string = '') => {
    const url = chrome?.runtime?.getURL
      ? chrome.runtime.getURL(`dashboard.html${tabHash}`)
      : 'dashboard.html';
    if (chrome?.tabs?.create) {
      chrome.tabs.create({ url });
    } else {
      window.open(url, '_blank');
    }
  };

  const isProtected =
    settings?.blockingEnabled && (!tabStatus || !tabStatus.isAllowlisted);

  return (
    <div className="w-[390px] bg-slate-50 text-navy-900 flex flex-col min-h-[520px]">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-navy-900 flex items-center justify-center text-white shadow-sm">
            <Shield className="w-4 h-4 text-brand-500" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-tight text-navy-950">
                CTTS
              </span>
              <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-brand-50 text-brand-700 border border-brand-200">
                MV3
              </span>
            </div>
            <p className="text-[10px] text-slate-500">Tracking Transparency</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={loadData}
            className="p-1 text-slate-400 hover:text-navy-900 rounded transition-colors"
            title="Refresh current tab analysis"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => handleOpenDashboard('#settings')}
            className="p-1 text-slate-400 hover:text-navy-900 rounded transition-colors"
            title="Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="p-4 flex-1 flex flex-col gap-3">
        {/* Status & Global Toggle Card */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div
                className={`p-1.5 rounded-lg border ${
                  isProtected
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                    : 'bg-amber-50 text-amber-600 border-amber-200'
                }`}
              >
                {isProtected ? (
                  <ShieldCheck className="w-4 h-4" />
                ) : (
                  <ShieldAlert className="w-4 h-4" />
                )}
              </div>
              <div>
                <span className="text-xs font-bold text-navy-950 block">
                  {isProtected ? 'Active Protection' : 'Protection Disabled'}
                </span>
                <span className="text-[11px] text-slate-500">
                  {tabStatus?.isAllowlisted
                    ? 'Paused for this website exception'
                    : settings?.blockingEnabled
                    ? 'Blocking supported known trackers'
                    : 'Global blocking turned OFF'}
                </span>
              </div>
            </div>

            {/* Toggle Switch */}
            <button
              onClick={handleToggleGlobalBlocking}
              disabled={toggling}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${
                settings?.blockingEnabled ? 'bg-brand-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings?.blockingEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Current Site Details */}
          <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5 min-w-0">
              <Globe className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="text-xs font-mono font-medium text-navy-900 truncate">
                {tabStatus?.siteHostname || 'Internal / Direct Page'}
              </span>
            </div>

            {tabStatus?.siteHostname && (
              <button
                onClick={handleToggleSiteAllowlist}
                className={`text-[10px] font-semibold px-2 py-0.5 rounded border transition-colors ${
                  tabStatus.isAllowlisted
                    ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                    : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                }`}
              >
                {tabStatus.isAllowlisted ? 'Allowlisted (Resume)' : 'Allowlist Site'}
              </button>
            )}
          </div>
        </div>

        {/* Current Site Metrics Counter */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-white rounded-xl border border-slate-200/90 p-3 shadow-card">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">
              Site Trackers
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-bold font-mono text-navy-950">
                {tabStatus?.trackersCount ?? 0}
              </span>
              <span className="text-[11px] text-slate-500">domains</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/90 p-3 shadow-card">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">
              Observed Requests
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-bold font-mono text-brand-600">
                {tabStatus?.requestsCount ?? 0}
              </span>
              <span className="text-[11px] text-slate-500">calls</span>
            </div>
          </div>
        </div>

        {/* Recent Trackers on this site */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-card p-3 flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-navy-950">
              Trackers Observed on this Page
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {tabStatus?.recentTrackers?.length ?? 0} found
            </span>
          </div>

          {tabStatus?.recentTrackers && tabStatus.recentTrackers.length > 0 ? (
            <div className="space-y-1.5 overflow-y-auto max-h-[140px] pr-1">
              {tabStatus.recentTrackers.map((t) => (
                <div
                  key={t.domain}
                  className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 border border-slate-100 text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <span className="font-semibold text-navy-950 text-[11px] block truncate">
                      {t.name}
                    </span>
                    <span className="font-mono text-[10px] text-slate-500 truncate block">
                      {t.domain}
                    </span>
                  </div>
                  <div className="flex-shrink-0">
                    <TrackerBadge category={t.category} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 flex flex-col items-center justify-center text-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 mb-1" />
              <p className="text-xs font-medium text-navy-900">
                No Trackers Detected Yet
              </p>
              <p className="text-[11px] text-slate-400 max-w-[240px] mt-0.5">
                {tabStatus?.siteHostname
                  ? 'No known third-party tracking requests observed on this website.'
                  : 'Open a website to view real-time tracking transparency.'}
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer Actions */}
      <footer className="p-3 bg-white border-t border-slate-200 flex flex-col gap-2">
        <button
          onClick={() => handleOpenDashboard()}
          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-white bg-navy-900 hover:bg-navy-800 rounded-lg transition-colors shadow-sm"
        >
          <span>Open Full Privacy Dashboard</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
          <button
            onClick={() => handleOpenDashboard('#privacy')}
            className="hover:text-brand-600 transition-colors flex items-center gap-1"
          >
            <Sliders className="w-3 h-3" />
            <span>Category Controls</span>
          </button>
          <span className="text-slate-300">•</span>
          <button
            onClick={() => handleOpenDashboard('#education')}
            className="hover:text-brand-600 transition-colors"
          >
            How Tracking Works
          </button>
        </div>
      </footer>
    </div>
  );
};
