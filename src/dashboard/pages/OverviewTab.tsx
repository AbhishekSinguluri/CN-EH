import React from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Globe,
  Radio,
  Eye,
  Layers,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { StatCard } from '../../components/StatCard';
import { TrackerBadge } from '../../components/TrackerBadge';
import { TRACKER_CATEGORIES } from '../../tracker/tracker-categories';
import {
  ObservedRequest,
  SiteTrackerSummary,
  TrackerCategory,
  TrackingSettings,
  TrackingStats,
} from '../../types';
import { TrackerSummary } from '../../storage/activity-store';

interface OverviewTabProps {
  stats: TrackingStats;
  settings: TrackingSettings;
  recentRequests: ObservedRequest[];
  topTrackers: TrackerSummary[];
  topSites: SiteTrackerSummary[];
  onNavigateTab: (tabId: string) => void;
  onSelectSite: (site: string) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  stats,
  settings,
  recentRequests,
  topTrackers,
  topSites,
  onNavigateTab,
  onSelectSite,
}) => {
  const pieData = Object.entries(stats.categoryCounts)
    .filter(([, count]) => count > 0)
    .map(([cat, count]) => ({
      name: TRACKER_CATEGORIES[cat as TrackerCategory]?.name || cat,
      category: cat as TrackerCategory,
      value: count,
      color: TRACKER_CATEGORIES[cat as TrackerCategory]?.color || '#64748b',
    }));

  return (
    <div className="space-y-6">
      {/* Scope and Status Notice */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-xl border ${
              settings.blockingEnabled
                ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                : 'bg-amber-50 text-amber-600 border-amber-200'
            }`}
          >
            {settings.blockingEnabled ? (
              <ShieldCheck className="w-6 h-6" />
            ) : (
              <ShieldAlert className="w-6 h-6" />
            )}
          </div>
          <div>
            <h2 className="text-sm font-bold text-navy-950 flex items-center gap-2">
              <span>System Status:</span>
              <span
                className={
                  settings.blockingEnabled
                    ? 'text-emerald-700'
                    : 'text-amber-700'
                }
              >
                {settings.blockingEnabled
                  ? 'Active Tracker Blocking'
                  : 'Observation Only (Blocking Inactive)'}
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Observing third-party tracking network requests locally in Chrome
              Manifest V3.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Local Data Scope: Last {settings.historyRetentionDays} Days</span>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Known Trackers Detected"
          value={stats.uniqueTrackerDomainsCount}
          subtitle="Distinct tracking domains observed across browsing"
          icon={Radio}
          badge={{
            text: `${stats.uniqueTrackerDomainsCount} Entities`,
            variant: 'info',
          }}
          scopeNote="Verified against bundled tracker database"
        />

        <StatCard
          title="Websites with Trackers"
          value={stats.uniqueSitesCount}
          subtitle="Websites where third-party trackers were observed"
          icon={Globe}
          badge={{
            text: 'Origin Sites',
            variant: 'neutral',
          }}
          scopeNote="Based on request initiator headers"
        />

        <StatCard
          title="Observed Tracker Calls"
          value={stats.totalObservedRequests}
          subtitle="Total matching tracking requests logged"
          icon={Eye}
          badge={{
            text: 'Local Log',
            variant: 'info',
          }}
          scopeNote="Query strings stripped for privacy"
        />

        <StatCard
          title="Blocking Rule Actions"
          value={stats.estimatedBlockedRequests}
          subtitle="Requests matched by active declarative rules"
          icon={ShieldCheck}
          badge={{
            text: settings.blockingEnabled ? 'Protected' : 'Disabled',
            variant: settings.blockingEnabled ? 'success' : 'warning',
          }}
          scopeNote="declarativeNetRequest rule matches"
        />
      </div>

      {/* Visual Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown Chart */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-card flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-navy-950">
                Tracking Categories
              </h3>
              <p className="text-xs text-slate-500">
                Distribution of observed requests by tracker purpose
              </p>
            </div>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>

          {pieData.length > 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="w-full h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: number) => [`${val} requests`, 'Count']}
                      contentStyle={{
                        borderRadius: '8px',
                        fontSize: '12px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="w-full space-y-1.5 mt-2">
                {pieData.map((item) => (
                  <div
                    key={item.category}
                    className="flex items-center justify-between text-xs py-1 px-2 rounded hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-slate-700 font-medium truncate max-w-[170px]">
                        {item.name}
                      </span>
                    </div>
                    <span className="font-mono text-slate-500 font-semibold">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
              <p className="text-xs text-slate-400">
                No tracking data logged yet. Categories will appear as you browse.
              </p>
            </div>
          )}
        </div>

        {/* Top Detected Trackers */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-card flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-navy-950">
                Most Observed Trackers
              </h3>
              <p className="text-xs text-slate-500">
                Tracking entities recorded most frequently
              </p>
            </div>
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </div>

          {topTrackers.length > 0 ? (
            <div className="space-y-2 flex-1">
              {topTrackers.slice(0, 5).map((tracker) => (
                <div
                  key={tracker.trackerDomain}
                  className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors flex items-center justify-between"
                >
                  <div className="min-w-0 pr-2">
                    <span className="font-semibold text-xs text-navy-950 block truncate">
                      {tracker.name}
                    </span>
                    <span className="font-mono text-[11px] text-slate-500 block truncate">
                      {tracker.trackerDomain}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <TrackerBadge category={tracker.category} size="sm" />
                    <span className="font-mono text-xs font-bold text-navy-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {tracker.requestCount}
                    </span>
                  </div>
                </div>
              ))}

              <button
                onClick={() => onNavigateTab('insights')}
                className="w-full mt-3 text-xs text-brand-600 hover:text-brand-700 font-semibold flex items-center justify-center gap-1 py-1.5"
              >
                <span>View Full Tracker Insights</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
              <p className="text-xs text-slate-400">
                No trackers observed yet.
              </p>
            </div>
          )}
        </div>

        {/* Websites with Most Trackers */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-card flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-navy-950">
                Websites Observed
              </h3>
              <p className="text-xs text-slate-500">
                Sites hosting the highest number of tracking domains
              </p>
            </div>
            <Globe className="w-4 h-4 text-slate-400" />
          </div>

          {topSites.length > 0 ? (
            <div className="space-y-2 flex-1">
              {topSites.slice(0, 5).map((site) => (
                <div
                  key={site.siteHostname}
                  onClick={() => onSelectSite(site.siteHostname)}
                  className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/70 hover:bg-slate-100 transition-colors flex items-center justify-between cursor-pointer group"
                >
                  <div className="min-w-0 pr-2">
                    <span className="font-mono text-xs font-semibold text-navy-950 group-hover:text-brand-600 block truncate">
                      {site.siteHostname}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {site.trackerDomains.length} distinct tracker{site.trackerDomains.length === 1 ? '' : 's'}
                    </span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="font-mono text-xs font-bold text-slate-700">
                      {site.requestCount}
                    </span>
                    <span className="text-[10px] text-slate-400 block">requests</span>
                  </div>
                </div>
              ))}

              <button
                onClick={() => onNavigateTab('websites')}
                className="w-full mt-3 text-xs text-brand-600 hover:text-brand-700 font-semibold flex items-center justify-center gap-1 py-1.5"
              >
                <span>Inspect All Websites</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
              <p className="text-xs text-slate-400">
                No originating websites recorded yet.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity Mini-Feed */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-navy-950">
              Recent Activity Feed
            </h3>
            <p className="text-xs text-slate-500">
              Latest third-party network events intercepted by CTTS
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('activity')}
            className="text-xs text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1"
          >
            <span>Open Live Activity Log</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentRequests.length > 0 ? (
          <div className="divide-y divide-slate-100 text-xs">
            {recentRequests.slice(0, 5).map((req) => (
              <div
                key={req.id}
                className="py-2.5 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 pr-3">
                  <span className="font-mono text-[11px] text-slate-400 whitespace-nowrap">
                    {new Date(req.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <div className="truncate">
                    <span className="font-semibold text-navy-950">
                      {req.trackerName}
                    </span>
                    <span className="text-slate-400 mx-1.5">via</span>
                    <span className="font-mono text-slate-600">
                      {req.siteHostname}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <TrackerBadge category={req.category} size="sm" />
                  {req.blocked ? (
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Blocked
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      Observed
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-400">
            No live requests observed yet. Browse the web to populate your private
            activity stream.
          </div>
        )}
      </div>
    </div>
  );
};
