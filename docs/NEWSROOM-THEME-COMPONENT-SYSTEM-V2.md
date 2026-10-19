# Newsroom — Component Theme System V2

**Status:** Implemented as an opt-in prototype Dark Mode component layer; production frontend adaptation and role-specific editorial UAT remain separate.

## Why V2 is needed

The prototype combines a ~1.18 MB inline Editor source with 59 inline style blocks and hundreds of high-specificity `!important` rules. Early Dark Mode fixes targeted visible white boxes one at a time and did not cover all states. Four QA screenshots surfaced residual white form/card surfaces, overly bright passive separators, low-contrast OFF switches and an almost-white Schedule Publish form.

V2 does **not** create a new editor or refactor the existing Light Mode layout. It defines **a canonical, component-owned semantic color layer** that is loaded after legacy theme adapters. Changes to a palette should be made in one token definition, then automatically audited across registered components.

## Source of truth / cascade order

1. `styles/newsroom-design-system.css` (existing Light Mode, unchanged).
2. `styles/newsroom-dark-mode.css` (existing base Dark Mode).
3. `styles/newsroom-dark-mode-editor.css` (compatibility adapter for legacy inline Editor CSS).
4. **`styles/newsroom-theme-components.css`** (V2 canonical component layer; last loaded by `scripts/newsroom-shell.js`).
5. `design-system/component-theme-registry.json` (component ownership + required QA).
6. `tests/dark-mode-component-contract.cjs` (rendered component contract; tests across Chromium, Firefox, WebKit).

The previous adapters remain to avoid breaking existing UI; **they are legacy compatibility layers** rather than the place for future palette decisions. Future frontend should migrate component styles to direct semantic tokens and retire old `!important` rules incrementally, with visual baseline tests at each step.

## Canonical Dark Mode palette

| Role | Token | Color | Application |
| --- | --- | --- | --- |
| Global canvas | `--nr-ui-app` | `#17191D` | App background |
| Navigation | `--nr-ui-navigation` | `#1C2025` | Sidebar/header |
| Panel | `--nr-ui-panel` | `#22262C` | Editorial, SEO and modal panels |
| Article canvas | `--nr-ui-canvas` | `#272C32` | Writing blocks, editorial surface |
| Raised / input | `--nr-ui-raised` | `#2B3037` | Fields and inner form surfaces |
| Neutral control | `--nr-ui-control` | `#303740` | Secondary button and selected control body |
| Passive separator | `--nr-ui-divider` | `#343A42` | Quiet internal 1px strokes |
| Section divider | `--nr-ui-section-divider` | `#3A414A` | Larger section separation |
| Card perimeter | `--nr-ui-card-border` | `#3C434D` | Structural cards |
| Input border | `--nr-ui-input-border` | `#718096` | Accessible actionable input field |
| Text | `--nr-ui-text` | `#E8EBEF` | Main text |
| Secondary | `--nr-ui-secondary` | `#BBC3CD` | Labels/helper descriptions |
| Muted | `--nr-ui-muted` | `#A4AEBB` | Low priority metadata |
| Focus, Work | `--nr-ui-focus` | `#93C5FD` | Focus and action selection |
| Commit CTA | `--nr-action-primary-bg` | `#D92B00` | Review/Publish, white text |
| AI provenance | `--nr-ui-purple-bg` | `#2D2545` | Reviewed/generated metadata (not Work blue) |
| Success soft | `--nr-ui-success-bg` | `#24372B` | SEO readiness and completed schedule |
| Warning soft | `--nr-ui-warning-bg` | `#3D3022` | Validation issues |
| Toggle OFF track | `--nr-ui-toggle-off-track` | `#46566C` | Inactive track (separate from page surface) |
| Toggle OFF border | `--nr-ui-toggle-off-border` | `#8494A9` | Strong OFF outline |
| Toggle ON track | `--nr-ui-toggle-on-track` | `#D92B00` | Active state |
| Toggle thumb | `--nr-ui-toggle-thumb` | `#F8FAFC` | Consistent white thumb against both tracks |

### Toggle specifications

The existing `.switch input + .switch-track` remains the sole control and retains its original **38 × 22px track, 16px thumb, position and animation**. OFF track is dark slate `#46566C`, *outlined* in `#8494A9`; thumb is off-white. ON uses darker Liputan6 orange `#D92B00`, off-white thumb; keyboard `:focus-visible` must use blue `#93C5FD`. Disabled state can be lower-emphasis but retains checkbox semantics. **Never convey ON/OFF using color alone**; switches are accompanied by descriptive row labels and the thumb's distinct left/right position.

