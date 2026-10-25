# Cross-Platform Tracking Transparency System (CTTS)

> A modern, local-first Google Chrome extension (Manifest V3) that observes third-party tracking network requests across websites, categorizes known trackers by purpose, and enables granular, dynamic declarativeNetRequest blocking without external cloud dependencies.

---

## 🛡️ Table of Contents

1. [Project Overview](#-project-overview)
2. [Why CTTS? The Cross-Platform Ad Phenomenon](#-why-ctts-the-cross-platform-ad-phenomenon)
3. [Key Features](#-key-features)
4. [Technology Stack](#-technology-stack)
5. [Architecture & Folder Structure](#-architecture--folder-structure)
6. [How to Load the Extension into Google Chrome](#-how-to-load-the-extension-into-google-chrome)
7. [Using the Popup & Privacy Dashboard](#-using-the-popup--privacy-dashboard)
8. [Data Management & Privacy Commitments](#-data-management--privacy-commitments)
9. [Tracker Database & Attributions](#-tracker-database--attributions)
10. [Chrome Manifest V3 API Boundaries & Limitations](#-chrome-manifest-v3-api-boundaries--limitations)
11. [Testing & Verification](#-testing--verification)

---

## 🔍 Project Overview

When you search for a product on an e-commerce website and subsequently see targeted advertisements for that product on social media feeds, video platforms, or news outlets, multiple third-party tracking scripts, cookie synchronization calls, and conversion pixels are operating across your browsing sessions.

**CTTS** provides complete on-device transparency into this process. It monitors third-party network requests initiated by websites, compares target hostnames against a bundled database of reputable tracking entities, presents the telemetry in a privacy dashboard, and allows you to enforce network-level blocking via Chrome's native `declarativeNetRequest` engine.

---

## 💡 Why CTTS? The Cross-Platform Ad Phenomenon

### How It Works:
1. **Publisher Tagging:** When visiting an online store, third-party tags (e.g. Google DoubleClick, Criteo, Meta Pixel) record the specific product or category viewed.
2. **Audience Segments:** The ad network maps this activity to a pseudonymized identifier, placing you into a "recent intender" cohort.
3. **Real-Time Bidding (RTB):** When visiting a separate platform (news, blogs, social networks), ad exchanges conduct split-second auctions to serve you ads based on that profile.

### The Scientific Boundary:
> **Important Limitation:** Detecting a network request to an advertising network shows that code in your browser contacted that external endpoint. It does not prove that the first-party site directly sold your private data to another platform. CTTS strictly visualizes **observable network interactions** without making unsupported assumptions regarding undisclosed server-to-server data sharing.

---

## 🚀 Key Features

- **Real-Time Request Observation:** Intercepts outgoing requests using `chrome.webRequest` (filtered to third-party contexts).
- **First-Party vs. Third-Party Classification:** Evaluates base registrable domains (eTLD+1) to differentiate same-entity resources from cross-site trackers.
- **Categorization Engine:** Classifies trackers into 5 distinct categories:
  - 📢 *Advertising & Marketing*
  - 📊 *Site Analytics & Telemetry*
  - 👥 *Social Media Tracking*
  - 🎯 *Tracking Pixels & Measurement*
  - ⚙️ *Other Known Third-Party Tracking*
- **Dynamic declarativeNetRequest Blocking:** Directly compiles user preferences into Chrome's native network blocking rules, blocking requests before payloads transmit.
- **Per-Website Exceptions (Allowlist):** Quickly toggle exceptions for individual websites if blocking interferes with site functionality.
- **Privacy By Design:** 
  - Query strings, search keywords, and URL tokens are stripped prior to storage.
  - 100% on-device processing. No external telemetry, no remote servers, no API keys.
- **Bounded Local History:** Local storage retention periods (1, 3, 7, 14, or 30 days) and record limits (up to 2,500) automatically prune older records.
- **Comprehensive Educational Hub:** Explains cookies, cookie syncing, web beacons, and advertising ID graphs in plain language.

---

## 🛠️ Technology Stack

| Component | Technology | Rationale |
|---|---|---|
| **Standard** | Chrome Manifest V3 | Latest extension specification using Service Workers & Declarative Rules |
| **Language** | TypeScript 5.6 | Strict type-safety across message passing, storage, and rules |
| **Frontend** | React 18 & ReactDOM | Component-driven, responsive UI for popup and dashboard |
| **Bundler** | Vite 5.4 | Ultra-fast multi-entry extension build pipeline |
| **Styling** | Tailwind CSS 3.4 | Consistent cybersecurity aesthetic with accessible contrast |
| **Icons** | Lucide React | Clean, modern iconography |
| **Charts** | Recharts 2.15 | Client-side reactive charts for category distributions & top trackers |
| **Testing** | Vitest & JSDOM | Comprehensive unit test suite covering logic, storage, and rules |

---

## 📁 Architecture & Folder Structure

```
├── public/
│   ├── icons/             # 16, 32, 48, 128px PNG extension icons
│   └── manifest.json      # Chrome Manifest V3 configuration
├── src/
│   ├── background/
│   │   └── service-worker.ts      # Lifecycle, request observation & badge coordinator
│   ├── blocking/
│   │   ├── blocking-manager.ts    # declarativeNetRequest rule synchronization
│   │   └── blocking-rules.ts      # Dynamic rule compiler & exception filters
│   ├── components/
│   │   ├── ActivityTable.tsx      # Filterable, sortable live requests table
│   │   ├── EmptyState.tsx         # Reusable zero-state illustration cards
│   │   ├── Header.tsx             # Brand bar & live status indicator
│   │   ├── StatCard.tsx           # Metric cards with scope & badges
│   │   └── TrackerBadge.tsx       # Color-coded category badge
│   ├── dashboard/
│   │   ├── Dashboard.tsx          # Main multi-tab dashboard controller
│   │   ├── index.tsx              # Dashboard React mount point
│   │   └── pages/
│   │       ├── AboutTab.tsx           # Tech stack & attribution details
│   │       ├── EducationTab.tsx       # Educational guides on tracking mechanics
│   │       ├── InsightsTab.tsx        # Charts & top tracker distributions
│   │       ├── LiveActivityTab.tsx    # Live activity feed & inspection modal
│   │       ├── OverviewTab.tsx        # High-level KPIs & system status
│   │       ├── PrivacyControlsTab.tsx # Global toggle, categories & allowlist
│   │       └── WebsiteDetailsTab.tsx  # Per-site tracker breakdown & allowlist
│   ├── data/
│   │   └── trackers.json          # Curated starter database of known tracking domains
│   ├── messaging/
│   │   ├── message-handlers.ts    # Background message router & tab state evaluator
│   │   └── message-types.ts       # Type-safe messaging definitions
│   ├── popup/
│   │   ├── Popup.tsx              # Compact browser popup interface
│   │   └── index.tsx              # Popup React mount point
│   ├── storage/
│   │   ├── activity-store.ts      # Bounded history & metrics aggregation
│   │   └── settings-store.ts      # Persistent user settings & defaults
│   ├── styles/
│   │   └── index.css              # Tailwind CSS base styles & variables
│   ├── tracker/
│   │   ├── tracker-categories.ts  # Category definitions & color tokens
│   │   ├── tracker-database.ts    # Suffix-matching lookup engine
│   │   └── tracker-detector.ts    # Request inspector & URL sanitization
│   └── types/
│       └── index.ts               # Core TypeScript interface definitions
├── tests/
│   ├── activity-store.test.ts     # Storage retention & metric aggregation tests
│   ├── blocking-rules.test.ts     # Dynamic rule generation & exceptions tests
│   ├── classification.test.ts     # First-party vs third-party tests
│   ├── settings-store.test.ts     # Settings persistence & reset tests
│   ├── setup.ts                   # Chrome API mock environment
│   ├── tracker-detection.test.ts  # Tracker matching & URL sanitization tests
│   └── ui-components.test.tsx     # UI empty states & error boundary tests
├── dist/                          # Production build output (Load Unpacked folder)
├── package.json
├── tsconfig.json
├── vite.config.ts
└── vitest.config.ts
```

---

## 🔌 How to Load the Extension into Google Chrome

1. Ensure the production build is compiled (run `npm run build` if modifying source files).
2. Open **Google Chrome**.
3. In the address bar, navigate to:
   ```text
   chrome://extensions
   ```
4. Enable **Developer mode** using the toggle switch located in the upper-right corner.
5. Click the **Load unpacked** button in the top toolbar.
6. In the file picker dialog, select the `dist` directory inside this project:
   ```text
   C:\Users\Admin\Desktop\cneh_cbp\dist
   ```
7. The **Cross-Platform Tracking Transparency System (CTTS)** card will appear with its shield icon and version `1.0.0`.
8. Pin CTTS to your Chrome toolbar for instant access to the popup and privacy shield.

---

## 🖥️ Using the Popup & Privacy Dashboard

### 1. The Compact Popup
Clicking the CTTS shield icon on your toolbar opens the compact popup:
- **Active Protection Toggle:** Immediately enable or pause global tracker blocking.
- **Current Tab Summary:** Displays the website currently active in your browser.
- **Per-Site Allowlist Button:** Quickly allowlist the current website if you want to bypass blocking on that specific domain.
- **Trackers Observed:** Live counter of third-party tracker domains detected on the active webpage.
- **Open Full Dashboard:** Direct link to launch the full-page analytics console.

### 2. Full Privacy Dashboard
Accessible via the popup or Chrome's extension options:
- **Overview:** High-level metrics, system protection status, category distribution pie chart, and recent events.
- **Live Activity:** Real-time log of observed requests. Click any row to inspect sanitized request metadata.
- **Tracker Insights:** Recharts horizontal bar chart of the most active tracking entities, their publisher reach, and density.
- **Website Details:** Drill-down explorer showing every website visited, which trackers were observed on it, and individual exception toggles.
- **Privacy Controls:** 
  - Fine-grained category switches (Advertising, Analytics, Social, Pixels, Other).
  - Exception allowlist manager (add or remove domains).
  - Data retention duration and record limit sliders.
  - One-click *Clear Activity History* and *Reset Settings* buttons.
- **Learn About Tracking:** In-depth educational reference covering cross-platform retargeting and technical mechanisms.
- **About:** Full technology stack, architectural tenets, and tracker database attribution.

---

## 🔒 Data Management & Privacy Commitments

Privacy is embedded into the core architecture:
1. **Zero Remote Exfiltration:** CTTS makes **no** outbound requests to remote servers, analytics platforms, or external databases.
2. **URL Sanitization:** Any logged request has query strings (`?key=value`), search queries, and fragments (`#fragment`) completely stripped. Only the scheme, domain, and base path are stored.
3. **Bounded Storage:** Records are stored exclusively in `chrome.storage.local` and capped at user-defined maximum limits (default: 1,000 records / 7 days).
4. **Immediate Data Erasure:** The "Clear Activity History" button wipes all stored request data from the browser instantly.

---

## 📚 Tracker Database & Attributions

CTTS bundles a local starter database of major known tracking entities:
- **DuckDuckGo Tracker Radar:** Open-source behavioral tracker datasets and domain parent relationships.
- **EasyPrivacy / EasyList:** Community-curated filter rules for tracking endpoints.
- **Disconnect.me:** Categorized tracking entity definitions.

Updating the database: New tracking entries can be added to `src/data/trackers.json` or supplemented locally without requiring external cloud subscriptions.

---

## ⚠️ Chrome Manifest V3 API Boundaries & Limitations

CTTS operates strictly within Chrome Manifest V3 security boundaries:
1. **Network Layer Observation:** CTTS observes HTTP/HTTPS request headers and target domains via `chrome.webRequest` within permissions granted.
2. **Encrypted HTTPS Payload:** The extension does **not** read or decrypt encrypted POST payloads, form inputs, passwords, or session tokens.
3. **Server-Side Tracking (CAPI):** When a merchant transmits purchase data directly server-to-server (e.g. Meta Conversions API), this occurs outside the browser network flow and cannot be observed by any browser extension.
4. **Declarative Rule Limits:** Chrome enforces a quota on dynamic rules (`MAX_NUMBER_OF_DYNAMIC_RULES`). CTTS checks this limit to ensure stability.

---

## 🧪 Testing & Verification

Automated unit tests are written with **Vitest** and **@testing-library/react**.

Run the test suite:
```bash
npm test
```

### Verified Test Suites (32/32 tests passing):
- `tests/tracker-detection.test.ts`: Exact and subdomain matching, unknown domain handling, category mapping, URL sanitization.
- `tests/classification.test.ts`: eTLD+1 base domain extraction, first-party vs. third-party origin logic, multi-part TLD handling.
- `tests/blocking-rules.test.ts`: Dynamic rule compiler, third-party domainType enforcement, category filtering, allowlist exceptions.
- `tests/activity-store.test.ts`: Request recording, bounded retention pruning, statistics calculation, publisher reach aggregation.
- `tests/settings-store.test.ts`: Settings persistence, partial updates, allowlist toggles, default fallbacks.
- `tests/ui-components.test.tsx`: Empty state components, TrackerBadge rendering, StatCard formatting, Chrome API graceful error boundaries.

---

## 📦 Build Commands

```bash
# Install dependencies
npm install

# Run unit tests
npm test

# Build production Chrome extension
npm run build

# Type check
npm run typecheck
```
