import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  AlertCircle,
  Layers,
  Globe,
  Radio,
  ExternalLink,
} from 'lucide-react';
import { TrackerSummary } from '../../storage/activity-store';
import { SiteTrackerSummary, TrackerCategory } from '../../types';
import { TRACKER_CATEGORIES } from '../../tracker/tracker-categories';
import { TrackerBadge } from '../../components/TrackerBadge';

interface InsightsTabProps {
  trackerSummaries: TrackerSummary[];
  siteSummaries: SiteTrackerSummary[];
  onSelectSite: (site: string) => void;
}

export const InsightsTab: React.FC<InsightsTabProps> = ({
  trackerSummaries,
  siteSummaries,
  onSelectSite,
}) => {
  const top10Trackers = trackerSummaries.slice(0, 8);
  const chartData = top10Trackers.map((t) => ({
    name: t.name.length > 18 ? t.name.substring(0, 16) + '...' : t.name,
    domain: t.trackerDomain,
    requests: t.requestCount,
    blocked: t.blockedCount,
    color: TRACKER_CATEGORIES[t.category]?.color || '#4f46e5',
  }));

  return (
    <div className="space-y-6">
      {/* Cybersecurity Scientific Disclaimer Notice */}
      <div className="bg-amber-50/70 border border-amber-200/90 rounded-xl p-4 flex items-start gap-3 text-xs text-amber-900">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold block text-sm">
            Critical Data Interpretation Note
          </span>
          <p className="leading-relaxed">
            Observing higher request counts from a tracking entity does not necessarily prove that more personal data was collected. Many tracking libraries ping periodic telemetry heartbeats or load static scripts, while a single conversion pixel request may transmit a hashed customer identifier. CTTS provides transparent visibility into observable network requests without speculating on unknown server-side storage.
          </p>
        </div>
      </div>

      {/* Top Trackers Bar Chart */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-navy-950">
              Top Observed Tracker Networks
            </h3>
            <p className="text-xs text-slate-500">
              Frequency of requests intercepted across your browsing sessions
            </p>
          </div>
          <TrendingUp className="w-4 h-4 text-slate-400" />
        </div>

        {chartData.length > 0 ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <XAxis type="number" fontSize={11} stroke="#94a3b8" />
                <YAxis
                  dataKey="name"
                  type="category"
                  fontSize={11}
                  stroke="#475569"
                  width={130}
                />
                <Tooltip
                  formatter={(val: number) => [`${val} requests`, 'Observed Calls']}
                  contentStyle={{
                    borderRadius: '8px',
                    fontSize: '12px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                  }}
                />
                <Bar dataKey="requests" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-slate-400">
            No tracker network statistics accumulated yet.
          </div>
        )}
      </div>

      {/* In-Depth Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tracker Entity Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-card flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-navy-950 flex items-center gap-2">
              <Radio className="w-4 h-4 text-brand-600" />
              <span>Tracker Entities & Publisher Reach</span>
            </h3>
            <span className="text-xs font-mono text-slate-500">
              {trackerSummaries.length} tracked
            </span>
          </div>

          {trackerSummaries.length > 0 ? (
            <div className="overflow-x-auto divide-y divide-slate-100 text-xs">
              {trackerSummaries.slice(0, 10).map((t) => (
                <div
                  key={t.trackerDomain}
                  className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg transition-colors"
                >
                  <div className="min-w-0 pr-3">
                    <span className="font-semibold text-navy-950 block truncate">
                      {t.name}
                    </span>
                    <span className="font-mono text-[11px] text-slate-500 block truncate">
                      {t.trackerDomain}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      Observed on {t.distinctSitesCount} site{t.distinctSitesCount === 1 ? '' : 's'}
                    </span>
                  </div>

                  <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
                    <TrackerBadge category={t.category} size="sm" />
                    <span className="font-mono font-bold text-xs text-slate-700">
                      {t.requestCount} calls
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-xs text-slate-400">
              No entities detected.
            </div>
          )}
        </div>

        {/* Sites with Most Tracker Domains */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-card flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-navy-950 flex items-center gap-2">
              <Globe className="w-4 h-4 text-brand-600" />
              <span>Publishers with Highest Tracker Density</span>
            </h3>
            <span className="text-xs font-mono text-slate-500">
              {siteSummaries.length} sites
            </span>
          </div>

          {siteSummaries.length > 0 ? (
            <div className="overflow-x-auto divide-y divide-slate-100 text-xs">
              {siteSummaries.slice(0, 10).map((s) => (
                <div
                  key={s.siteHostname}
                  onClick={() => onSelectSite(s.siteHostname)}
                  className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg transition-colors cursor-pointer group"
                >
                  <div className="min-w-0 pr-3">
                    <span className="font-mono text-xs font-semibold text-navy-950 group-hover:text-brand-600 block truncate">
                      {s.siteHostname}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Embeds {s.trackerDomains.length} unique tracker domain{s.trackerDomains.length === 1 ? '' : 's'}
                    </span>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="font-mono font-bold text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {s.requestCount} requests
                    </span>
                    {s.isAllowlisted && (
                      <span className="block text-[10px] text-amber-600 font-semibold mt-1">
                        Allowlisted
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-xs text-slate-400">
              No sites detected.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