### High-risk components and expected surface stack

| Component | Parent | Child | Input | Passive border |
| --- | --- | --- | --- | --- |
| Article / Text Block | Canvas `#272C32` | Toolbar `#2B3037` | Editor `#272C32` | `#343A42` |
| Video / Embed | Block `#272C32` | Empty preview `#2B3037` | URL/title field `#2B3037` | `#3C434D` |
| Klasemen | Block `#272C32` | Widget `#2B3037` | League select `#2B3037` | `#3C434D` |
| SEO | Panel `#22262C` | Custom Slug `#272C32` | `#2B3037` | `#343A42` |
| SEO Readiness | Success soft `#24372B` | Green readable text | — | `#3C434D` |
| Review & Publish | Modal `#22262C` | Schedule `#272C32` | Date/time `#2B3037` | `#343A42` |
| Category / Media Popover | Panel `#22262C` | Interactive `#303740` | `#2B3037` | `#3C434D` |

## Component coverage and QA gates

Registered source: `design-system/component-theme-registry.json`. Each component specifies `id`, `owner`, `selectors`, `tokenRoles`, and `qa`. To create/change a component, Frontend MUST:

1. Identify component owner and verify equivalent Light Mode.
2. Choose tokens from the semantic palette instead of hardcoding `#FFFFFF`, `#F8FAFC` or dark hex into nested selectors.
3. Register its selectors in `component-theme-registry.json`.
4. Add a real or synthetic interactive state in `tests/dark-mode-component-contract.cjs` (dropdown open, schedule expand, toggle OFF/ON, new block).
5. Run `python3 scripts/check_theme_contract.py`, browser smoke in Chromium/Firefox/WebKit, and exact Light Mode computed-style/geometry + pixel comparison against baseline `main`.
6. Manually verify Editor, SEO, Image Picker, custom validation modals, Safari on real devices, and Writer/Editor/Redpel/SEO permissions before production rollout.

**Do not recolor** genuine image/media/video pixels, published-article website previews, original logo assets, warning/error semantics or AI provenance. Do not mutate content, draft, autosave, scroll, or permissions during theme switching.

## Figma handover structure

Use the current Newsroom DS file. Add to Foundations → Color → *Dark / Semantic*; document tokens above and alias tokens to component variants. Under Components, maintain **Switch (Off, On, Focus, Disabled)**, **Field (Default, Hover, Focus, Invalid)**, **Card (Canvas/Panel/Raised)**, **Review & Publish** (default/validation/scheduled), **SEO Readiness**, **Tags**, **Content Block (Text, Video, Image, Embed, Klasemen, Page Break)**, and **Popover** (closed/open). Each should document Light/Dark variants **without altering geometry**. Include before/after QA screenshots and contrast checks.

## Release policy

Merge to Newsroom prototype main only after CI and cross-browser tests are green. The CMS production engineering team should implement the tokens in its actual component architecture (e.g. ThemeProvider/semantic CSS vars), not copy the prototype's large historical collection of inline `!important` CSS overrides. Real editorial sign-off/UAT remains a separate gate.


## V2.1 — real live rendering verification (14 October 2026)

A live audit against `https://newsroom.avi-yansah.workers.dev/` confirmed that **all HTML/JS/CSS files matched GitHub main** byte-for-byte, yet several SEO subcomponents remained white. These were not captured by the previous synthetic-only Playwright tests. The exact omitted components were:

- SEO Assistant full-width container;
- `Editable` badge and system caption;
- Custom Slug input wrapper, status and URL preview;
- Custom Slug `lowercase` / `numbers` / `hyphens` guideline chips;
- pale separators in navigation and AI dock.

**Resolved by token-mapped component rules** in `styles/newsroom-theme-components.css`, without changing Light Mode, component dimensions or editor behavior. Dark Mode tests now activate the **actual SEO tab**, inspect real article page markup and fail on white surfaces. Do not declare a change live merely because the local browser suite passes.

**Release verification commands:**

- `node tests/dark-mode-seo-surface.cjs`: validates SEO components on local candidate before merge (Chromium, Firefox and WebKit).
- `python3 scripts/verify-live-deployment.py --strict`: compares the Worker URL to local checked-out GitHub assets.
- `node tests/live-dark-mode-audit.cjs`: opens the **public** Cloudflare URL, checks SEO, Review & Publish, expanded Schedule Publishing and dynamic media fixture, and detects pale UI backgrounds.
- Actions `verify-newsroom-live.yml` and `newsroom-live-dark-qa.yml`: report-only before PR merge; strict on main push with deployment retries.

