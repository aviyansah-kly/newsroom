# Newsroom — Dark Mode Audit & Frontend Handover

> **Audit date:** 14 October 2026  
> **Status:** **Prototype theme implementation tested across Chromium, Firefox and WebKit; approved for merging to the Newsroom prototype main preview.** This does not mean production CMS integration or editorial UAT is complete.
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

Static review found approximately: **40 hexadecimal values** in `newsroom-global-navigation.css`, **17** in `newsroom-shell.css`, **17** in `newsroom-right-panel.css`, **24** in `newsroom-ai-assist.css`, and **123** in `newsroom-link-dialog.css`. These are raw occurrences, not unique tokens or confirmed bugs. The large `index.html` was inspected through the Git blob API. Its approximately 59 inline style blocks include roughly 7,587 `!important` declarations. Browser-computed dark surface and text-node contrast audits have now removed visible white islands and sub-AA sampled text in the inspected Editor viewport. Hidden, dynamic and role-specific states still warrant manual review.

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

**Gate C — completed for sampled visible Editor states:** Full index source inspected via Git blob API; computed styles audited on real browser DOM, including header, sidebar, canvas, inline fields, headline, tags, publication status, Review & Publish modal, AI controls and the shared button system. Browser CI fails on visible light islands or contrast failures in the sampled UI. Additional hidden states remain for manual UAT.

**Gate D — automated PASS:** Light Mode pixel + computed style/geometry regression against approved main baseline for Editor, Dashboard, Articles and Tags at 1440px and 390px; Dark Mode controller/system theme checks and Editor flow smoke including panel toggle, Review & Publish modal, title state, Insert Link; Chromium, Firefox and WebKit jobs passed on the same implementation commit. Screenshot comparisons accept up to 2% noise from dynamic metadata/remote fonts while exact style/layout assertions are enforced. Additional screenshot baselines for all dialog states remain valuable for ongoing QA.

**Gate E — open for production CMS:** Manual editorial UAT by Writer, Editor, Redpel and SEO, including device-level Safari/mobile, keyboard access and backend integration, must precede production use.

**Gate F — prototype preview ready:** Feature may be merged to the prototype `main` after passing the three CI check suites. Live/production CMS deployment and backend implementation still require IT review, role/UAT signoff and release controls.

### Rollback

At runtime, changing appearance to Terang removes the Dark Mode selector. For code rollback, revert the one change in `scripts/newsroom-shell.js` that loads theme assets; removing the opt-in asset requests restores the exact Light Mode baseline. New CSS and JS are otherwise isolated and can remain unused.

## Current limitations — do NOT overclaim

This work provides **a scoped prototype implementation, preference controller, baseline and three-engine browser tests, and an IT handover specification**. It does **not** certify every hidden modal, role-specific interface, Safari on a physical device, or real backend persistence. Product/IT must validate those separately before a real CMS production release.


## Post-release Dark Mode white-surface audit — October 14, 2026

A second, browser-computed audit found that the initial Dark Mode release had uncovered **large white surfaces beyond the Editor first viewport**, especially:
- **Editor:** Advanced Publishing summary/body, distribution and compliance flag lists, staff avatars, light-purple Tags chips, Category Tree search/popover, and dynamically injected Text Block content/card internals.
- **Standard pages:** Dashboard quick actions/open buttons; Articles List rows, tab backgrounds, menu controls, thumbnails, toolbar/footer; Tags table header, alternating rows, Edit buttons and status toggles.
- **Interaction-specific:** image/media library states, nested category and editorial popovers, image details and expanded Review & Publish sections still had legacy `#fff` or pale grey `!important` rules.

The remediation is **scoped exclusively to** `html[data-theme="dark"]` in `styles/newsroom-dark-mode.css` (Dashboard/Articles/Tags) and `styles/newsroom-dark-mode-editor.css` (Editor and overlays). The approved neutral graphite and soft separator tiers remain. Logo assets, real article previews, uploaded photos, rich-text content structure, font sizes, spacing and Light Mode are untouched.

**Testing:** `tests/dark-mode-surface-inventory.cjs` explores the article editor and app pages and records computed light surfaces. Existing `dark-mode-computed-audit.cjs` must pass text WCAG AA contrast and detect no visible white islands; `dark-mode-light-baseline.cjs` must still pass against the unchanged production prototype baseline. A page-local white box must be fixed by a component style override, **not** by inverting or globally darkening everything.

**Frontend handover:** migrate these page-level legacy hex colors to semantic `surface`, `surface-elevated`, `canvas`, `input`, `divider-subtle` and `status-soft` tokens. No new component hierarchy is needed, and no hardcoded inline CSS from the prototype should be copied into the actual CMS frontend without a token review.
