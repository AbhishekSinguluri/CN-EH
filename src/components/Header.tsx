import React from 'react';
import { Shield, ShieldCheck, ShieldAlert, ExternalLink, RefreshCw } from 'lucide-react';

interface HeaderProps {
  title?: string;
  isDashboard?: boolean;
  blockingEnabled: boolean;
  activeTab?: string;
  onRefresh?: () => void;
  onOpenDashboard?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'CTTS',
  isDashboard = false,
  blockingEnabled,
  onRefresh,
  onOpenDashboard,
}) => {
  return (
    <header className="bg-white border-b border-slate-200/90 sticky top-0 z-30 px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-lg bg-navy-900 flex items-center justify-center text-white shadow-sm ring-1 ring-black/5">
              <Shield className="w-5 h-5 text-brand-500" />
            </div>
            <div
              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                blockingEnabled ? 'bg-emerald-500' : 'bg-slate-400'
              }`}
              title={blockingEnabled ? 'Protection Active' : 'Protection Paused'}
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm sm:text-base tracking-tight text-navy-950">
                {title}
              </span>
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-1.5 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
                MV3 Local
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Cross-Platform Tracking Transparency System
            </p>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-1.5 text-slate-500 hover:text-navy-900 hover:bg-slate-100 rounded-lg transition-colors"
              title="Refresh tracking data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}

          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
              blockingEnabled
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
          >
            {blockingEnabled ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Protection Active</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                <span>Blocking Paused</span>
              </>
            )}
          </div>

          {!isDashboard && onOpenDashboard && (
            <button
              onClick={onOpenDashboard}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white bg-navy-900 hover:bg-navy-800 rounded-lg transition-colors shadow-sm ml-1"
            >
              <span>Dashboard</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