A GitHub merge and a passing local test are not proof of a successful Cloudflare release. Both the **live asset match** and the **live rendered UI audit** are required, in that order.


## V2.2 — Editor Workspace Dark Mode consistency & handover (14 October 2026)

**Scope:** This is a token-only color pass on *the existing UI*, not a redesign. It is deliberately limited to `html[data-theme="dark"]` and does not change positions, component sizes, user copy, AI behavior, article data, role permissions or media appearance.

### Symptoms audited on the user's Editor Workspace screenshot

- Strong white toolbar behind Text Block formatting controls despite a graphite article canvas.
- Black/light-theme placeholder labels or white icon backgrounds in dynamically generated Image, Video, Embed, Klasemen and Page Break blocks.
- Thin rules from legacy Light CSS rendering too bright in Text Block headers/footers and format toolbars.
- Editorial/SEO tabs: active near-black surface and inactive SEO label with only **3.19:1** text contrast, below 4.5:1.
- Bright violet/lavender outline on some AI suggestion action buttons.

### Semantic source of truth

| Purpose | CSS token | Value / inherited token | Required behavior |
|---|---|---|---|
| App background | `--nr-ui-app` | `#17191D` | Global shell only |
| Writing canvas | `--nr-ui-canvas` | `#272C32` | Editorial text and block body |
| Neutral control surface | `--nr-ui-control` | `#303740` | Secondary action and icon tiles |
| Elevated toolbar | `--nr-ui-raised` | `#2B3037` | Formatting actions & preview scaffolds |
| Passive divider | `--nr-ui-decorative-divider` | `var(--nr-ui-divider)` → `#343A42` | No Light Mode white lines |
| Content text | `--nr-ui-text` | `#E8EBEF` | Main labels, actual content |
| Secondary / idle action | `--nr-ui-secondary` | `#BBC3CD` | Field helpers, neutral toolbar icons |
| Active tab background | `--nr-ui-tab-active-bg` | `#27435C` | Selected Editorial/SEO tab |
| Active tab text | `--nr-ui-tab-active-text` | `#E8F2FF` | High contrast selected tab |
| Inactive tab text | `--nr-ui-tab-inactive-text` | `var(--nr-ui-secondary)` | At least 4.5:1 against panel |
| Selected indicator | `--nr-ui-tab-active-indicator` | `#93C5FD` | 2px inside lower edge, no geometry shift |
| AI action border | `--nr-ui-purple-border` | `#59497C` | Purple semantic state, no pale lavender outline |

**Do not** use light-theme hexadecimal values directly in React/Vue/frontend components or add duplicated overrides to inline HTML. Frontend implementation should reference semantic token variables and migrate existing overrides gradually. The registry `design-system/component-theme-registry.json` now owns component/QA mapping for `editor-right-tabs`, `richtext-block`, `media-block` and `editor-block-actions`.

### Component-state matrix

| Component | Default | Hover | Active/focus | Empty/disabled |
|---|---|---|---|---|
| Editorial/SEO tabs | Transparent with readable secondary text | `--nr-ui-hover` | Active graphite-blue with clear underline; keyboard outline | N/A |
| Text formatting toolbar | Elevated graphite, not white | Toolbar button surface hover | `--nr-ui-selection` for pressed formatting | Idle icons stay readable |
| Image / Video / Embed | Neutral media panel, legible placeholder | Neutral button hover | Existing blue/orange primary CTA preserved | Placeholder copy uses secondary token |
| Klasemen / Page Break | Graphite details and soft separator | Same token roles | Existing selection behavior unchanged | Empty states remain legible |
| Add Content icons | Neutral dark icon tile | Hover surface | Existing add action unchanged | No white icon tile |
| AI suggestion borders | Muted purple outline | Existing interaction | AI provenance semantics preserved | No distracting bright passive line |

### Safe handover / regression gates

