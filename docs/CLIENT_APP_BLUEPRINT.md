# Client App Blueprint — Pavement Performance Suite

This blueprint outlines how to evolve the current application into a polished, client-facing web app that lets prospects and customers: locate their property via satellite view, draw/auto-detect measurements, select desired services (including line-striping stencils), review a detailed quote, and submit their contact details to receive an estimate. It leverages the existing map, measurement, catalog, and estimating foundations already present in the repository and adds a streamlined, secure, and branded client experience.

## 1) Goals and Principles
- Deliver a frictionless, self-serve quoting experience optimized for church parking lots and small businesses.
- Provide highly accurate area and linear measurements via map tools and optional AI vision assists.
- Offer a curated service catalog (sealcoating, crackfill, patching, striping, ADA compliance, signage) including stencil choices.
- Generate clear, itemized estimates with professional PDF/email delivery, while routing leads to the internal pipeline.
- Maintain security and data privacy via Supabase RLS and minimal client auth (magic link or OTP optional).
- Keep costs reasonable and workflows simple for a 2-3 person operations team.

## 2) Client Personas and Key Journeys
- Facility Manager / Church Administrator: Needs a quick price range and options, with confidence in compliance (ADA, layout). Prefers email follow-up.
- Small Business Owner: Wants fast quote and scheduling availability. May request financing options.

Primary flow (no login required):
1. Search address -> center on satellite map.
2. Draw or auto-detect parking lot area; optionally measure line crack length.
3. Select services from catalog; choose line-striping stencil options and counts.
4. Provide contact details (name, email, phone), preferred schedule window.
5. Review generated estimate (range or itemized), accept provisional quote, submit.
6. Receive email with PDF; team notified; lead enters CRM/Jobs pipeline.

## 3) Major Features and Capabilities

### 3.1 Map and Measurement
- Google Maps satellite view with fallback to Mapbox (already supported by current app).
- Address search via geocoding; Street View toggle for visual confirmation.
- Drawing tools: polygon/rectangle for area; polyline for crack/edge linear feet.
- Auto-measurement AI assist (re-use `supabase/functions/analyze-asphalt`):
  - Let users upload a photo or capture a map snapshot ROI; compute area estimates, detect crack presence, prioritize maintenance.
- Save measurement context to `Mapmeasurements` for internal review.

### 3.2 Services and Catalog
- Curated, regional cost catalogs (already present: `cost_catalog`, `cost_items`).
- Service groups with helpful descriptions and images: sealcoat, crack fill, patching, pothole repair, line striping, ADA, signage, speed bumps, bollards.
- Intelligent defaults: From area and LF measurements, pre-fill quantities (leveraging `src/lib/estimateLogic.ts`).
- Upsell bundles: "Sealcoat + Crackfill + ADA Refresh" with variable discounting.

### 3.3 Stencils and Line-Striping
- Stencil catalog (new): arrows, stop bars, ADA symbols, numbers, letters, crosswalks, curb paint.
- Layout options: stall width (8–10 ft), aisle widths, van-accessible count, directional flow.
- Counts per stencil with visual hint overlays on the map.
- ADA rules helper: guardrails for minimum counts and dimensions, with warnings.

### 3.4 Estimate Generation and Delivery
- Itemized estimate lines derived from selected services and quantities.
- Add tax, overhead, profit, and travel automatically based on configuration.
- Generate PDF and email to client; store draft in `estimates` + `estimate_line_items`.
- Optional deposit request via payment link (Stripe) for accepted quotes.

### 3.5 Lead Intake and Handoff
- Create or update lead/client record with contact preferences and notes.
- Notify the team via email/SMS; create admin task to validate measurements and finalize price.
- Convert to job upon acceptance; push to scheduling.

### 3.6 Communication & Scheduling
- Preferred contact method (call/email) and time windows.
- Client-facing status page (magic link) to view quote, ask questions, or request changes.

### 3.7 Accessibility, Mobile, and PWA
- WCAG AA-compliant UI (eslint-plugin-jsx-a11y already included in tooling).
- Mobile-first responsive design; installable PWA for field or on-site quoting.

## 4) Information Architecture & Screens

Public client portal (new top-level route, e.g. `/quote`):
- Step 1: Address & Map
  - Search box, satellite view, Street View toggle.
  - Draw polygon/rectangle, polyline; or run AI assist on ROI.
- Step 2: Services
  - Toggles for sealcoat, crackfill, patching, striping; sub-options for materials.
  - Link to "Advanced" for ADA and signage choices.
- Step 3: Stencils & Layout
  - Select stencil items, counts, stall width, and ADA quantities.
  - Optional visual overlay preview.
- Step 4: Contact & Preferences
  - Name/email/phone; best time to contact; notes; budget range.
- Step 5: Review & Submit
  - Itemized estimate lines with ranges; taxes/fees; disclaimers.
  - Submit to receive email + on-screen confirmation.
- Success: Thank-you page; magic-link to view status later.

## 5) Data Model Extensions (Supabase)

New tables (proposed):
- `stencil_catalog` (id, name, code, unit, unit_cost, category, notes)
- `client_quote_sessions` (id, measurements_geojson, area_sqft, cracks_lf, selections_json, contact_name, email, phone, status, estimate_id)
- `stripe_layouts` (id, session_id, stall_width_in, ada_count, flow, items_json)

Policies (RLS):
- `client_quote_sessions`: insert/select by anon users restricted to their session token; admin can view all.
- `stencil_catalog`: read-only for public; write for admin roles.

Use existing:
- `cost_catalog`, `cost_items`, `estimates`, `estimate_line_items`, `Mapmeasurements`, `ai_asphalt_detections`, `clients`/`customers`.

