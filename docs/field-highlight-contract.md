# Newsroom — Shared Field Highlight Contract

## Scope
One field-highlight component for AI Suggestions and Review & Publish validation. Existing prototype lives in `index.html`; production implementation should move this shared behavior into a reusable design-system component.

## API
- CSS class: `.nr-field-highlight`
- Variant: `data-highlight-variant="ai" | "warning"`
- AI: purple (`#8b5cf6`), triggered after applying an AI suggestion.
- Warning: orange (`#f59e0b`), triggered after choosing **Perbaiki** in Review & Publish.
- Motion: shared `nrSharedFieldHighlightPulse`, 650ms x 4 cycles, ~2.6 seconds.
- Reduced motion: static outline and shadow instead of animation.
- Geometry: use outline and box shadow; do not change field dimensions/padding or the parent section border.

## Behavior
1. The **Perbaiki** action closes the modal, opens the relevant Editorial or SEO pane, scrolls to and focuses the actual field, then highlights that field only.
2. If the field cannot receive focus (e.g., image chooser area), focus its accessible button and apply the warning highlight to the specific chooser surface.
3. Clear visual warning on edit/interaction or after the pulse finishes. The review check itself remains invalid until data meets validation requirements.
4. Opening the workspace does not mark blank fields as errors. Review & Publish triggers comprehensive validation.
5. Re-triggering a highlight removes and re-adds the shared class to restart motion.
6. The active field receives only one variant at a time; AI and warning variants must not fight for styling.

## Recommended React implementation
Use a shared `FieldHighlight({variant,active,children})` wrapper or hook such as `useFieldHighlight()` and a single design-system stylesheet. Validation and AI Suggestions emit events; neither should duplicate CSS keyframes.

## QA
- Apply AI to title/short description: purple pulse, no layout shift.
- Review missing headline image, reporter and SEO: correct pane/field focus, orange pulse.
- Typing/choosing image removes visual warning, but only valid data clears validation errors.
- On repeat Review & Publish, missing fields are listed again.
- Desktop/mobile with expanded or collapsed panels; sticky toolbar unaffected.
- Check `prefers-reduced-motion: reduce`.