1. Confirm **source/style precedence**: `newsroom-design-system.css` (Light) → `newsroom-dark-mode.css` → `newsroom-dark-mode-editor.css` (legacy adapter) → `newsroom-theme-components.css` (canonical and final).
2. Use `node tests/dark-mode-expanded-editor-contract.cjs` in Chromium, Firefox and WebKit. This mounts all six block types without changing stored articles; validates tabs (WCAG AA contrast), toolbar, neutral buttons and soft separators.
3. Run existing suites `dark-mode-computed-audit.cjs`, `dark-mode-component-contract.cjs`, `dark-mode-divider-comfort.cjs`, `dark-mode-editor-flow.cjs`, `dark-mode-seo-surface.cjs`; no loss of field workflows, Review & Publish or SEO panels.
4. Verify **Light Mode** against approved baseline at desktop/mobile using `dark-mode-light-baseline.cjs` or equivalent pixel/geometry comparison.
5. After merge, run `python3 scripts/verify-live-deployment.py --strict` and `node tests/live-dark-mode-audit.cjs` against the real Cloudflare URL. A local pass is not proof that Workers has updated.
6. Test any future new component in *default, hover, active, disabled, error, empty and overlay states*; add selectors and QA IDs to the component registry rather than hardcoding a new palette.

**Protected UI:** original logos/images, article desktop/mobile previews, autosave & publishing, content block layout, navigation IA, Light Mode, roles (Writer/Editor/Redpel/SEO), orange primary publish action (`#D92B00` in the existing prototype) are unchanged.


## V2.3 — Editorial legibility refinements (14 October 2026)

**Implemented as dark-mode-only semantic CSS overrides**, without moving/resizing blocks, altering article text/data, changing brand colors or touching the Light Mode cascade. Based on the editor screenshots showing low-visibility block boundaries, dark blue media titles, overly bright horizontal rules and an unwanted selected-tab underline.

### Final hierarchy and ownership

| Component role | Token | Value | Usage |
|---|---|---|---|
| Passive section divider | `--nr-ui-decorative-divider` | `#30363E` | Editor section boundary, block header/footer, page break, toolbar group separator |
| Card / preview outline | `--nr-ui-card-border` | `#465260` | Interactive/content block card edges, media placeholder borders |
| Main Editor Canvas | `--nr-ui-canvas` | `#272C32` | Retained original writing canvas |
| Block surface | `--nr-ui-block-surface` | `#2C333B` | Raised content card outer background, distinguishable from canvas |
| Block body | `--nr-ui-block-body` | `#272C32` | Content editor body; unchanged content appearance |
| Block header/footer | `--nr-ui-block-header` | `#303740` | Card header and footer, neutral |
| Block title | `--nr-ui-block-title` | `#E1E8F1` | Text/Video/Image/Embed/Klasemen/Page Break headings; SEO field titles |
| Block metadata/help | `--nr-ui-block-meta` | `#B9C4D0` | Inline descriptions, helper text, status |
| Input placeholder | `--nr-ui-block-placeholder` | `#AEB9C6` | Media/Embed input placeholder |
| Tab active | `--nr-ui-tab-active-bg` | `#304862` | Solid selected Editorial/SEO box |
| Tab active text | `--nr-ui-tab-active-text` | `#F3F7FC` | Selected tab label |
| Tab inactive text | `--nr-ui-tab-inactive-text` | `#C2CBD6` | Unselected tab label |

### Behavior rules

- A selected Editorial/SEO tab has a filled surface **without any underline** or default shadow. Its focus-visible outline remains for keyboard users only.
- Structural separators are intentionally lower contrast than card boundaries. **Do not reuse input/interactive borders** for decorative dividers.
- Text block and media placeholder titles must never inherit legacy dark-blue/Light Mode placeholder colors. Use `blockTitle` for headings and `blockMeta` for helper text.
- Input border `--nr-ui-input-border` and action colors remain unchanged; the blue working action and orange `Review & Publish` continue using their existing semantic tokens.
- Do not add HTML classes solely to theme content; newly created blocks follow the same scoped component CSS automatically.
- If a new media/SEO feature is added, register its selectors, token roles and states in `design-system/component-theme-registry.json`; use `styles/newsroom-theme-components.css` as last-loaded source of truth.

### Release QA

- Run `tests/dark-mode-editor-contrast-v23.cjs` across Chromium/Firefox/WebKit. Asserts a selected tab without underline, contrast-oriented titles, differentiated card surface, passive separators and media placeholders.
- Run `tests/dark-mode-expanded-editor-contract.cjs` and `tests/dark-mode-divider-comfort.cjs` for all dynamic blocks and editing flows.
- Verify Light Mode pixel/geometry parity against main at desktop and mobile with `tests/dark-mode-light-baseline.cjs`.
- **After merge:** compare Cloudflare live hashes to GitHub main (`scripts/verify-live-deployment.py --strict`) and render-check SEO and editor states (`tests/live-dark-mode-audit.cjs`). Do not claim deployed before these complete.