## 6) Security & Privacy
- Public quote runs as anon with strict RLS; session token in JWT or signed cookie.
- No secrets in client; Supabase Edge Functions handle privileged operations.
- PII minimized; retention policy and deletion upon request.

## 7) Integrations
- Email: Supabase email or transactional provider (Resend/SendGrid) for quote delivery.
- SMS (optional): Twilio for team alerts or client updates.
- Payments (optional): Stripe Checkout for deposits; payment intent linked to estimate id.
- File Storage: Supabase Storage for uploaded photos or plan drawings.

## 8) Reuse of Existing Code
- Map: `src/components/map/MapContainer.tsx` with drawing tools (`src/hooks/useMapDrawing.ts`).
- Measurements: `src/hooks/useMapMeasurements.ts` and `Mapmeasurements` table.
- Catalog & Items: `src/components/catalog/CostCatalogModal.tsx` + `cost_*` tables.
- Estimating logic: `src/components/estimate/EstimateCalculatorModal.tsx` and `src/lib/estimateLogic.ts` for quantity math.
- AI assist: `supabase/functions/analyze-asphalt` for area and issue detection.
- PDF export: `src/lib/pdfExport` (already referenced), extend for client-facing branding.

## 9) Detailed Feature List (Exhaustive)

- Address search & satellite map with Street View toggle.
- Drawing tools: polygon/rectangle for area; polyline for cracks; circle for patch zones.
- Measurement units toggle (sqft/m², ft/m) with auto conversion.
- AI assist: analyze uploaded or map-snapped imagery to suggest area and crack LF.
- Service selections with clear descriptions, images, and tooltips.
- Material choices: sealcoat types, crackfill hot/cold pour, patching depth.
- Striping:
  - Stencil catalog selection and per-item counts (arrows, stop bars, ADA, numbers).
  - Stall width presets (8, 9, 10 ft) and ADA minimum calculator.
  - Optional layout preview overlay.
- Price configuration: region-based catalog pick; add travel miles; add procurement miles.
- Tax, overhead, and profit sliders (or hidden config with defaults).
- Contact step with validation and anti-spam.
- Review page with itemized cost, notes, terms, and assumptions.
- Quote submission to generate `estimates` with `estimate_line_items`; PDF rendered and emailed.
- Confirmation screen; magic link to view status; optional reschedule/clarification request.
- Admin notifications and dashboard task to validate and finalize pricing.
- Internationalization (scaffold) and accessibility checks.
- PWA install banner on mobile.

## 10) Implementation Plan and Files

- New client portal components under `src/components/client/`:
  - `QuoteWizard.tsx` (step controller)
  - `MapStep.tsx`, `ServicesStep.tsx`, `StencilsStep.tsx`, `ContactStep.tsx`, `ReviewStep.tsx`
  - `StencilPicker.tsx`, `LayoutPreview.tsx`
- New page route: `src/pages/Quote.tsx` (entry point), link from landing or top bar for public use.
- Hooks:
  - `useQuoteSession.ts` (persist session selections to Supabase)
  - `useStencils.ts` (load stencil catalog)
- Supabase migrations:
  - `stencil_catalog`, `client_quote_sessions`, `stripe_layouts`
  - RLS policies, indexes, and views for admin reporting
- Edge Functions (if needed):
  - `create-client-quote` (server-side validation, pricing guardrails)
  - `send-quote-email` (single responsibility email function)
- PDF: extend `pdfExport` with brand header, terms, and signature area.

## 11) Roadmap (Prioritized)

| Priority | Task Description | Task Type | Files to Modify/Create |
|---|---|---|---|
| P0 | Create public quote route and wizard shell | New-Feature | `src/pages/Quote.tsx`, `src/components/client/QuoteWizard.tsx` |
| P0 | Map step: search, draw, measure, AI assist | Max-Feature | `MapStep.tsx`, reuse `MapContainer`, `useMapDrawing` |
| P0 | Services step with catalog-backed items | Max-Feature | `ServicesStep.tsx`, reuse `cost_*`, `estimateLogic.ts` |
| P0 | Stencils: catalog + counts + ADA helper | New-Feature | `StencilsStep.tsx`, `StencilPicker.tsx`, migrations |
| P0 | Contact step and submit | New-Feature | `ContactStep.tsx`, `useQuoteSession.ts` |
| P0 | Review step + estimate creation + PDF/email | Max-Feature | `ReviewStep.tsx`, `pdfExport` extension, edge function |
| P1 | Client status page (magic link) | New-Feature | `src/pages/QuoteStatus.tsx`, policies |
| P1 | Admin notifications and lead pipeline hook | Refactor | `ClientsModal.tsx`, server functions |
| P1 | Payment link for deposits (Stripe) | New-Feature | Edge fn + UI button |
| P2 | Layout visual overlay and constraints | Max-Feature | `LayoutPreview.tsx` |
| P2 | i18n scaffolding and a11y audit fixes | Refactor | config + step components |
| P3 | PWA polish and offline cues | Optimization | manifest/service worker |

## 12) Analytics, Observability, and QA
- Track funnel events (start, map complete, services selected, submit) with privacy.
- Structured logs from edge functions; error notifications on failures.
- Unit tests for estimate math and ADA helper logic; E2E (Playwright) for the quote wizard.
- Load testing for edge functions and PDF generation.

## 13) Launch Plan
- Soft launch with a few churches; validate AI area estimates against manual measures.
- Iterate catalog pricing and defaults; refine ADA helper.
- Add Stripe deposits if adoption warrants.

---

This plan maximizes reuse of your existing map, measurement, catalog, estimating, and AI analysis code while adding a focused, polished client journey that captures high-quality leads and generates professional quotes with minimal back-and-forth.