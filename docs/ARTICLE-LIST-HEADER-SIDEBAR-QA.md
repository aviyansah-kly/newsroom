# Article List — Shared Editor Header & Sidebar (QA)

**Reference:** Editor Workspace at `https://newsroom.avi-yansah.workers.dev/` and the canonical `scripts/newsroom-global-navigation.js` + `scripts/newsroom-shell.js` in this repository.

**Target:** `articles.html`. No migration to Vue is implied by this specific change.

## Checklist
- [x] Remove the duplicate page-owned header/sidebar markup; use the same shared renderer as Editor
- [x] Keep the KLY logo, Liputan6 site switcher and Content Production / Articles breadcrumb from the existing shared header
- [x] Use the exact Editor menu order, including Dashboard before Articles, and keep Articles active
- [x] Move the existing New Article dropdown into the shared header action slot without recreating its handlers
- [x] Retain sidebar search/collapse, account dropdown, theme controller, Article List search/filter and pagination code
- [x] Add scoped desktop/mobile and Light/Dark styling for the header New Article action
- [x] Chromium browser parity passed — GitHub Actions run 44231697635 (Editor menu order, 68/248/64 geometry, dropdown, mobile)
- [ ] Visual review against the existing Editor at desktop and mobile, Light/Dark
- [ ] Confirm current production URL is serving the new commit
- [ ] Final Product Design approval and merge

## Safety
This is a **Draft PR** on `feature/articles-shared-editor-shell`. No main merge or Cloudflare production deployment is performed. Existing Article List data and interactions are not intentionally modified.