**Protected UI:** Left/Right navigation dimensions, editor text/article data, role-based controls, article actual preview, light-mode appearance, logos and source media pixels, Review & Publish function, and all content block interactions.


## V2.4 screenshot-driven Editor consistency (14 October 2026)

**Scope:** only `html[data-theme="dark"]`; no Light Mode layout or content behavior changes.

- **Center separator:** passive border uses `--nr-ui-decorative-divider`, not white or an actionable input-border color.
- **Outline hierarchy:** status pill group, preview controls and sidebar account must have a single structural frame, not nested strokes. Keyboard `:focus-visible` remains accessible.
- **Tambah Content:** each of the six action tiles (Text, Video, Image, Embed, Klasemen, Page Break) has its **own** 1px `--nr-ui-card-border`, neutral raised fill, blue hover/focus; the outer group is a quiet surface without a second visible enclosing stroke.
- **Text editing toolbar:** primary `#classicToolbar`, `.newsroom-primary-stuck` and later `.v46-fixed` instances use `--nr-ui-raised` and `--nr-ui-decorative-divider`. CSS must match legacy `#classicToolbar` specificity; never move its sticky top or alter cursor/formatting logic.
- **Content Block icon:** actual generated markup is `.alt-content-card-title .icon` (not the older `.alt-card-type-icon` convention); semantic control surface and stroke are mandatory.
- **Review & Publish / Perbaiki:** Short Desc previously had no mapped label in the V70 JS handler. `scripts/newsroom-dark-review-focus.js` now coordinates the clicked issue with its real editable field and applies a persistent amber `.nr-review-focus-target` outline until the editor edits that field. It does not modify draft content, validation rules or publication state.

**Regression:** `tests/dark-mode-editor-ux-v24.cjs` tests real Add Content behavior, Text Block icon and sticky toolbar rendering, and clicks Perbaiki for Judul Artikel / Short Desc in Chromium, Firefox and WebKit. Keep the approved Light Mode pixel/geometry baseline tests. Actual Cloudflare deployment and live visual QA are separate release gates.


## Dark sidebar hover and Short Desc separator — October 2026

The Video Galleries hover screenshot exposed a **legacy inline selector** `#cmsNavDrawer.nr-unified-nav .nr-nav-list .cms-nav-item:hover` that set `#f1f5f9 !important`, leaving light-on-light labels. The approved Dark Mode interaction contract is:

- **Idle menu:** neutral sidebar, readable secondary text.
- **Hover:** `--nr-ui-nav-hover-bg` = `--nr-ui-hover` (`#39424D`); text and SVG `--nr-ui-nav-hover-text` = `#E8EBEF`.
- **Active:** selection `--nr-ui-nav-active-bg` = `#1B314B` with blue label/icon `#93C5FD`; hovering an active item must preserve active state.
- **Keyboard:** `:focus-visible` ring `#93C5FD`, not a light fill.
- **Passive sidebar grouping:** `--nr-ui-decorative-divider` (`#30363E`).

The Short Desc → Konten Artikel line is a real `.alt-writing-card .alt-editor-section::before` pseudo-element with the same `#30363E` quiet divider. Changing only `border-color` does not control that line. **Do not add a second outline or thicker border.**

Owned styles: `styles/newsroom-theme-components.css`; registry: `design-system/component-theme-registry.json`. Browser regression: `tests/dark-mode-sidebar-hover-separator.cjs` in Chromium/Firefox/WebKit, plus **Cloudflare live** validation on main push. Never change the shared Light Mode navigation styles to fix this Dark-specific defect.


## Navigation typography and SEO AI consolidation — October 2026

- **Navigation / Menu Label:** the design-system token `--nr-font-size-navigation:13px` is defined in `styles/newsroom-shell.css`; all Dashboard, Editor and shared sidebar link/button labels (including nested spans) use 13px in Light and Dark Mode. It must not change editor body text, headings or icons.
- **SEO action hierarchy:** the redundant "Generate SEO with AI" section and "Generate All" action are deprecated. The only primary SEO AI generation entry point is **Generate Attributes** (AI Auto). Preserve the existing Generate Attributes behavior, and do not add a parallel AI CTA.
- **QA checklist:** check Dashboard / Editor sidebar at normal and collapsed widths; both theme states; SEO tab after switching and re-render; verify no "Generate SEO with AI" card and the existing attribute generator is usable.


## Editorial metadata component reuse — 15 October 2026

