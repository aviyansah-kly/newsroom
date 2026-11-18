# Article List — Tools UI/UX Refinement (18 November 2026)

## Existing issue / user screenshot
The Tools dropdown in `articles.html` was visually crowded, used nested fly-out menus, repeated on/off indicators, mixed technical controls with editorial actions, and could extend off the viewport. An earlier sequence of inline scripts rebuilt the menu multiple times, making state difficult to reason about.

## New feature branch implementation
The single-purpose `scripts/articles-tools-refinement.js` replaces the **legacy menu node only** after existing inline demo initialization. This is required because `scripts/article-editorial-refinement.js` attaches an old `stopImmediatePropagation` handler to the original popup, which would otherwise swallow new option clicks. The parent Tools trigger, article rows and CMS navigation remain unchanged. Layout/semantics are isolated in `styles/articles-tools-refinement.css`.

- [x] Compact header with article title and status.
- [x] Clear groups: Aksi Artikel, Penempatan, Pengaturan Lanjutan.
- [x] Distribution, Curated and Exclude as explicit on/off toggles; Curated and Exclude cannot both be active.
- [x] Inline two-choice selection for Headline (Homepage, TV) and Pin Artikel (Homepage, TV) — no nested flyout.
- [x] Monetisasi & Konten and Teknis use progressively disclosed controls.
- [x] Unpublish is separated as a destructive action with inline confirmation/cancel.
- [x] Existing row badges/chips reflect local demo selections.
- [x] Popup is viewport anchored, max-height constrained with its own scroll; switch changes preserve scroll and focus.
- [x] Button aria-pressed/aria-expanded, Escape close, status feedback and Light/Dark semantic CSS.
- [x] Unsupported external URL/tools show an honest preview message, not fake navigation.
- [ ] Browser smoke green for all controls including desktop 1440, mobile 390, Dark Mode, status and persistence.
- [ ] Product Design visual comparison / signoff, merge and production deployment.

## Explicit behavior boundaries
This is a **prototype UI only**, not the real CMS publishing service. Updates to distribution/placement/ads/status are temporary page-local state; no network request is sent. Unpublish confirmation changes the displayed row to Draft locally only. A real CMS implementation must add permissions, write API and rollback/error handling and server-derived selection state. Article List search/filter/pagination and the shared header/sidebar have not been changed by this Tools slice.

The existing Newsroom production worker is not modified until this Draft PR is reviewed.
