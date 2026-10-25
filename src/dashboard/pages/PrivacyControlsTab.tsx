import React, { useState } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Sliders,
  Trash2,
  RotateCcw,
  Plus,
  X,
  Lock,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { TRACKER_CATEGORIES } from '../../tracker/tracker-categories';
import { TrackerCategory, TrackingSettings } from '../../types';

interface PrivacyControlsTabProps {
  settings: TrackingSettings;
  onUpdateSettings: (newSettings: Partial<TrackingSettings>) => Promise<void>;
  onClearHistory: () => Promise<void>;
  onResetSettings: () => Promise<void>;
}

export const PrivacyControlsTab: React.FC<PrivacyControlsTabProps> = ({
  settings,
  onUpdateSettings,
  onClearHistory,
  onResetSettings,
}) => {
  const [newException, setNewException] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleToggleGlobal = async () => {
    await onUpdateSettings({ blockingEnabled: !settings.blockingEnabled });
    showStatus(
      settings.blockingEnabled
        ? 'Tracker blocking paused.'
        : 'Tracker blocking activated.'
    );
  };

  const handleToggleCategory = async (cat: TrackerCategory) => {
    const updated = {
      ...settings.blockedCategories,
      [cat]: !settings.blockedCategories[cat],
    };
    await onUpdateSettings({ blockedCategories: updated });
    showStatus(`Updated blocking preferences for ${TRACKER_CATEGORIES[cat].name}`);
  };

  const handleAddException = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newException.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    if (!clean) return;

    if (settings.allowedDomains.includes(clean)) {
      showStatus(`"${clean}" is already in the exception list.`);
      setNewException('');
      return;
    }

    const updated = [...settings.allowedDomains, clean];
    await onUpdateSettings({ allowedDomains: updated });
    setNewException('');
    showStatus(`Added "${clean}" to exceptions.`);
  };

  const handleRemoveException = async (domain: string) => {
    const updated = settings.allowedDomains.filter((d) => d !== domain);
    await onUpdateSettings({ allowedDomains: updated });
    showStatus(`Removed "${domain}" from exceptions.`);
  };

  const handleRetentionChange = async (days: number) => {
    await onUpdateSettings({ historyRetentionDays: days });
    showStatus(`History retention updated to ${days} days.`);
  };

  const handleMaxRecordsChange = async (max: number) => {
    await onUpdateSettings({ maxHistoryRecords: max });
    showStatus(`Maximum history records limit set to ${max}.`);
  };

  const executeClearHistory = async () => {
    await onClearHistory();
    setConfirmClear(false);
    showStatus('Local browsing tracking history cleared successfully.');
  };

  const executeResetSettings = async () => {
    await onResetSettings();
    setConfirmReset(false);
    showStatus('Settings restored to factory defaults.');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Toast Notification */}
      {statusMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-navy-900 text-white text-xs px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 border border-slate-700 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Global Protection Toggle Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-3 rounded-xl border ${
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
              <h3 className="text-sm font-bold text-navy-950">
                Global Tracker Blocking
              </h3>
              <p className="text-xs text-slate-500 max-w-md mt-0.5">
                Applies Chrome declarativeNetRequest dynamic rules to block known third-party tracking scripts, cookies, and pixels before they execute.
              </p>
            </div>
          </div>

          <button
            onClick={handleToggleGlobal}
            className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500 ${
              settings.blockingEnabled ? 'bg-brand-600' : 'bg-slate-300'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                settings.blockingEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Category Blocking Preferences */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-card">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-navy-950 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-brand-600" />
            <span>Category-Based Blocking Controls</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Customize which tracker categories should be blocked across websites.
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          {(Object.keys(TRACKER_CATEGORIES) as TrackerCategory[]).map((catKey) => {
            const meta = TRACKER_CATEGORIES[catKey];
            const isBlocked = settings.blockedCategories[catKey] ?? true;

            return (
              <div
                key={catKey}
                className="py-3.5 flex items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-navy-950">
                      {meta.name}
                    </span>
                    <span
                      className="text-[10px] font-medium px-2 py-0.5 rounded border"
                      style={{
                        backgroundColor: meta.bgLight,
                        color: meta.color,
                        borderColor: meta.borderColor,
                      }}
                    >
                      {meta.badgeLabel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
                    {meta.description}
                  </p>
                </div>

                <button
                  onClick={() => handleToggleCategory(catKey)}
                  disabled={!settings.blockingEnabled}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    !settings.blockingEnabled
                      ? 'opacity-40 cursor-not-allowed bg-slate-200'
                      : isBlocked
                      ? 'bg-brand-600'
                      : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      isBlocked ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Per-Domain Allowlist / Exceptions */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-card">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-navy-950">
            Per-Website Allowlist (Exceptions)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Tracker blocking will be paused for websites added here, in case blocking breaks specific functionality.
          </p>
        </div>

        {/* Add exception input form */}
        <form onSubmit={handleAddException} className="flex gap-2 mb-4">
          <input
            type="text"
            value={newException}
            onChange={(e) => setNewException(e.target.value)}
            placeholder="e.g. news.example.com"
            className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-800 font-mono"
          />
          <button
            type="submit"
            className="flex items-center gap-1 px-3.5 py-1.5 bg-navy-900 text-white rounded-lg text-xs font-semibold hover:bg-navy-800 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Exception</span>
          </button>
        </form>

        {/* Exceptions list */}
        {settings.allowedDomains.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {settings.allowedDomains.map((domain) => (
              <span
                key={domain}
                className="inline-flex items-center gap-1.5 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg text-xs font-mono text-slate-800"
              >
                <span>{domain}</span>
                <button
                  onClick={() => handleRemoveException(domain)}
                  className="text-slate-400 hover:text-rose-600 rounded p-0.5"
                  title="Remove exception"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">
            No websites in exception list. All visited sites follow global protection rules.
          </p>
        )}
      </div>

      {/* Local Storage & Retention Options */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-card">
        <h3 className="text-sm font-bold text-navy-950 mb-1">
          Local Storage & Data Retention Limits
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          All records remain strictly on your device inside Chrome local storage. Older records are automatically pruned.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              History Retention Period
            </label>
            <select
              value={settings.historyRetentionDays}
              onChange={(e) => handleRetentionChange(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg p-2 focus:ring-1 focus:ring-brand-500"
            >
              <option value={1}>1 Day (Ephemeral)</option>
              <option value={3}>3 Days</option>
              <option value={7}>7 Days (Recommended)</option>
              <option value={14}>14 Days</option>
              <option value={30}>30 Days</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Maximum Event Records
            </label>
            <select
              value={settings.maxHistoryRecords}
              onChange={(e) => handleMaxRecordsChange(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg p-2 focus:ring-1 focus:ring-brand-500"
            >
              <option value={250}>250 records</option>
              <option value={500}>500 records</option>
              <option value={1000}>1,000 records (Default)</option>
              <option value={2500}>2,500 records</option>
            </select>
          </div>
        </div>
      </div>

      {/* Danger Zone: Clear Data & Reset */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-card">
        <h3 className="text-sm font-bold text-navy-950 mb-1">
          Data Management & Defaults
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Clear your recorded browsing history or revert all protection settings to default values.
        </p>

        <div className="flex flex-wrap gap-3">
          {confirmClear ? (
            <div className="flex items-center gap-2 p-2 bg-rose-50 border border-rose-200 rounded-lg">
              <span className="text-xs text-rose-800 font-semibold">
                Erase all recorded activity?
              </span>
              <button
                onClick={executeClearHistory}
                className="px-2.5 py-1 bg-rose-600 text-white rounded text-xs font-semibold hover:bg-rose-700"
              >
                Yes, Clear All
              </button>
              <button
                onClick={() => setConfirmClear(false)}
                className="px-2 py-1 bg-white border border-slate-200 text-slate-700 rounded text-xs hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmClear(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 border border-rose-200 text-rose-700 bg-rose-50/50 hover:bg-rose-50 rounded-lg text-xs font-semibold transition-colors"
            >
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span>Clear Activity History</span>
            </button>
          )}

          {confirmReset ? (
            <div className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
              <span className="text-xs text-amber-800 font-semibold">
                Reset settings to defaults?
              </span>
              <button
                onClick={executeResetSettings}
                className="px-2.5 py-1 bg-amber-600 text-white rounded text-xs font-semibold hover:bg-amber-700"
              >
                Confirm Reset
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="px-2 py-1 bg-white border border-slate-200 text-slate-700 rounded text-xs hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmReset(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg text-xs font-semibold transition-colors"
            >
              <RotateCcw className="w-4 h-4 text-slate-500" />
              <span>Reset Settings to Default</span>
            </button>
          )}
        </div>
      </div>

      {/* Permissions Transparency Panel */}
      <div className="bg-slate-100/70 border border-slate-200 rounded-xl p-5 text-xs text-slate-600 space-y-2">
        <div className="flex items-center gap-2 font-bold text-navy-950">
          <Lock className="w-4 h-4 text-brand-600" />
          <span>Chrome MV3 Permission Audit & Privacy Commitments</span>
        </div>
        <ul className="list-disc list-inside space-y-1 pl-1 text-[11px] leading-relaxed">
          <li>
            <strong className="text-navy-900">declarativeNetRequest:</strong> Evaluates blocking rules in the browser network layer to halt tracking connections before payload transfer.
          </li>
          <li>
            <strong className="text-navy-900">webRequest & &lt;all_urls&gt;:</strong> Inspects initiating domains and target tracking domains to build the transparency log. Query parameters and form data are discarded prior to storage.
          </li>
          <li>
            <strong className="text-navy-900">storage:</strong> Retains your preferences and bounded local log locally in <code className="font-mono bg-white px-1 py-0.5 rounded">chrome.storage.local</code>.
          </li>
          <li>
            <strong className="text-navy-900">Zero Remote Exfiltration:</strong> CTTS contains zero telemetry, analytics, or third-party cloud backends. All computation executes exclusively within your browser.
          </li>
        </ul>
      </div>
    </div>
  );
};
