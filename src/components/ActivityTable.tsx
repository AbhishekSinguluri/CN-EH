import React, { useState } from 'react';
import {
  Search,
  Filter,
  ShieldCheck,
  Eye,
  Info,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { TRACKER_CATEGORIES } from '../tracker/tracker-categories';
import { ObservedRequest, TrackerCategory } from '../types';
import { EmptyState } from './EmptyState';
import { TrackerBadge } from './TrackerBadge';

interface ActivityTableProps {
  requests: ObservedRequest[];
  onSelectSite?: (hostname: string) => void;
  onClearFilter?: () => void;
}

export const ActivityTable: React.FC<ActivityTableProps> = ({
  requests,
  onSelectSite,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<ObservedRequest | null>(null);

  const filtered = requests.filter((r) => {
    const matchesSearch =
      search === '' ||
      r.trackerDomain.toLowerCase().includes(search.toLowerCase()) ||
      r.trackerName.toLowerCase().includes(search.toLowerCase()) ||
      r.siteHostname.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || r.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const formatTimestamp = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-card overflow-hidden">
      {/* Search and Filter bar */}
      <div className="p-4 border-b border-slate-200/80 flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center bg-slate-50/50">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by tracker, company, or website..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-800 placeholder-slate-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-700"
          >
            <option value="all">All Categories ({requests.length})</option>
            {Object.entries(TRACKER_CATEGORIES).map(([key, meta]) => (
              <option key={key} value={key}>
                {meta.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Content */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No tracking requests observed"
          description={
            requests.length === 0
              ? 'No known third-party tracking requests have been detected in this browsing session yet. Browse websites to view observable requests.'
              : 'No tracking requests match the selected search and filter criteria.'
          }
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-2.5 px-4">Time</th>
                <th className="py-2.5 px-4">Originating Website</th>
                <th className="py-2.5 px-4">Third-Party Tracker</th>
                <th className="py-2.5 px-4">Category</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filtered.slice(0, 150).map((req) => (
                <tr
                  key={req.id}
                  className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                  onClick={() => setSelectedRequest(req)}
                >
                  {/* Time */}
                  <td className="py-2.5 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {formatTimestamp(req.timestamp)}
                    </div>
                  </td>

                  {/* Originating Website */}
                  <td className="py-2.5 px-4 font-medium text-navy-950">
                    {req.siteHostname !== 'direct-or-unknown' ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onSelectSite) onSelectSite(req.siteHostname);
                        }}
                        className="text-navy-900 hover:text-brand-600 hover:underline font-mono text-[11px]"
                      >
                        {req.siteHostname}
                      </button>
                    ) : (
                      <span className="text-slate-400 italic">Unknown origin</span>
                    )}
                  </td>

                  {/* Third-Party Tracker Domain */}
                  <td className="py-2.5 px-4">
                    <div>
                      <span className="font-semibold text-navy-950 block">
                        {req.trackerName}
                      </span>
                      <span className="font-mono text-[11px] text-slate-500">
                        {req.trackerDomain}
                      </span>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-2.5 px-4">
                    <TrackerBadge category={req.category} size="sm" />
                  </td>

                  {/* Blocking / Detection Status */}
                  <td className="py-2.5 px-4 whitespace-nowrap">
                    {req.blocked ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        Blocked via Rule
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                        <Eye className="w-3 h-3 text-slate-500" />
                        Observed Request
                      </span>
                    )}
                  </td>

                  {/* Detail trigger */}
                  <td className="py-2.5 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRequest(req);
                      }}
                      className="p-1 text-slate-400 hover:text-navy-900 rounded hover:bg-slate-200/50"
                      title="Inspect request metadata"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Request Inspection Modal / Drawer */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-6 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-brand-50 text-brand-600 border border-brand-200">
                  <Info className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-navy-950 text-sm">
                  Observed Request Metadata
                </h3>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-500 block mb-0.5 font-medium">Tracker Entity:</span>
                <span className="font-semibold text-navy-900 text-sm">
                  {selectedRequest.trackerName}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-500 block mb-0.5 font-medium">Matched Domain:</span>
                  <span className="font-mono text-slate-800 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                    {selectedRequest.matchedDomain}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5 font-medium">Category:</span>
                  <TrackerBadge category={selectedRequest.category} size="sm" />
                </div>
              </div>

              <div>
                <span className="text-slate-500 block mb-0.5 font-medium">Initiator Website:</span>
                <span className="font-mono text-slate-800">
                  {selectedRequest.siteHostname}
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  {selectedRequest.isThirdParty ? 'Third-Party Context (Cross-site)' : 'First-Party Context'}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block mb-0.5 font-medium">
                  Sanitized Request URL (Privacy Preserved):
                </span>
                <div className="font-mono text-[11px] bg-slate-50 p-2 rounded-lg border border-slate-200 text-slate-700 break-all">
                  {selectedRequest.urlSanitized}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  CTTS strips URL parameters, search terms, and tokens to ensure browsing privacy.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">
                  Observed: {new Date(selectedRequest.timestamp).toLocaleString()}
                </span>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="px-3 py-1 bg-navy-900 text-white rounded-lg hover:bg-navy-800 font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
