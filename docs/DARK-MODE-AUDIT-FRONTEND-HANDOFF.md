# Newsroom — Dark Mode Audit & Frontend Handover

> **Audit date:** 14 October 2026  
> **Status:** **Implementation candidate on a feature branch; NOT production-ready / not merged**. Static verification is provided by CI; full visual, interaction, and cross-browser regression tests are a release gate.
> **Branch:** `feature/newsroom-dark-mode-v1`  
> **Approved Light Mode baseline:** commit `d2b17895078b93986621b2c7da4e62cfc0fc86bd` (includes Dark Mode specification; Editor last changed by `cf97995`).

## Executive finding

Dark Mode is feasible, **but not safe as a global color substitution**. Existing Editor is a large single-file prototype (`index.html`, 1,184,717 bytes) with many inline styles and behavior overrides. Shared navigation, account menu, right panel, AI suggestions, link dialog, and article list have separate style layers, many containing hard-coded light colors or `!important`. Simply overriding `:root` will leave white islands and inaccessible text.

We must preserve established UI behaviors from the October 13 baseline: unified left navigation, Title Case, text toolbar positioning, responsive right-panel collapse, validation/fix flows, Tags click-to-add, AI Suggestion, publication metadata, autosave, preview, and Review & Publish.

## Source map / ownership

| File | Current responsibility | Dark Mode treatment | Risk |
| --- | --- | --- | --- |
| `index.html` (~1.18 MB) | Authoritative Editor prototype, inline CSS/JS | **LOCKED** in feature branch; do not inject new markup or alter editor code | Critical: inline CSS and interaction regression |
| `styles/newsroom-design-system.css` | Shared Light Mode primitives | **LOCKED**, no edits | High: widespread light background defaults |
| `design-system/foundations/tokens.css` | Canonical DS tokens and semantic action palette | **LOCKED**; dark layer overrides semantic tokens only when active | High: action semantics |
| `styles/newsroom-global-navigation.css` | Shared header, site selector and standard-page sidebar | **LOCKED**; targeted dark-only overrides | High: hardcoded white and blue |
| `styles/newsroom-shell.css` | Existing SidebarAccount layout and popover | **LOCKED**; switch appears INSIDE existing account menu | Medium |
| `scripts/newsroom-shell.js` | Shared account control across pages | New opt-in theme CSS/controller loader only; existing account controller retained | Medium: script ordering / FOUC |
| `styles/newsroom-right-panel.css` | Editor panel collapse sizes, rail and toggle | **LOCKED**; dark colors scoped by theme stylesheet | Critical: CSS `!important` overrides |
| `scripts/newsroom-right-panel.js` | Panel collapse and responsive state | **LOCKED** | Critical |
| `styles/newsroom-ai-assist.css` | AI actions, generated field provenance and feedback | Keep purple AI-reviewed field highlights; darken only surfaces | High |
| `styles/newsroom-link-dialog.css` | Insert Link modal, AI results, selected link state | Dark-only portal styling; preserve modal behavior | High |
| `styles/article-editorial-refinement.css` | Articles list menus and field styles | Dark-only menu mapping; preserve logic | Medium |
| `articles.html` (~155 KB) | List, menus, filters | No editing; scoped theme and manual QA | High |
| `dashboard.html`, `tags.html` | Standard pages | No editing; reuse shared SidebarAccount theme loader | Medium |
| `styles/newsroom-dark-mode.css` | **NEW** dark theme tokens + conditional component styling | Must never style Light Mode components | New |
| `scripts/newsroom-appearance.js` | **NEW** accessible preference selector | Owns theme only, NOT editor state | New |
| `scripts/check_theme_contract.py` | **NEW** static guard | Enforces unchanged existing baseline and color contrast | New |

### Hardcoded color findings (reviewed source files)

