# CMS Newsroom — Dark Mode Design System V1

**Status:** Color and placement approved for implementation; feature branch candidate is in progress. **Not merged, fully QA-approved or live in production.**

**Baseline:** Existing Light Mode in `aviyansah-kly/newsroom` on `main`; current design-system file: `styles/newsroom-design-system.css`; Editor Workspace: `index.html`.

## 1. Scope and non-regression contract

- Dark Mode is an **additive theme**, not a redesign or color inversion.
- Keep existing Light Mode *pixel-identical* unless a change is separately approved.
- Preserve the existing Information Architecture, sidebar order, unified two-level sidebar, labels in Title Case, Inter font, typography scale, spacing, radii, control heights, form structure, tags flow, AI Suggestion behavior, validation, Review & Publish modal, Publication Status, and responsive behavior.
- Do **not** change the existing `--nr-orange: #f4511e` Light Mode token as part of this project. The brand-approved orange `#FF3300` is recorded for brand identity; a separate dark-mode action token uses `#D92B00`. Brand alignment on Light Mode is a separate decision.
- Do not invert photos, original logos, logos inside the site selector, article imagery, screenshots, or content/media previews.
- In particular, Desktop/Mobile Article Preview should reproduce the **actual frontend appearance**, regardless of CMS shell theme.
- No theme switcher in the editorial action toolbar; do not compete visually with Review & Publish.

## 2. Semantic color tokens — Dark Mode

| Semantic role | Hex | Usage |
| --- | --- | --- |
| `--nr-bg` | `#17191D` | App background |
| `--nr-header-bg` | `#1C2025` | Main header |
| `--nr-sidebar-bg` | `#1C2025` | Unified sidebar |
| `--nr-surface` | `#22262C` | Editorial panel, SEO panel, cards |
| `--nr-writing-canvas` | `#272C32` | Article editing surface |
| `--nr-input-surface` | `#2B3037` | Input, textarea, select, search |
| `--nr-elevated` | `#303740` | Hover/elevated menus/popovers |
| `--nr-border` | `#414852` | Dividers and outlines |
| `--nr-input` | `#566170` | Form control border |
| `--nr-text` | `#E8EBEF` | Main headings and article text |
| `--nr-text-2` | `#BBC3CD` | Secondary text and field labels |
| `--nr-muted` | `#A4AEBB` | Helper text and placeholders |
| `--nr-brand-orange` | `#FF3300` | Brand identity only (existing assets remain unchanged) |
| `--nr-action-primary-bg` | `#D92B00` | Primary CTA background |
| `--nr-action-primary-hover` | `#C12700` | Primary CTA hover |
| `--nr-action-primary-pressed` | `#B82500` | Primary CTA active/pressed |
| `--nr-action-primary-on` | `#FFFFFF` | Primary CTA text and icons |
| `--nr-interactive` | `#93C5FD` | Focus, interactive links, AI Suggestion |
| `--nr-selection-bg` | `#1B314B` | Active navigation/selected state |
| `--nr-success` | `#86EFAC` | Saved, published success |
| `--nr-success-soft` | `#24372B` | Success low-emphasis background |
| `--nr-warning` | `#FBBF24` | Validation warning |
| `--nr-warning-soft` | `#3D3022` | Warning low-emphasis background |
| `--nr-danger` | `#FCA5A5` | Error / destructive text |
| `--nr-danger-soft` | `#42292E` | Error low-emphasis background |

**Contrast checks:** `#FFFFFF` text on `#D92B00` primary background approximately **4.89:1** (WCAG AA normal text); `#E8EBEF` text on `#272C32` writing canvas approximately **11.77:1**. Test all state combinations in final UI at rendered opacity and font size.

## 3. Component assignments

| Component | Background | Foreground and accents |
| --- | --- | --- |
| App shell | `#17191D` | `#E8EBEF` |
| Header and sidebar | `#1C2025` | Primary/secondary text; borders `#414852` |
| Writing canvas, rich-text blocks | `#272C32` | `#E8EBEF` article text; avoid pure white |
| Right Editorial and SEO panels | `#22262C` | Headings `#E8EBEF`; labels `#BBC3CD` |
| Form inputs/dropdowns | `#2B3037` | Border `#566170`; focus `#93C5FD` |
| Primary CTA (one dominant action per context) | `#D92B00` | White text/icon `#FFFFFF` |
| Primary CTA hover/pressed | `#C12700` / `#B82500` | White text/icon |
| Secondary button | `#303740` | Text `#E8EBEF`; border `#566170` |
| Ghost/tertiary button | transparent | Text `#BBC3CD`; hover `#303740` |
| Active navigation | `#1B314B` | Blue foreground `#93C5FD`, plus structural active marker |
| AI Suggestion / links | transparent or elevated | Blue `#93C5FD`, not saturated orange |
| Validation field | Original field surface | Warning `#FBBF24` or error `#FCA5A5`; icon and copy required |
| Tags suggestion | `#303740` | Normal text; blue selection/focus; preserve click-to-add |
| Publication Status | `#22262C` | Status icon and semantic color; date metadata in two columns where room allows |
| Review & Publish modal | `#22262C` or elevated `#303740` | Dimmed backdrop, scroll lock, accessible focus states |
| Toast / snackbar | `#303740` | Accessible text + status icon |
| Disabled button | Low-emphasis surface | Muted text; disabled state must be recognizable |
| Article Desktop/Mobile Preview | **Live site colors** | Do not inherit CMS Dark Mode |

