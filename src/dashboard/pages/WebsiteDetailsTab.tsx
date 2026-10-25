import React, { useState, useEffect } from 'react';
import {
  Globe,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Search,
  CheckCircle,
  AlertTriangle,
  Clock,
  Layers,
} from 'lucide-react';
import { SiteTrackerSummary, TrackerCategory, TrackingSettings } from '../../types';
import { TrackerBadge } from '../../components/TrackerBadge';
import { trackerDatabase } from '../../tracker/tracker-database';

interface WebsiteDetailsTabProps {
  siteSummaries: SiteTrackerSummary[];
  selectedSite: string | null;
  settings: TrackingSettings;
  onSelectSite: (site: string) => void;
  onToggleAllowlist: (site: string) => void;
}

export const WebsiteDetailsTab: React.FC<WebsiteDetailsTabProps> = ({
  siteSummaries,
  selectedSite,
  settings,
  onSelectSite,
  onToggleAllowlist,
}) => {
  const [search, setSearch] = useState('');

  // Default to first site if none selected and sites exist
  useEffect(() => {
    if (!selectedSite && siteSummaries.length > 0) {
      onSelectSite(siteSummaries[0].siteHostname);
    }
  }, [selectedSite, siteSummaries, onSelectSite]);

  const filteredSites = siteSummaries.filter((s) =>
    s.siteHostname.toLowerCase().includes(search.toLowerCase())
  );

  const currentSummary = siteSummaries.find(
    (s) => s.siteHostname === selectedSite
  );

  const isCurrentAllowlisted = selectedSite
    ? settings.allowedDomains.includes(selectedSite.toLowerCase())
    : false;

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      {/* Left Column: Website Selector List */}
      <div className="md:col-span-4 bg-white rounded-xl border border-slate-200/80 p-4 shadow-card flex flex-col h-[650px]">
        <div className="mb-3">
          <h3 className="text-sm font-bold text-navy-950 mb-1">
            Observed Websites
          </h3>
          <p className="text-xs text-slate-500 mb-3">
            Select a website to inspect its third-party tracker footprint
          </p>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search website..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-800"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 pr-1">
          {filteredSites.length > 0 ? (
            filteredSites.map((site) => {
              const active = site.siteHostname === selectedSite;
              const allowlisted = settings.allowedDomains.includes(
                site.siteHostname.toLowerCase()
              );

              return (
                <button
                  key={site.siteHostname}
                  onClick={() => onSelectSite(site.siteHostname)}
                  className={`w-full text-left py-2.5 px-3 rounded-lg transition-colors flex items-center justify-between ${
                    active
                      ? 'bg-brand-50 text-brand-900 border border-brand-200'
                      : 'hover:bg-slate-50 text-navy-900'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <span className="font-mono text-xs font-semibold block truncate">
                      {site.siteHostname}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {site.trackerDomains.length} tracker domain{site.trackerDomains.length === 1 ? '' : 's'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {allowlisted && (
                      <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-semibold">
                        Paused
                      </span>
                    )}
                    <span className="font-mono text-xs text-slate-500 font-bold">
                      {site.requestCount}
                    </span>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="py-12 text-center text-xs text-slate-400">
              No websites found matching your filter.
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Detailed Website Inspection View */}
      <div className="md:col-span-8 flex flex-col gap-6">
        {currentSummary ? (
          <>
            {/* Website Header Card */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-card">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
                    <Globe className="w-5 h-5 text-brand-600" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold font-mono text-navy-950">
                      {currentSummary.siteHostname}
                    </h2>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        Last active:{' '}
                        {new Date(currentSummary.lastObserved).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Per-Domain Exception Toggle */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToggleAllowlist(currentSummary.siteHostname)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      isCurrentAllowlisted
                        ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-subtle'
                    }`}
                  >
                    {isCurrentAllowlisted ? (
                      <>
                        <ShieldAlert className="w-4 h-4 text-amber-600" />
                        <span>Allowlisted (Blocking Paused)</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Protected (Click to Allowlist)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Quick site stats */}
              <div className="grid grid-cols-3 gap-3 pt-4">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">
                    Third-Party Trackers
                  </span>
                  <span className="text-xl font-bold font-mono text-navy-950">
                    {currentSummary.trackerDomains.length}
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">
                    Observed Calls
                  </span>
                  <span className="text-xl font-bold font-mono text-brand-600">
                    {currentSummary.requestCount}
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">
                    Blocking State
                  </span>
                  <span
                    className={`text-xs font-bold block mt-1 ${
                      isCurrentAllowlisted
                        ? 'text-amber-700'
                        : settings.blockingEnabled
                        ? 'text-emerald-700'
                        : 'text-slate-500'
                    }`}
                  >
                    {isCurrentAllowlisted
                      ? 'Exception Paused'
                      : settings.blockingEnabled
                      ? 'Actively Enforced'
                      : 'Global Off'}
                  </span>
                </div>
              </div>
            </div>

            {/* Observed Tracker Domains on this Website */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-card flex-1">
              <h3 className="text-sm font-bold text-navy-950 mb-1">
                Embedded Third-Party Tracking Services
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Specific external tracker hostnames contacted during your browsing on{' '}
                <span className="font-mono text-navy-900">{currentSummary.siteHostname}</span>.
              </p>

              <div className="space-y-2.5">
                {currentSummary.trackerDomains.map((domain) => {
                  const entry = trackerDatabase.findTracker(domain);
                  return (
                    <div
                      key={domain}
                      className="p-3 rounded-lg border border-slate-200/70 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-navy-950">
                            {entry?.name || domain}
                          </span>
                          {entry && <TrackerBadge category={entry.category} size="sm" />}
                        </div>
                        <span className="font-mono text-[11px] text-slate-500 block mt-0.5">
                          {domain}
                        </span>
                        {entry?.description && (
                          <p className="text-[11px] text-slate-600 mt-1 max-w-xl">
                            {entry.description}
                          </p>
                        )}
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span className="text-[11px] text-slate-400 font-medium">
                          Source: {entry?.source || 'Bundled Database'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Evidence & Limitation Disclaimer */}
            <div className="bg-slate-100/70 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 leading-relaxed">
              <div className="flex items-center gap-1.5 font-bold text-navy-950 mb-1">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Observed Requests vs. Data Sharing Limitations</span>
              </div>
              Observing a network request from {currentSummary.siteHostname} to a third-party tracking server shows that code executed in your browser contacted that external endpoint. However, a browser extension cannot determine the internal server-side contracts or private company data-sharing agreements between entities.
            </div>
          </>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
            Select a website on the left to view detailed tracker inspections.
          </div>
        )}
      </div>
    </div>
  );
};
