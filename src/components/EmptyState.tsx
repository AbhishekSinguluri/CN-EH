import React from 'react';
import { LucideIcon, ShieldCheck } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = ShieldCheck,
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <div className="py-12 px-6 flex flex-col items-center justify-center text-center bg-white rounded-xl border border-dashed border-slate-200">
      <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mb-4 text-brand-600">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-semibold text-navy-950 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mb-4 leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors border border-brand-200"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