Static review found approximately: **40 hexadecimal values** in `newsroom-global-navigation.css`, **17** in `newsroom-shell.css`, **17** in `newsroom-right-panel.css`, **24** in `newsroom-ai-assist.css`, and **123** in `newsroom-link-dialog.css`. These are raw occurrences, not unique tokens or confirmed bugs. The large `index.html` could not be extracted through the available GitHub file API due to its size; accordingly, a complete selector-level audit of its inline styles remains a **blocker** before merge.

### Important correction to earlier theme concept

The existing design system distinguishes **purple = AI-generated field/review provenance** and **blue = normal Work actions / focus / selection**. Keep that distinction in both themes. Do not recolor all AI components to blue merely because the button says AI Suggestion.

## Implementation architecture

- Default: **Light**. Preserve existing CSS and markup exactly. Dark styles MUST only activate under `html[data-theme="dark"]`.
- A shared `newsroom-shell.js` loader adds `styles/newsroom-dark-mode.css` and `scripts/newsroom-appearance.js`. The prototype controller appends **Tampilan** radio choices to the existing SidebarAccount menu: `Terang`, `Gelap`, `Ikuti Sistem`.
- Preference key: `localStorage['newsroom:appearance']`; allowed values `light`, `dark`, `system`. Unknown/missing => `light`. `system` listens to OS changes. Cross-tab `storage` listener synchronizes the current browser.
- Visual identity: original Liputan6 orange `#FF3300` for brand only; dark `button/commit` orange `#D92B00` with **white text**, hover `#C12700`, pressed `#B82500`. Work/focus blue `#93C5FD`; purple provenance is preserved.
- No font size, padding, width, height, position, offset, z-index or animation updates are allowed in existing components. New appearance menu controls may have their own dimensions.
- **Live frontend/article preview** must keep published-page appearance. Do not use `filter:invert()`, invert images, change logo colors, or theme the preview iframe. A CMS theme is not a visitor-site theme.

### Example component API for production Frontend

```ts
type AppearancePreference = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';
// Production account settings should provide an authoritative per-user preference.
interface AppearanceController {
  preference: AppearancePreference;
  resolvedTheme: ResolvedTheme;
  setPreference(preference: AppearancePreference): void;
}
```

CSS usage:

```css
/* Existing Light Mode stays exactly as is. */
html[data-theme="dark"] .button--commit {
  background: var(--nr-action-primary-bg);
  color: var(--nr-action-primary-on);
}
html[data-theme="dark"] .field--interactive:focus-visible {
  outline: 2px solid var(--nr-interactive);
}
```

**Production integration:** build a ThemeProvider (or equivalent) at AppShell level, keeping SidebarAccount a presentation component. Hydrate saved preference before first paint; render on server consistently or inject a tiny safe head bootstrap to prevent white flash. The current feature-branch shell loader is progressive enhancement for this HTML prototype, not a guaranteed flash-free SSR contract. Scope persisted preference to the authenticated user if CMS account API permits. Avoid changing form state or triggering autosave when preference changes.

## Acceptance criteria and handoff QA matrix

