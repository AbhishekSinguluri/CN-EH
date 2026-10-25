import React from 'react';
import {
  Shield,
  Code2,
  Lock,
  Database,
  ExternalLink,
  Layers,
  HeartHandshake,
} from 'lucide-react';

export const AboutTab: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl text-navy-950">
      {/* Hero Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-card flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-navy-900 flex items-center justify-center text-white flex-shrink-0 shadow-sm">
          <Shield className="w-6 h-6 text-brand-500" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-navy-950">
              Cross-Platform Tracking Transparency System (CTTS)
            </h2>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
              v1.0.0
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
            A production-ready Chrome browser extension engineered to inspect, classify, and mitigate third-party web tracking in real time using Manifest V3 and on-device declarativeNetRequest blocking.
          </p>
        </div>
      </div>

      {/* Core Architectural Tenets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-card">
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 w-fit mb-3">
            <Lock className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-navy-950 mb-1">
            Zero Remote Exfiltration
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            All request inspection, categorization, and statistics processing execute entirely inside your local Chrome browser sandbox. No cloud servers or telemetry beacons exist.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-card">
          <div className="p-2 rounded-lg bg-brand-50 text-brand-600 border border-brand-200 w-fit mb-3">
            <Code2 className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-navy-950 mb-1">
            Modern Manifest V3
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Built strictly on modern Chrome extension standards, leveraging service workers and declarativeNetRequest dynamic rules for lightweight, battery-efficient protection.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-card">
          <div className="p-2 rounded-lg bg-purple-50 text-purple-600 border border-purple-200 w-fit mb-3">
            <HeartHandshake className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-navy-950 mb-1">
            Scientific Objectivity
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            CTTS displays verified, observable network telemetry without manufacturing speculative claims about undisclosed server-side databases or company arrangements.
          </p>
        </div>
      </div>

      {/* Technology Stack Grid */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-card">
        <div className="flex items-center gap-2 mb-3">
          <Layers className="w-4 h-4 text-brand-600" />
          <h3 className="text-sm font-bold text-navy-950">Technology Stack</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-400 font-mono block">Runtime</span>
            <span className="font-semibold text-navy-950">Chrome MV3</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-400 font-mono block">Language</span>
            <span className="font-semibold text-navy-950">TypeScript 5.6</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-400 font-mono block">Frontend UI</span>
            <span className="font-semibold text-navy-950">React 18</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-400 font-mono block">Bundler</span>
            <span className="font-semibold text-navy-950">Vite 5.4</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-400 font-mono block">Styling</span>
            <span className="font-semibold text-navy-950">Tailwind CSS</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-400 font-mono block">Visualizations</span>
            <span className="font-semibold text-navy-950">Recharts 2.15</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-400 font-mono block">Icons</span>
            <span className="font-semibold text-navy-950">Lucide React</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-400 font-mono block">Testing</span>
            <span className="font-semibold text-navy-950">Vitest & JSDOM</span>
          </div>
        </div>
      </div>

      {/* Tracker Dataset & Attributions */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-card">
        <div className="flex items-center gap-2 mb-2">
          <Database className="w-4 h-4 text-brand-600" />
          <h3 className="text-sm font-bold text-navy-950">
            Tracker Database & Community Attribution
          </h3>
        </div>
        <p className="text-xs text-slate-500 mb-3 leading-relaxed">
          The starter tracking database bundled with CTTS contains curated, high-confidence tracking domains classified across advertising networks, site analytics, social pixels, and conversion beacons.
        </p>

        <div className="space-y-2 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div>
              <span className="font-semibold text-navy-950 block">DuckDuckGo Tracker Radar</span>
              <span className="text-[11px] text-slate-500">Open-source behavioral tracker and domain relationship dataset.</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Public Domain / CC0</span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div>
              <span className="font-semibold text-navy-950 block">EasyPrivacy & EasyList</span>
              <span className="text-[11px] text-slate-500">Community-maintained rules for tracking server hostnames and subdomains.</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">GPL / CC BY-SA</span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div>
              <span className="font-semibold text-navy-950 block">Disconnect.me Open Tracker List</span>
              <span className="text-[11px] text-slate-500">Categorized tracking definitions across social, content, and analytics tags.</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">GPLv3</span>
          </div>
        </div>
      </div>
    </div>
  );
};