Design should convey status through **text and icons**, not color alone. Avoid colorful full-width warning/success fills. Leave real images as-is.

## 4. Proposed theme control

- **Desktop placement:** existing **profile/account menu at bottom of unified left sidebar**.
- **Mobile/tablet:** same Appearance settings within user/account menu; no duplicate standalone floating control.
- Label: **Tampilan** (align with the existing product language standard); choose **Terang**, **Gelap**, **Ikuti Sistem**. The menu can show matching Lucide `sun`, `moon`, `monitor` icons.
- Account menu pops **upward** if profile is anchored at viewport bottom. Ensure viewport collision detection and keyboard access.
- On first release, preserve **Light Mode as default for existing users**. An explicit System choice follows the OS setting.
- Persist user preference where applicable across routes and subsequent sessions; synchronize when account storage is available. Do not assume server-side sync exists.
- Set theme *before first paint* to reduce white flashes; preserve draft, autosave, focus, scroll position, selection, open modals, and role-specific menus on switching.
- The selected option has a checkmark and accessible radio semantics; do not indicate selection through color alone.

## 5. Implementation guidance — NOT YET APPLIED

1. Add `data-theme="dark"` to the document root or a stable Newsroom root only after the user selects Dark. Keep Light Mode default tokens untouched.
2. Declare scoped semantic dark tokens, e.g.:

```css
html[data-theme="dark"] {
  color-scheme: dark;
  --nr-bg: #17191D;
  --nr-surface: #22262C;
  --nr-soft: #272C32;
  --nr-hover: #303740;
  --nr-text: #E8EBEF;
  --nr-text-2: #BBC3CD;
  --nr-muted: #A4AEBB;
  --nr-border: #414852;
  --nr-input: #566170;
  --nr-header-bg: #1C2025;
  --nr-sidebar-bg: #1C2025;
  --nr-writing-canvas: #272C32;
  --nr-input-surface: #2B3037;
  --nr-elevated: #303740;
  --nr-brand-orange: #FF3300;
  --nr-action-primary-bg: #D92B00;
  --nr-action-primary-hover: #C12700;
  --nr-action-primary-pressed: #B82500;
  --nr-action-primary-on: #FFFFFF;
  --nr-interactive: #93C5FD;
  --nr-selection-bg: #1B314B;
  --nr-success: #86EFAC;
  --nr-success-soft: #24372B;
  --nr-warning: #FBBF24;
  --nr-warning-soft: #3D3022;
  --nr-danger: #FCA5A5;
  --nr-danger-soft: #42292E;
}
```

3. **Existing CSS includes hard-coded hex backgrounds/colors** (including Editor Workspace sections and shared navigation). Audit and map those styles to scoped semantic tokens instead of expecting root variables alone to cover every element.
4. Use a separate high-contrast input-boundary token `--nr-input-boundary:#718096` for meaningful form boundaries (about 3.31:1 on `#2B3037`) while leaving the lower-emphasis divider token as defined. Keep brand logo assets intact. Use **dedicated action tokens**, rather than globally changing `--nr-orange` or the current Light Mode button.
5. Avoid global CSS inversion filters or opaque overlays on canvas/media. Scope theme styling to CMS shell and editable controls; preview iframe/media should opt out.
6. Render/test primary, secondary, hover, focus-visible, disabled, loading, destructive states and layered UI (dropdown, modal, toast).
7. Complete component-by-component regression QA across Editor, editorial list/workspaces, SEO, review/publish, responsive layouts, and all roles (Writer, Editor, Redpel, SEO).
8. Check WCAG AA: target >= 4.5:1 for normal text, >= 3:1 for meaningful nontext indicators/control boundaries, keyboard focus visible, and no status conveyed by color alone.
9. Perform editorial usability checks on Light and Dark Mode during realistic writing and review sessions. Dark Mode is optional, not mandatory.

## 6. Decision record

- **Agreed:** Neutral Graphite over pure black; original Liputan6 `#FF3300` stays the brand reference.
- **Agreed:** Dark CTA `#D92B00` with **white text**; hover `#C12700`, pressed `#B82500`.
- **Agreed:** Blue used for selected, links, focus, and AI Suggestion; reserved semantic colors for status.
- **Recommended:** Theme selector in sidebar-bottom account menu, rather than crowded article editor toolbar.
- **Approved for implementation planning:** Neutral Graphite palette and switch inside the sidebar-bottom account menu. **Pending:** complete QA, Product/Frontend sign-off, production merge.


## 7. Audit and handover

Implementation scaffold is isolated to `feature/newsroom-dark-mode-v1`. The required handover and incomplete-QA release gates are documented in [DARK-MODE-AUDIT-FRONTEND-HANDOFF.md](DARK-MODE-AUDIT-FRONTEND-HANDOFF.md). Do not merge or declare feature production-ready before closing visual/functional regression gates.
