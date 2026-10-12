# Field Validation Warning — Newsroom Design System

**Status:** Approved UX pattern (12 October 2026). Reusable specification for every validated field in Workspace Editor, Editorial, SEO, and future Newsroom forms.

## Source of truth
- Existing visual motion: `newsroomAiFieldReviewRing` in `index.html` (AI Suggestions). Do not create a separate animation for validation.
- Shared presentation: `.nr-field-highlight[data-highlight-variant="warning"]` (warning orange) versus `data-highlight-variant="ai"` (AI purple).
- Warning colors: main `#f59e0b`, strong `#c2410c`, secondary `#ea580c`, light `#fb923c`. Reuse exact AI keyframes and timing (**2.2s ease-in-out infinite** while active).
- Highlight the **actual editable field or interactive selection surface**, never the outer Article section, pane, field-group container, or unrelated neighboring fields. Do not alter field width, padding, or layout.
- This is a **design-system contract**, not a requirement to copy historical prototype patches, global selectors, or JS controllers into production.

## Rules / lifecycle
| Event | Visual highlight | Validity |
|---|---|---|
| Initial workspace | No warning | May be unknown/incomplete |
| User clicks Review & Publish | Issues listed in modal; avoid page-wide highlights | Evaluate all required fields |
| User clicks Perbaiki for an issue | Close modal; open correct tab/panel; scroll and programmatically focus the relevant field; show orange pulse | Still invalid until fixed |
| No user action after navigation | Keep pulsing (no timer-based removal) | Unchanged |
| **Real user click/tap within highlighted field** | **Remove pulse immediately** | Revalidate; may remain invalid |
| **User edits value** | **Remove pulse immediately** | Revalidate |
| Valid image/media selection | Remove pulse | Revalidate |
| Programmatic focus/scroll after Perbaiki | Keep pulsing | Unchanged |
| Review & Publish again | Show still-invalid fields; Perbaiki can restart pulse | Revalidate |
| AI suggestion applied | Purple highlight with identical source animation | Independent of validation |

**Important:** Dismissing an attention pulse is not the same as marking a field valid. A blank field remains an issue in the next review even when the editor already clicked it. Don't dismiss on auto-focus, initial render, elapsed time, or a programmatic click.

## Field-agnostic implementation contract
```ts
type FieldKey = string;
type HighlightVariant = 'ai' | 'warning';
interface FieldRegistration {
  key: FieldKey;
  getTarget(): HTMLElement | null;
  getFocusTarget?(): HTMLElement | null;
  getTabId?(): string | null;
  validate(): boolean;
}
interface FieldHighlightController {
  register(field: FieldRegistration): () => void;
  review(): { invalidFields: FieldKey[] };
  goToIssue(key: FieldKey): void;
  dismissOnUserInteraction(key: FieldKey): void;
}
```

Implement this as a shared component/hook (for example `FieldHighlight` / `useFieldValidationAttention`) that applies the shared class and variant tokens. Use a field registry rather than hardcoded labels or string matching. Let a field define its focus target and associated tab; avoid assuming every field is a plain `input`.

## Supported field families
- Input, textarea, select, autocomplete / entity picker, keyword chips
- Rich-text editor / Content Block text, image uploader or picker, video URL, embed
- Date/time and any required custom controls; composite fields target their **specific interactive control**.
- Use the same contract in Editorial, SEO, and new Newsroom forms.

## Accessibility and motion
- Set `aria-invalid=true` only when validation has been performed and the value is invalid.
- Associate error instructions through `aria-describedby`; avoid relying on color/pulse alone.
- Provide visible keyboard focus and support keyboard interactions on custom controls.
- Respect `prefers-reduced-motion: reduce` with static orange emphasis.
- Keep modal close, tab navigation, scroll and focus predictable; do not scroll the page underneath an open modal.

## QA / acceptance criteria
1. Initial open: no orange outline around the whole Article or Article Settings panel.
2. Perbaiki for each error routes to exactly the correct target; opens the right tab and focuses it.
3. Warning pulse remains visible after 5+ seconds without interaction.
4. Actual click/tap into the target or input/change event stops pulse immediately.
5. Merely opening a tab or programmatically focusing the target does **not** stop pulse.
6. Subsequent Review & Publish still reports incomplete fields, and Perbaiki can pulse again.
7. AI purple behavior and warning orange share the same keyframes/timing; no layout shifts.
8. Verify desktop/mobile, expanded/collapsed side panels, Text Block sticky toolbar, and reduced motion.

## Current prototype scope
The current Workspace Editor prototype implements the pattern for its review validators (Judul Artikel, Short Desc, Konten Artikel, Reporter, Headline Image, SEO Keyword). **This document defines behavior for all field types; it does not claim every future field has already been wired into validation.** Engineer should adopt the registry and component for other required fields as they are added.
