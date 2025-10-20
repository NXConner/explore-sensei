## Pavement Performance Suite — Features Inventory and Map Page Guide

### Project Overview
Pavement Performance Suite (branded in UI as "Asphalt Overwatch") is an end‑to‑end operations platform for asphalt paving, sealcoating, and line‑striping contractors. It combines a tactical, map‑centric command console with job management, estimating, scheduling, fleet, finance, and analytics—optimized for church parking lots and small‑to‑mid sized crews.

---

### Current Feature Inventory
- **Core map and HUD**
  - Google Maps primary provider with Mapbox automatic fallback
  - Custom themes: Division and Animus with HUD overlays (corner brackets, compass rose, scale bar, zoom indicator)
  - Drawing and measurement tools: marker, polyline, circle, rectangle, distance and area calculations
  - Save and render measurements (Supabase `Mapmeasurements`), export measurements
  - Geolocation “Locate Me”, traffic overlay, Street View toggle
  - Address geocoding and "fly to" search, routing (driving directions) with polyline overlay
  - Job site markers with clustering and info windows (status, progress, client)
  - Weather radar and rain overlays with configurable opacity and alert radius; alert info windows
  - Employee tracking layer (latest positions, summaries via Supabase)
  - Visibility/Enhance panel: brightness, contrast, sharpness, HDR, gamma, shadows, highlights with presets
  - AI surface area overlay injection and estimate handoff
- **Navigation shell**
  - TopBar with role‑aware module launcher and notifications
  - LeftSidebar: address search, drawing tools, active jobs, layer toggles, visibility panel toggle
  - RightSidebar: quick map controls (locate, traffic, Street View, AI detect, employee tracking, weather, draw/save/clear/export)
  - KPI ticker, job status legend, clock‑in status
- **Jobs and scheduling**
  - Jobs: create/edit via modal, status tracking and progress
  - Schedule calendar modal with planned work views
- **Estimating and catalog**
  - Estimate calculator modal
  - Cost catalog modal for price list management
  - Measurement export to support quoting
- **Clients and documents**
  - Client records modal
  - Documents, Contracts, Receipts modals
- **Time and reporting**
  - Time entry, Time tracking modal, clock‑in status HUD
  - Field reports modal and dashboard
- **Fleet and equipment**
  - Fleet management modal, vehicle tracker
  - Equipment modal and assignment form
- **Finance**
  - Invoicing modal and form, Finance dashboard modal, Payroll modal
- **Analytics**
  - Advanced analytics modal and role‑gated access
- **AI and automation**
  - AI assistant panel
  - AI asphalt detection workflow (modal, overlay viewer/editor), event bridge to estimating
  - Automation builder
- **Weather**
  - Weather radar modal, rain radar overlay, alert locations manager and hooks
- **Chat**
  - Team chat module/modal
- **Business, HR, Compliance, Veteran**
  - Business Management Hub, HR management, Employee compliance, Veteran business section
- **Gamification**
  - Achievements panel, leaderboard, quests, EOD summary; global toggle
- **Security and roles**
  - Role‑based feature gating (Viewer, Operator, Manager, Administrator, Super Administrator)
- **PWA and platform**
  - PWA manifest and service worker for offline caching; Capacitor Android project for mobile packaging
- **Observability and performance**
  - Monitoring/logging utilities, performance helpers
- **Testing and tooling**
  - Unit/integration tests (Vitest) and E2E tests (Playwright); load testing script (k6)

---

### Future Feature Roadmap (High‑Value Additions)
- **Church parking lot layout and quoting**
  - Advanced Parking Layout Designer: optimal stall layout, ADA compliance, lanes, bumpers, islands; before/after mockups
  - Automatic quantity takeoff from drawings (stripe counts, signage, wheel stops) and cost roll‑up
  - Scenario comparison (max spaces vs. ease of flow vs. minimal repaint)
  - Visual quote PDFs for church boards with annotated plan views and phased scheduling
- **AI vision and surveying**
  - Crack density and patch detection, pothole classification, sealcoat suitability scoring
  - Aerial/drone orthomosaic import and on‑map alignment; tiled imagery management
  - AR preview mode for line‑striping via mobile camera overlay
- **Routing and field ops**
  - Multi‑stop route optimization with time windows, crew/vehicle constraints, materials capacity, and live traffic
  - Geofenced job sites with auto clock‑in/out suggestions and arrival/departure alerts
  - Offline maps and data capture; background location tracking with privacy controls
