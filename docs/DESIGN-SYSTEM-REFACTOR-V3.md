# Newsroom Design System V3 — Safe Refactor (Phase 1–2)

**Status: isolated branch / NOT approved for production.**
**Branch:** `refactor/design-system-foundations-v3`.

## What changed

1. The inert first popup-manager copy inside `<script src="https://unpkg.com/lucide@latest">` was deleted. The **actual live manager** later in `index.html` remains untouched. Enabling both would have created duplicate event listeners.
2. Semantic component tokens formerly declared across eight separate `:root` / `html[data-theme="dark"]` blocks of `styles/newsroom-theme-components.css` are now defined in `styles/newsroom-theme-tokens.css`.
3. Redefined variables in the old blocks were reduced to **one final declaration per token per scope**. Final values are identical to the effective V2 values; no deliberate UI change.
4. `scripts/newsroom-shell.js` loads the token file **after** the legacy theme adapters and **before** `styles/newsroom-theme-components.css`.
5. `design-system/component-theme-registry.json` records token ownership and registers the shared icon-box and Editorial Team components. It is still a prototype-oriented registry, not a production component package.

## Layer ownership

| Layer | Owner | Contract |
| --- | --- | --- |
| Light foundation | `styles/newsroom-design-system.css` | Existing light defaults and global shell dimensions |
| Legacy Dark Mode | `styles/newsroom-dark-mode.css` | Existing older light/dark aliases; do not add new component values |
| Legacy Editor adapter | `styles/newsroom-dark-mode-editor.css` | Compatibility only while inline Editor rules are migrated |
| **Canonical component variables** | **`styles/newsroom-theme-tokens.css`** | One semantic property per scope; add tokens here first |
| Canonical visual rules | `styles/newsroom-theme-components.css` | Uses semantic tokens for components, avoids new literal colors |
| Shared UI shell | `styles/newsroom-shell.css`, `scripts/newsroom-shell.js` | Navigation/account behavior and theme loading |

**Typography:** `--nr-font-size-navigation: 13px` still belongs to the shared shell until the next, individually tested typography migration. The Design System registry explicitly names this owner to prevent guessing.

**Not refactored yet:** the ~1.18 MB Editor source, 59 inline style blocks, 86 inline script blocks, separate Tags/Keywords event handlers, popup legacy controllers, and all legacy `!important` selector rules. This is intentional: deleting them before baseline parity would carry a high risk of visual/behavioral regression.

## Acceptance gates (must all pass before merge)

1. `tests/design-system-parity.cjs`: compare `main` to this branch on Dashboard, Articles, Tags, Editor; Light/Dark; desktop/mobile; semantic token values, computed surface/text/border/radius/font metrics; **zero differences and zero new JavaScript errors**.
2. Existing Playwright component flows: Editorial Team, Add Content, Tags/Keywords, Dark Mode and modal checks remain green. Never change the existing Light Mode baseline.
3. Validate Cloudflare deployment/build settings independently. No production deploy from this branch without user review.
4. Any baseline difference must be explained, corrected, or explicitly approved **before** merge. Never silence failures by broadening color thresholds or deleting a test.
5. Any missing stylesheet/failed network request for `newsroom-theme-tokens.css` is a blocking error.

## Next safe phase (not included here)

- Extract one behavior component (e.g. TagInput) with a single state machine used by Tags and Keywords; preserve stable IDs and events at adaptation points.
- Extract Editor inline CSS/JS one component at a time with screenshots and functionality parity.
- Remove duplicate legacy selectors only after they are proved unused by the four-page regression suite.
- Provide a component playground with all input states, colors, typography, responsive sizes and both themes.

### Rollback

Because this phase is isolated, simply **do not merge** `refactor/design-system-foundations-v3`. `main` and Cloudflare production remain unchanged.