| Case | What Frontend/QA must verify | Acceptance |
| --- | --- | --- |
| 01. Baseline freeze | Compare Light Mode before/after at 1600, 1440, 1280, 1024, 768, 390 px | **Pixel-equivalent existing content and geometry**; only extra Appearance menu is new |
| 02. Startup/default | Fresh browser, no preference | Light Mode loads; zero Dark overrides |
| 03. Persistent preference | Set Gelap, reload, open Dashboard, Articles, Tags, Editor | Consistent Dark Mode everywhere |
| 04. System preference | Set Ikuti Sistem and emulate OS dark/light | Follows OS changes; manual choice takes priority |
| 05. Sidebar | Expanded/collapsed, mobile drawer, account popover | No clipping, duplicated user chip, menu jumps or layout shift |
| 06. Editor layout | Left and right sidebar collapsed/expanded, resize / zoom | Canvas width, sticky Text Block toolbar and spacing unchanged |
| 07. Draft writing | Type title, description and 2+ Content Blocks, format rich text | Cursor, selection, autosave, content height and WYSIWYG identical |
| 08. Editorial/SEO | Edit all fields, focus, select, tags suggestion and click-to-add, AI Suggestion | Same behavior and no white islands |
| 09. Review & Publish | Trigger validation warnings, Perbaiki focus/scroll, schedule and publish modal | Warning icons and labels visible, body scroll locked, no double border |
| 10. Publication Status | Published and Modified on single-row metadata where space allows | Dates readable, WIB not clipped, mobile non-overflow |
| 11. Insert Link / media | Open dialogs and menus, image picker, add hyperlink, selected state | All layers dark and legible; images unchanged |
| 12. AI provenance | AI-generated field, review marker, suggested tags, pending editor review | Purple review semantics preserved, no silent apply |
| 13. Article Preview | Open desktop and mobile article preview from Dark CMS | Preview reproduces live frontend Light styling, not CMS theme |
| 14. Connectivity | Offline, reconnect, failed save and saving state | Correct text/icons and distinction between local and server save |
| 15. Role permissions | Writer, Editor, Redpel, SEO | Same actions, permissions and available controls as baseline |
| 16. Keyboard/a11y | Tab, Shift+Tab, Enter/Space, arrow navigation, Escape and focus trap | Accessible theme radio group and dialogs, no focus loss |
| 17. Contrast | Body, labels, inputs, disabled, hover, error, success and focus | Normal text >=4.5:1, meaningful control boundaries >=3:1 (where applicable) |
| 18. Browser | Chrome, Edge, Firefox, Safari + responsive/mobile | No theme flash, white surfaces, overflow or reset |
| 19. Error handling | Storage denied, old/invalid preference, load failure | Safe Light fallback or graceful degradation; app remains usable |
| 20. Cross-session | Reload, navigate and open multiple tabs | Preference sticks; draft untouched |

### Locked design/UX contracts to review

- `docs/SHARED-HEADER-SIDEBAR-DESIGN-SYSTEM.md`
- `docs/LOCKED-TEXT-TOOLBAR-BASELINE.md`
- `docs/LOCKED-AI-ATTRIBUTES-BASELINE.md`
- `docs/ARTICLE-SETTINGS-UX-CONTRACT.md`
- `design-system/patterns/ACTION_COLOR_GUIDE.md`
- `docs/DARK-MODE-DESIGN-SYSTEM.md`

## Release gates

**Gate A — complete:** Source audit of shared files and additive design scope documented; feature branch separate from `main`.

**Gate B — CI static:** Run `python3 scripts/check_theme_contract.py` and `node --check scripts/newsroom-appearance.js`. Guard intentionally freezes the baseline Editor, global-navigation and DS source file blob SHAs. See `.github/workflows/dark-mode-contract.yml`.

**Gate C — open:** Full inline Editor CSS mapping and QA of `!important` conflicts, including modals and Editor custom publish button. This audit could not be completed with the available API access.

**Gate D — open:** Automated Playwright screenshot comparisons for both themes across all page/viewport combinations. Existing tests `tests/editor-sidebar-smoke.cjs` and Text Toolbar tests must pass on the feature branch. Add screenshot baseline, keyboard, modal behavior and form state E2E tests before merge.

**Gate E — open:** Manual editorial session: Writer, Editor, Redpel, SEO, plus keyboard and mobile.

**Gate F — open:** Merge to main only after Product + Frontend review and QA approval. Do not deploy this branch to the production Cloudflare Worker as an unreviewed visual change.

### Rollback

At runtime, changing appearance to Terang removes the Dark Mode selector. For code rollback, revert the one change in `scripts/newsroom-shell.js` that loads theme assets; removing the opt-in asset requests restores the exact Light Mode baseline. New CSS and JS are otherwise isolated and can remain unused.

## Current limitations — do NOT overclaim

This branch provides **a scoped implementation candidate, a preference controller, CI baseline guard, and a handover spec**. It does **not** prove that the entire Editor has been visually verified, because the large inline Editor file and live browser environment were not available in the current audit. No claim of full regression pass or production readiness is made until Gates C–E are satisfied.