- **Job execution and QA**
  - On‑map checklists and QA pins (pre‑pave, pave, post‑pave), photo requirements, sign‑off flows
  - Material usage tracking (S3 bucket of tickets), mix temperatures, and lot areas hydrated from measurements
- **Client portal and payments**
  - Client approvals, collaborative markup, scheduling windows, invoice payments (Stripe/QuickBooks)
  - Communications timeline and automated reminders tuned for church operations
- **Safety and compliance**
  - Hazard zones, near‑miss reporting on map, OSHA training records, and toolbox talks library
  - Virginia contractor compliance pack: required notices, document templates, retention policies
- **Analytics and forecasting**
  - Profitability by lot, crew, material; forecast workloads and crew utilization
  - SLA heatmaps (on‑time starts, overruns), win/loss by quote scenario
- **Data and integrations**
  - OpenAPI and SDK clients; import/export of GeoJSON, KML, Shapefiles; ESRI feature service connector
  - Secrets manager integration (Vault/Doppler/AWS SM); error tracking and tracing (Sentry/Otel)
- **Architecture and DevEx**
  - Feature flags for all major modules; plugin system for custom tools and layers
  - Multi‑tenant orgs, environments (dev/stage/prod), and fine‑grained permissions

---

### Map Page — Layout and Functionality
- **Screen layout**
  - Full‑screen map canvas with themed HUD: compass, scale bar, zoom indicator, corner brackets
  - TopBar (top): module launcher, notifications, analytics/chat/automation shortcuts, profile/role
  - LeftSidebar (left): address search; drawing tools; active jobs list; layer toggles; "Enhance" visibility panel toggle
  - RightSidebar (right): quick controls (locate, traffic, Street View, AI detect, employee tracking, weather); draw/save/clear/export
  - Overlays: KPI ticker; job status legend (bottom‑right); clock‑in status; measurement readout
- **Map providers and theming**
  - Google Maps primary with styles per theme (Division/Animus) and dev‑overlay detection; auto‑fallback to Mapbox Satellite Streets with globe projection
  - Visibility/Enhance panel applies live CSS filters to map container (brightness, contrast, etc.) with presets
- **Tools and interactions**
  - Drawing manager: marker, polyline, circle, rectangle; computes distance/area in real‑time
  - Save measurements to Supabase; render saved measurements with info windows; export measurements
  - Search and route: address geocoding with fly‑to and marker drop; driving directions with decoded polyline and fit‑bounds
  - Traffic layer toggle; Street View centered on current map center
  - Job site clustering with status‑colored markers and info windows
  - Weather radar and rain overlays with adjustable opacity and alert radius; click markers for details
  - Employee tracking layer shows latest positions and summaries; optional realtime subscribe
  - AI detection overlay: receipt of area sqft via event, renders circle overlay and info window; estimate workflow handoff
- **State, settings, and persistence**
  - UI settings stored in `localStorage` (`aos_settings`): theme, effects, API keys influence runtime provider selection
  - Map state exposed via imperative ref for sidebars (show traffic, radar, modes)
- **Error handling and fallback**
  - Auth failure and missing‑key detection for Google Maps; user toasts and automatic Mapbox fallback
  - Graceful "preview disabled" panel when no providers are available

---

### Primary User Workflows on the Map
1. Locate yourself, search an address, or click job in the left panel; the map centers and zooms.
2. Choose a drawing mode (measure, circle, rectangle, marker) to calculate distances/areas.
3. Save the measurement, export it, or feed results into estimating.
4. Toggle layers: traffic, Street View, employee tracking, weather radar.
5. Get directions between two points; the route is drawn and fit to view.
6. Receive AI detection results, visualize area overlay, and open the estimator when prompted.

---

### Notes and Considerations
- All map features are provider‑aware: some advanced tools are disabled in Mapbox fallback.
- Location privacy and battery impact should be documented for employee tracking; provide opt‑in and role‑based access.
- For church workflows, prioritize readable overlays, ADA compliance, and printable plan views in exports.

### Parcels Overlay
- Toggle via Right Sidebar “Parcels” button.
- Works on Google Maps (ImageMapType overlay) and Mapbox (raster layer).
- Configure tiles template via:
  - localStorage key saved by Settings UI: `aos_settings.providers.parcelsTilesTemplate`
  - or environment variable: `VITE_PARCELS_TILES_TEMPLATE`
- Supported placeholders: `{z}`, `{x}`, `{y}`
