import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from '../src/components/EmptyState';
import { TrackerBadge } from '../src/components/TrackerBadge';
import { StatCard } from '../src/components/StatCard';
import { Eye, Shield } from 'lucide-react';
import { sendExtensionMessage } from '../src/messaging/message-types';

describe('UI Components & Empty States', () => {
  it('renders EmptyState with custom title and description', () => {
    render(
      <EmptyState
        title="No Trackers Observed"
        description="Your browsing session is clean and private."
      />
    );
    expect(screen.getByText('No Trackers Observed')).toBeDefined();
    expect(screen.getByText('Your browsing session is clean and private.')).toBeDefined();
  });

  it('renders TrackerBadge with correct category label', () => {
    render(<TrackerBadge category="advertising" />);
    expect(screen.getByText('Ad Network')).toBeDefined();

    render(<TrackerBadge category="analytics" />);
    expect(screen.getByText('Analytics')).toBeDefined();
  });

  it('renders StatCard with formatted value and subtitle', () => {
    render(
      <StatCard
        title="Detected Trackers"
        value={42}
        subtitle="Entities found in this session"
        icon={Eye}
        badge={{ text: 'High Risk', variant: 'warning' }}
      />
    );
    expect(screen.getByText('Detected Trackers')).toBeDefined();
    expect(screen.getByText('42')).toBeDefined();
    expect(screen.getByText('Entities found in this session')).toBeDefined();
    expect(screen.getByText('High Risk')).toBeDefined();
  });
});

describe('Browser API Error Boundaries & Fallbacks', () => {
  it('returns graceful error response when chrome.runtime.sendMessage is unavailable', async () => {
    const originalRuntime = (global as any).chrome.runtime;
    (global as any).chrome.runtime = undefined;

    const res = await sendExtensionMessage({ type: 'GET_SETTINGS' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('not available');

    // Restore mock
    (global as any).chrome.runtime = originalRuntime;
  });
});
