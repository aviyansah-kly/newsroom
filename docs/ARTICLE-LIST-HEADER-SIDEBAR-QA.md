# Article List — Shared Editor Header & Sidebar (QA)

**Reference:** Editor Workspace at `https://newsroom.avi-yansah.workers.dev/` and the canonical `scripts/newsroom-global-navigation.js` + `scripts/newsroom-shell.js` in this repository.

**Target:** `articles.html`. No migration to Vue is implied by this specific change.

## Checklist
- [x] Remove the duplicate page-owned header/sidebar markup; use the same shared renderer as Editor
- [x] Keep the KLY logo, Liputan6 site switcher and Content Production / Articles breadcrumb from the existing shared header
- [x] Use the exact Editor Dashboard group menu order, including Dashboard before Articles, and keep Articles active
- [x] Move the existing New Article dropdown into the shared header action slot without recreating its handlers
- [x] Retain sidebar search/collapse, account dropdown, theme controller, Article List search/filter and pagination code
- [x] Add scoped desktop/mobile and Light/Dark styling for the header New Article action
- [x] Previous single-column browser smoke passed (run 44231697635), but was INSUFFICIENT: it did not check the later unified two-column sidebar DOM
- [x] Replaced Article List legacy sidebar with the same latest Editor two-level Dashboard/Admin pattern: 66px rail, Dashboard/Admin tabs, 208px menu panel, total expanded width 274px, collapsed rail 66px
- [x] Kept existing Article List links, account footer, mobile drawer and shared CMS navigation data
- [ ] New browser parity smoke comparing actual Editor unified sidebar DOM, 274/66 dimensions, Dashboard/Admin switching and mobile; awaiting CI
- [ ] Visual review against the existing Editor at desktop and mobile, Light/Dark
- [ ] Confirm current production URL is serving the new commit
- [ ] Final Product Design approval and merge

## Regression reason
The Editor `index.html` runs a later `nr-unified-nav` initializer (after a delay), which replaces the formerly flat menu with a **two-column** Dashboard/Admin sidebar. The first Article List implementation only matched the old flat DOM and basic widths; that explained the visible mismatch even though its original test passed. New feature branch work implements the two-level layout and strengthens the test to wait for and compare `nr-unified-nav` in both pages.

## Safety
This is a **Draft PR** on `feature/articles-shared-editor-shell`. No main merge or Cloudflare production deployment is performed. Existing Article List data and interactions are not intentionally modified.
