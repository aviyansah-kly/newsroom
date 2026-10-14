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
