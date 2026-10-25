import React from 'react';
import { getCategoryMeta } from '../tracker/tracker-categories';
import { TrackerCategory } from '../types';

interface TrackerBadgeProps {
  category: TrackerCategory;
  showDescriptionTooltip?: boolean;
  size?: 'sm' | 'md';
}

export const TrackerBadge: React.FC<TrackerBadgeProps> = ({
  category,
  showDescriptionTooltip = false,
  size = 'md',
}) => {
  const meta = getCategoryMeta(category);

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-md border ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      }`}
      style={{
        backgroundColor: meta.bgLight,
        color: meta.color,
        borderColor: meta.borderColor,
      }}
      title={showDescriptionTooltip ? meta.description : undefined}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: meta.color }}
      />
      {meta.badgeLabel}
    </span>
  );
};
