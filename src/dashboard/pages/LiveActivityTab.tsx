import React from 'react';
import { ActivityTable } from '../../components/ActivityTable';
import { ObservedRequest } from '../../types';
import { Shield, Lock, Trash2, RefreshCw } from 'lucide-react';

interface LiveActivityTabProps {
  requests: ObservedRequest[];
  onRefresh: () => void;
  onClearHistory: () => void;
  onSelectSite: (site: string) => void;
}

export const LiveActivityTab: React.FC<LiveActivityTabProps> = ({
  requests,
  onRefresh,
  onClearHistory,
  onSelectSite,
}) => {
  return (
    <div className="space-y-4">
      {/* Privacy guarantee banner */}
      <div className="bg-brand-50/70 border border-brand-100 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-brand-900">
          <div className="p-1.5 rounded-lg bg-white border border-brand-200 text-brand-600 shadow-subtle">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold block">
              100% Local Request Observation
            </span>
            <span className="text-slate-600 text-[11px]">
              CTTS strips all query parameters, form fields, and search tokens before logging. No data leaves your machine.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:text-navy-950 rounded-lg font-medium shadow-subtle hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>

          {requests.length > 0 && (
            <button
              onClick={onClearHistory}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-lg font-medium shadow-subtle transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
              <span>Clear History</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <ActivityTable requests={requests} onSelectSite={onSelectSite} />
    </div>
  );
};
