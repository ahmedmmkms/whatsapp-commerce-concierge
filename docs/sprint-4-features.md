# Sprint 4 Features — Web Frontend MVP

Date: 2025-09-24 (planned)
Owner: AMM

Scope
- Deliver a polished, lightweight web front end to complement WhatsApp flows.
- Pages: Home/Landing, Categories, Product List/Detail with media/specs.
- i18n: Arabic/English with RTL; locale-aware numbers/dates/currency.
- Client-side search and simple filters (category, price range).
- WhatsApp handoff deeplinks with prefilled product context.
- Basic analytics events: product views and handoff clicks.

Out of Scope
- Checkout and payments (covered in Sprint 5).
- Account system, wishlists, or advanced SEO.
- Complex server-side search; use client-side over existing `/products` API.

Pages/Routes (Next.js 14 App Router)
- `/` (Home): hero, featured categories/products, WhatsApp CTA.
- `/categories` (optional): grid of categories with counts.
- `/products` (List): search box + filters (category, price), 20/page.
- `/products/[id]` (Detail): media gallery, price, description, specs, WhatsApp CTA.
- `/handoff/whatsapp` (Utility): constructs and redirects to WA deeplink from query params.

Components (Shared)
- `Header` with locale toggle (AR/EN), category nav, cart link (stub).
- `Footer` with contact links, consent/privacy links.
- `ProductCard` (image, name, price, CTA), `Price` (locale/currency aware), `Badge`.
- `FilterBar` (search input, category select, price range slider), `Pagination`.
- `LangProvider` with `dir` support and `next-intl` or lightweight i18n util.

Tech/Config
- Framework: Next.js 14 (App Router) in `packages/web`.
- Styling: Tailwind (already present) + shadcn/ui (optional small subset).
- i18n: Minimal JSON dictionaries (`ar`, `en`); `dir=rtl` when AR.
- API base: `NEXT_PUBLIC_API_BASE_URL` (already used in current pages).
- Rewrites: Proxy `/api/*` to `NEXT_PUBLIC_API_URL` when set (already configured).

API Contracts Used (read-only)
- `GET /products?q=&category=&page=&pageSize=` — list with pagination.
- `GET /products/:id` — product details with media array.
- `GET /categories` — category list for filters (optional if available).

WhatsApp Handoff
- Deeplink format: `https://wa.me/<NUMBER>?text=<ENCODED_MSG>`.
- Product detail CTA builds message with product name, SKU, and link.
- Include `lang` and `productId` in message for server-side context if needed.
- Fallback: If `NUMBER` not configured, show disabled CTA with tooltip.

Analytics (minimal)
- `view_product` (id, name, price, currency, lang).
- `click_whatsapp_handoff` (productId, lang, placement, url).
- `view_list` (q, category, count).
- Transport: `window.dataLayer.push` stub; wire to GA later.

Performance Targets
- Route load P95 < 200ms on Vercel edge cache (static + ISR acceptable).
- LCP < 2.5s on 3G Fast; CLS < 0.1; TBT < 200ms.
- Optimize images via Next/Image where feasible; defer non-critical JS.

Accessibility & i18n
- AR/EN content parity; `dir` toggles correctly and persists per locale.
- Interactive controls have labels; focus order logical in RTL.
- Numbers/currency formatted with `Intl.NumberFormat`.

Testing
- Unit: price formatting, i18n util, filter logic.
- E2E (Playwright): list filters, product detail, deeplink construction, RTL switch.
- Lighthouse CI run for Home, List, Detail (thresholds: 90+ perf/accessibility/SEO).

Test Scripts (PowerShell)
- `scripts/sprint4-smoke.ps1` — open pages, validate key text, build deeplink.
- `scripts/sprint4/test-rtl.ps1` — toggles AR and checks `dir=rtl` and layout.
- `scripts/sprint4/test-analytics.ps1` — spies on `dataLayer.push` (mock page).

Examples
- `pwsh scripts/sprint4-smoke.ps1 -WebBase https://<web>.vercel.app -ApiBase https://<api>.vercel.app`
- `pwsh scripts/sprint4/test-rtl.ps1 -WebBase http://localhost:3000`

Env
- `NEXT_PUBLIC_API_BASE_URL` — API base (e.g., https://api.example.com).
- `NEXT_PUBLIC_RTL` — `1` to force RTL during QA.
- `NEXT_PUBLIC_WA_NUMBER` — WhatsApp number for deeplinks (e.g., 9715XXXXXXXX).

Acceptance Criteria
- Home, Products list, and Product detail implemented with AR/EN toggle and correct `dir` behavior.
- List supports client-side search and category/price filters; paginates 20/page.
- Product detail shows media, price, description; builds working WA deeplink when `NEXT_PUBLIC_WA_NUMBER` set.
- `view_product` and `click_whatsapp_handoff` events fire with expected payloads.
- Lighthouse scores ≥90 on perf/accessibility/SEO for Home, List, Detail.

Risks/Mitigations
- Catalog/data sparsity — add placeholders and robust fallbacks when fields missing.
- i18n regressions — snapshot small text fragments per locale; manual RTL review.
- Web/API CORS mismatch — confirm proxy rewrite and allowed origins.

Changelog Additions (Planned)
- Added AR/EN i18n dictionaries and RTL support in `packages/web`.
- Implemented `/handoff/whatsapp` deeplink utility and CTAs on product cards/detail.
- Added client-side filters and analytics event stubs.

Notes
- Current repo already includes minimal `/` and `/products` pages using `NEXT_PUBLIC_API_BASE_URL`. This sprint expands them and adds i18n/RTL, filters, analytics, and deeplinks.