**Source of truth:** `index.html` retains the original `#contentInitiative` select and exports `window.newsroomTagCatalog()` from the existing Tags suggestion data. `scripts/newsroom-editorial-reusable.js` enhances the original select and uses the original Tags field DOM structure for the Keywords field.

- **Content Initiative:** original `.field > label + select` pattern, same geometry and keyboard interaction as `#articleType`. Approved values: `Pilkada Serentak`, `Predictive Calendar`; empty placeholder `Pilih Content Initiative`. Preserve original `#contentInitiative` identity and draft/validation listeners. Position immediately after Tipe Artikel. One AI Suggestions button.
- **Keywords:** same `.tag-wrap`, `.tag-list`, `.newsroom-tag-search`, `.newsroom-tag-results`, `.tag-chip`, and `.newsroom-tag-result` element system as Editorial Tags. Use canonical `window.newsroomTagCatalog()`. Select a search result to add; Enter selects the first suggestion; chip X removes; no secondary Add button, max five, prevent duplicates. Distinct DOM IDs and state from Tags.
- **SEO linkage:** first selected Keyword is synchronized with `#seoKeyword` (primary SEO keyword), and changes to the primary SEO input update the first chip. This remains prototype-side session storage, not a backend CMS contract.
- **AI Suggestions:** Content Initiative currently uses deterministic matching from article text; Keywords matches existing Tags vocabulary against title and Short Desc. Full integration with the existing AI engine requires separate frontend work. Do not claim these are genuine AI-generated server results.
- **QA:** `tests/editorial-reusable-controls.cjs` checks both themes, original select options, no duplicate IDs, Tags/Keywords isolation, one-click suggestions, removal, and matching component radius in Chromium / Firefox / WebKit. Test against Cloudflare after deployment before design signoff.


## Editorial Team search, Add Content labels & icon-box contract — 15 October 2026

- **Canonical icon-box colors:** `--nr-icon-box-bg`, `--nr-icon-box-border`, `--nr-icon-box-ink` and `--nr-icon-box-radius`. Light Mode defaults: `#F1F5F9`, `#E2E8F0`, `#64748B`, `7px`. Dark Mode inherits semantic tokens: `--nr-ui-control`, `--nr-ui-card-border`, `--nr-ui-secondary`. Match icon box surface/border/ink everywhere while preserving icon dimensions appropriate to their context. Exceptions: success, warning and error icons retain semantic status colors; avatars are not generic icon boxes.
- **Used by:** Add Content option icons (`.alt-add-icon`), Content Block headers (`.alt-content-card-title .icon`), Import Draft source picker icons (`.source-icon`), and shared Tag/Keyword suggestion icon slots. Do not nest a second colored box or outline inside a framed icon.
- **Editorial Team — Reporter & Editor:** both use `.team-add-panel` and `.team-search-wrap`. On Dark Mode, use a single soft-outline `--nr-ui-panel` outer container, `--nr-ui-raised` input wrapper, transparent input body, readable `--nr-ui-text` text, `--nr-ui-muted` placeholders, and `--nr-ui-hover` for selectable suggestions and close affordances. Light Mode remains unchanged. The UI behavior is preserved: show suggestions, search, select member, remove member, Cancel and Escape.
- **Add Content:** all six option labels (Text, Video, Image, Embed, Klasemen, Page Break) must inherit `--nr-ui-text` in Dark Mode, not the legacy inline black `#0f172a`; helper text inherits `--nr-ui-secondary`. Icons use the shared token contract above, with distinct per-option button borders and soft hover.
- **Regression:** `tests/dark-mode-editorial-controls.cjs` tests the actual Reporter/Editor actions and option text/icon computed styles on desktop and mobile; `tests/dark-mode-popup-inventory.cjs` checks popup styles, and `tests/dark-mode-all-pages.cjs` checks general pages. Do not accept a Dark Mode QA signoff when the new Editorial controls test has failures.


### Automated SEO status icons — October 2026

Five Automated SEO entries (Article Summary, Article Schema, FAQ Schema, Entities, Image Metadata) use the same neutral `--nr-icon-box-bg`, `--nr-icon-box-border` and `--nr-icon-box-radius` as Add Content and Content Block icon boxes in Dark Mode. The icon foreground alone retains status semantics: success green, neutral secondary text, or attention orange. Do not use pale or white icon box backgrounds in Dark Mode. Light Mode is unchanged. The regression check is included in `tests/dark-mode-editorial-controls.cjs`.
