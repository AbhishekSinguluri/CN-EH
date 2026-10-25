import React from 'react';
import {
  BookOpen,
  Cookie,
  Target,
  Share2,
  Eye,
  ShieldCheck,
  AlertTriangle,
  Layers,
  Search,
  Cpu,
} from 'lucide-react';

export const EducationTab: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl text-navy-950">
      {/* Intro Header */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-card">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-brand-50 text-brand-600 border border-brand-200">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-navy-950">
              Understanding Modern Web Tracking
            </h2>
            <p className="text-xs text-slate-500">
              A comprehensive technical guide to how online advertising ecosystems, cross-site telemetry, and conversion attribution work.
            </p>
          </div>
        </div>
      </div>

      {/* Cross-Platform Ad Scenario Deep Dive */}
      <div className="bg-white rounded-xl border border-brand-200/80 p-6 shadow-card relative overflow-hidden">
        <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-32 h-32 bg-brand-50 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-2 mb-3">
          <span className="p-1 rounded bg-brand-100 text-brand-700 font-mono text-[10px] font-bold">
            CASE STUDY
          </span>
          <h3 className="text-sm font-bold text-navy-950">
            Why Do Ads for Products Follow You Across Different Platforms?
          </h3>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed mb-4">
          A common user experience is searching for running shoes or luggage on an e-commerce website, and later noticing advertisements for the exact same item while reading news articles, checking social feeds, or watching videos on completely different platforms. Here is how this happens under the hood:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200/80 flex flex-col justify-between">
            <div>
              <span className="font-mono text-brand-600 font-bold block mb-1 text-[11px]">
                Step 1: Product Page Tagging
              </span>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                When you visit an online store, third-party advertising tags (such as Google DoubleClick, Criteo, or Meta Pixel) embedded on the page record the specific product category, SKU, and browsing timestamp.
              </p>
            </div>
            <span className="mt-3 text-[10px] text-slate-400 font-mono">
              Action: Observed by CTTS
            </span>
          </div>

          <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200/80 flex flex-col justify-between">
            <div>
              <span className="font-mono text-brand-600 font-bold block mb-1 text-[11px]">
                Step 2: Audience Segmenting
              </span>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                The ad network maps this activity to a pseudonymized identifier (stored in a cookie, localStorage, or hashed email token). You are assigned to a "recent shoe intender" retargeting audience segment.
              </p>
            </div>
            <span className="mt-3 text-[10px] text-slate-400 font-mono">
              Action: Ad Exchange Cloud
            </span>
          </div>

          <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200/80 flex flex-col justify-between">
            <div>
              <span className="font-mono text-brand-600 font-bold block mb-1 text-[11px]">
                Step 3: Real-Time Bidding (RTB)
              </span>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                When you later visit a separate news site, an ad auction occurs in milliseconds. The ad network recognizes your identifier and outbids generic advertisers to deliver the targeted product ad.
              </p>
            </div>
            <span className="mt-3 text-[10px] text-slate-400 font-mono">
              Action: Observed by CTTS
            </span>
          </div>
        </div>
      </div>

      {/* Educational Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Article 1: First-Party vs. Third-Party */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-card">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
              <Layers className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-navy-950">
              First-Party vs. Third-Party Requests
            </h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed space-y-2">
            <span>
              A <strong>first-party request</strong> occurs when your browser loads resources directly from the site you intended to visit (e.g. styles or images from <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-[11px]">store.example.com</code>).
            </span>
            <br /><br />
            <span>
              A <strong>third-party request</strong> occurs when the website instructs your browser to silently contact an external domain (e.g. <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-[11px]">doubleclick.net</code> or <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-[11px]">analytics.twitter.com</code>). Because these external domains are embedded on thousands of distinct sites, they can build a profile of your browsing journey across the web.
            </span>
          </p>
        </div>

        {/* Article 2: Cookies & Cookie Syncing */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-card">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-200">
              <Cookie className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-navy-950">
              Cookies & Cookie Syncing
            </h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed space-y-2">
            <span>
              Cookies are small key-value strings stored by your browser. While first-party cookies keep you logged in, third-party cookies have historically been used to correlate visits across separate publishers.
            </span>
            <br /><br />
            <span>
              In <strong>cookie syncing</strong>, one advertising exchange shares its assigned cookie ID with another partner by redirecting a 1-pixel image. Modern browsers are phasing out unpartitioned third-party cookies, driving ad networks toward fingerprinting and first-party identity tokens.
            </span>
          </p>
        </div>

        {/* Article 3: Tracking Pixels & Web Beacons */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-card">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600 border border-purple-200">
              <Eye className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-navy-950">
              Tracking Pixels & Web Beacons
            </h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            A tracking pixel (or web beacon) is a transparent 1x1 GIF or WebP graphic embedded on a page or inside an email. When the browser requests this invisible image, it automatically reveals the user's IP address, device user-agent string, exact timestamp, and referrer URL to the tracking server.
          </p>
        </div>

        {/* Article 4: Advertising Identifiers & ID Graphs */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-card">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
              <Target className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-navy-950">
              Alternative Identifiers & Identity Graphs
            </h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            To adapt to cookie deprecation, advertisers created unified identity frameworks (like UID2.0) that hash your email address or phone number when you log into a site, turning it into a pseudonymous token shared among participating marketing partners across mobile apps and web browsers.
          </p>
        </div>
      </div>

      {/* Technical Limitations and Honesty Box */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-xs text-slate-700 space-y-3">
        <div className="flex items-center gap-2 text-navy-950 font-bold text-sm">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <span>What CTTS Can and Cannot Observe (Extension Scope Boundaries)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="bg-white p-3.5 rounded-lg border border-slate-200">
            <span className="font-bold text-emerald-700 block mb-1">
              ✓ What CTTS Observes & Protects:
            </span>
            <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px]">
              <li>Third-party HTTP/HTTPS request headers & initiator domains.</li>
              <li>Network requests sent to known tracker hostnames.</li>
              <li>Resource types (scripts, images, beacons, XMLHttpRequests).</li>
              <li>Local blocking via declarativeNetRequest dynamic rules.</li>
            </ul>
          </div>

          <div className="bg-white p-3.5 rounded-lg border border-slate-200">
            <span className="font-bold text-slate-700 block mb-1">
              ✗ What Cannot Be Observed (Browser Sandbox Limits):
            </span>
            <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px]">
              <li>Server-side tracking (e.g. Facebook Conversions API / CAPI sent server-to-server).</li>
              <li>Encrypted HTTPS payload contents or internal variable states.</li>
              <li>Off-platform data broker sales or private customer databases.</li>
              <li>Browser internal processes or Chrome restricted pages.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
