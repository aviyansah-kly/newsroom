# Phase 3B — Shared Tags Migration Audit

Status: planning / isolated branch; no production code changes.

## Baseline

- Base: main merge commit `c2568d10bf7536f7daa1c8dd6aebb78d32a9b421`.
- Phase 3A introduced `scripts/components/tag-input-model.js` and an independent Keywords adapter in `scripts/newsroom-editorial-reusable.js`.
- Legacy Tags lives in the protected inline Editor `index.html`, with `renderTags`, `renderTagSuggestions`, and `addExistingTag` controlling the UI/state and `newsroom:add-existing-tag` as an integration event.
- The Phase 3A handler bridge in `scripts/newsroom-editorial-reusable.js` exists to accommodate the legacy suggestion click selector. Keep until a replacement is regression-tested.

## Contract and risk controls

1. Reuse the same `NewsroomTagInputModel` for Tags and Keywords but instantiate separate state. Do not share mutable item arrays.
2. Keep existing tag catalogue, initial values, 5-item limit, case-insensitive duplicate blocking, add/remove/search behavior, AI Suggestions and SEO interactions.
3. Prefer a thin adapter instead of changing the protected 1MB+ inline Editor. Do not swap IDs or markup needed by existing integrations.
4. Preserve the approved chip, focus/search, suggestion icon and Dark/Light Mode styles from Phase 3A.
5. Baseline with tests in Chromium, Firefox, and WebKit, plus component model tests; protect Light Mode and dark contrast contracts.
6. Stage via independent PR and Cloudflare preview; no merge/deploy to production until QA and user acceptance.

## Initial acceptance scenarios

- Click suggestion text or plus icon adds exactly one existing tag.
- Enter selects first suggestion; blank query does not add.
- A duplicate (including different case) is refused.
- At five selected tags, a sixth cannot be added; removing then adding works.
- Keywords changes never mutate Tags, and vice versa.
- AI Suggestions use the same add path and cannot bypass the limit.
- Saved/loaded article Tags and SEO field behavior stay unchanged.
- Identical chip and search visual hierarchy in Light/Dark across responsive sizes.

## Phase 3B next step

Build a minimal adapter behind an explicit feature gate; implement behavior and parity tests before switching the legacy controller.
