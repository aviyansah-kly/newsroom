# Newsroom Design System Phase 3A — Shared TagInput (QA Branch Only)

**Branch:** `refactor/shared-taginput-phase3`  
**Status:** candidate for QA, NOT deployed or merged to production.

## Scope

- A single reusable selection and suggestion engine now lives at `scripts/components/tag-input-model.js`.
- The Editorial **Keywords** field uses the engine for item normalization, duplicate prevention, the five-item limit, click/Enter selection, deletion, and first-item SEO Keyword synchronization.
- The existing Tags field supplies the **same catalogue** and existing visual DOM/classes, but its original inline event handlers remain untouched. Replacing Tags' legacy controller is Phase 3B and requires dedicated baseline verification.
- The Content Initiative dropdown, source images, save/publish, Writer/Editor/Redpel/SEO roles, and Light/Dark component selectors were not modified.
- `.assetsignore` explicitly includes `scripts/components/`. The Cloudflare static-assets preflight guards against a missing reusable script.

## Reusable API

`NewsroomTagInputModel.create({initial, max, catalogue, onChange})` returns:

- `getItems()`: defensive item list
- `add(value)`: structured `{ok, reason, items}` result
- `remove(indexOrValue)`
- `set(nextItems)`, `replaceFirst(value)`
- `has(value)`, `suggestions(query, {count, showWithoutQuery})`
- `max` — immutable limit

The model is DOM-free and does not access credentials, the CMS backend, or external APIs. It is intentionally independent of light/dark styling.

## QA gates before considering merge

1. `node --test tests/tag-input-model.test.cjs`
2. `node tests/cloudflare-static-assets-preflight.cjs`
3. `node tests/tag-input-integration.cjs` and `tests/editorial-reusable-controls.cjs` on Chromium, Firefox, WebKit in **both** color modes.
4. Baseline computed-style parity `tests/design-system-parity.cjs` versus current main; zero differences and no new JS errors.
5. Wrangler static assets dry-run; specifically verify `scripts/components/tag-input-model.js` is included.
6. Verify final Cloudflare deployment on a preview/staging route before production merge. Live deployment was not accessible from the automated external lookup during this work.

## Limits

This is an **incremental reusable behavior extraction**, not a completed removal of all duplicate Tags code. Avoid editing the 1.18 MB inline Editor HTML in this phase; that file is protected by legacy contracts. The next phase migrates the inline Tags controller to this same engine with a separate, explicitly tested adapter.

## Rollback

No merge = no production change. Delete or close this branch if QA fails.
