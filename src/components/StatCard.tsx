import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  badge?: {
    text: string;
    variant: 'success' | 'warning' | 'info' | 'neutral';
  };
  scopeNote?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  scopeNote,
}) => {
  const badgeStyles = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    info: 'bg-brand-50 text-brand-700 border-brand-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-card hover:shadow-card-hover transition-all">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
          {title}
        </span>
        <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-navy-800">
          <Icon className="w-4 h-4 text-brand-600" />
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-navy-950 font-mono">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        {badge && (
          <span
            className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
              badgeStyles[badge.variant]
            }`}
          >
            {badge.text}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-slate-600 leading-relaxed">{subtitle}</p>
      )}

      {scopeNote && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 text-[10px] text-slate-400 font-medium">
          {scopeNote}
        </div>
      )}
    </div>
  );
};
